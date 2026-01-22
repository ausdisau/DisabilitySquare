import type { Express, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth0, registerAuth0Routes, isAuthenticated } from "./auth0";
import { api } from "@shared/routes";
import { z } from "zod";
import { POINT_VALUES, EXTENSION_EVENTS, EXTENSION_PERMISSIONS } from "@shared/schema";
import { extensionManager } from "./extensions";

// Middleware to check if user is admin (persisted in database)
const isAdmin = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId || req.oidc?.user?.sub;
  
  if (!userId) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const user = await storage.getUser(userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth0 Setup
  setupAuth0(app);
  registerAuth0Routes(app);

  // === PROFILES ===
  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.put(api.profiles.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const input = api.profiles.update.input.parse(req.body);
      let profile = await storage.getProfile(userId);
      if (!profile) {
        profile = await storage.createProfile({ userId, ...input } as any);
      } else {
        profile = await storage.updateProfile(userId, input);
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === GROUPS ===
  app.get(api.groups.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const groups = await storage.listGroups(category, search);
    res.json(groups);
  });

  app.get(api.groups.get.path, async (req, res) => {
    const group = await storage.getGroup(Number(req.params.id));
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  });

  app.post(api.groups.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.groups.create.input.parse(req.body);
      const userId = req.userId || req.oidc?.user?.sub;
      const group = await storage.createGroup({
        ...input,
        createdById: userId,
      });
      
      // Award points for creating a group
      await storage.awardPoints({
        userId,
        points: POINT_VALUES.FIRST_POST_IN_GROUP,
        actionType: 'group_created',
        description: `Created group: "${group.name}"`,
      });
      
      // Emit extension event
      await extensionManager.emit(EXTENSION_EVENTS.GROUP_CREATED, { group }, userId);
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === POSTS ===
  app.get(api.posts.list.path, async (req, res) => {
    const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
    const tag = req.query.tag as string | undefined;
    const posts = await storage.listPosts(groupId, tag);
    res.json(posts);
  });

  app.post(api.posts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const userId = req.userId || req.oidc?.user?.sub;
      const post = await storage.createPost({
        ...input,
        authorId: userId,
      });
      
      // Award points for creating a post
      await storage.awardPoints({
        userId,
        points: POINT_VALUES.POST_CREATED,
        actionType: 'post_created',
        description: `Created post: "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
      });
      
      // Emit extension event
      await extensionManager.emit(EXTENSION_EVENTS.POST_CREATED, { post }, userId);
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  // === COMMENTS ===
  app.post(api.comments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.comments.create.input.parse(req.body);
      const userId = req.userId || req.oidc?.user?.sub;
      const comment = await storage.createComment({
        ...input,
        authorId: userId,
      });
      
      // Get the post to check if this is a cross-user interaction
      const post = await storage.getPost(input.postId);
      const isThoughtful = input.content.length > 100;
      const isCrossUser = post && post.authorId !== userId;
      
      // Award base points for commenting
      let points = POINT_VALUES.COMMENT_CREATED;
      let actionType = 'comment_created';
      
      if (isThoughtful) {
        points = POINT_VALUES.THOUGHTFUL_COMMENT;
        actionType = 'thoughtful_comment';
      }
      
      await storage.awardPoints({
        userId,
        points,
        actionType,
        description: `Commented on a post`,
        relatedUserId: isCrossUser ? post.authorId : undefined,
      });
      
      // If cross-user interaction, also give points to post author
      if (isCrossUser) {
        await storage.awardPoints({
          userId: post.authorId,
          points: POINT_VALUES.REPLY_TO_OTHER,
          actionType: 'received_engagement',
          description: `Someone engaged with your post`,
          relatedUserId: userId,
        });
      }
      
      // Emit extension event
      await extensionManager.emit(EXTENSION_EVENTS.COMMENT_CREATED, { comment, post }, userId);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === GAMES ===
  app.post(api.games.submitScore.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.games.submitScore.input.parse(req.body);
      const score = await storage.createGameScore({
        ...input,
        userId: req.userId || req.oidc?.user?.sub,
      });
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.games.leaderboard.path, async (req, res) => {
    const leaderboard = await storage.getLeaderboard(req.params.gameName);
    res.json(leaderboard);
  });

  // === VALORIZATION SYSTEM ===
  
  // Get current user's points
  app.get(api.valorization.myPoints.path, isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    let points = await storage.getUserPoints(userId);
    if (!points) {
      points = await storage.initializeUserPoints(userId);
    }
    res.json(points);
  });

  // Get any user's points
  app.get(api.valorization.userPoints.path, async (req, res) => {
    const points = await storage.getUserPoints(req.params.userId);
    if (!points) {
      return res.status(404).json({ message: "User points not found" });
    }
    res.json(points);
  });

  // Get points leaderboard
  app.get(api.valorization.leaderboard.path, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const leaderboard = await storage.getPointsLeaderboard(limit);
    res.json(leaderboard);
  });

  // Get current user's badges
  app.get(api.valorization.myBadges.path, isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const userBadges = await storage.getUserBadges(userId);
    res.json(userBadges);
  });

  // Get any user's badges
  app.get(api.valorization.userBadges.path, async (req, res) => {
    const userBadges = await storage.getUserBadges(req.params.userId);
    res.json(userBadges);
  });

  // Get all available badges
  app.get(api.valorization.allBadges.path, async (req, res) => {
    const allBadges = await storage.getAllBadges();
    res.json(allBadges);
  });

  // Get recent achievements (activity feed)
  app.get(api.valorization.recentAchievements.path, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const achievements = await storage.getRecentAchievements(limit);
    res.json(achievements);
  });

  // === USER REPORTS (eSafety compliance) ===
  
  // Report a user (e.g., for being underage)
  app.post("/api/reports", isAuthenticated, async (req: any, res) => {
    const reporterId = req.userId || req.oidc?.user?.sub;
    
    try {
      const schema = z.object({
        reportedUserId: z.string().min(1),
        reportType: z.enum(['underage', 'harassment', 'inappropriate_content', 'spam', 'other']),
        reason: z.string().optional(),
      });
      
      const input = schema.parse(req.body);
      
      // Prevent self-reporting
      if (input.reportedUserId === reporterId) {
        return res.status(400).json({ message: "You cannot report yourself" });
      }
      
      // Check if user has already reported this person for this reason
      const alreadyReported = await storage.hasReportedUser(
        reporterId, 
        input.reportedUserId, 
        input.reportType
      );
      
      if (alreadyReported) {
        return res.status(400).json({ message: "You have already submitted this report" });
      }
      
      const report = await storage.createUserReport({
        reporterId,
        reportedUserId: input.reportedUserId,
        reportType: input.reportType,
        reason: input.reason,
        status: 'pending',
      });
      
      res.status(201).json({ success: true, reportId: report.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Check if current user has reported another user (for UI feedback)
  app.get("/api/reports/check/:userId/:reportType", isAuthenticated, async (req: any, res) => {
    const reporterId = req.userId || req.oidc?.user?.sub;
    const { userId, reportType } = req.params;
    
    const hasReported = await storage.hasReportedUser(reporterId, userId, reportType);
    res.json({ hasReported });
  });

  // === EXTENSION ROUTES ===

  // Get all extensions
  app.get(api.extensions.list.path, async (req, res) => {
    const allExtensions = await extensionManager.getAllExtensions();
    res.json(allExtensions);
  });

  // Get available event types
  app.get(api.extensions.events.path, async (req, res) => {
    res.json(Object.values(EXTENSION_EVENTS));
  });

  // Get available permissions
  app.get(api.extensions.permissions.path, async (req, res) => {
    res.json(Object.values(EXTENSION_PERMISSIONS));
  });

  // Get single extension
  app.get(api.extensions.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    res.json(ext);
  });

  // Install extension (admin only)
  app.post(api.extensions.install.path, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = api.extensions.install.input.parse(req.body);
      const ext = await extensionManager.installExtension(parsed, parsed.entryPoint);
      res.status(201).json(ext);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Enable extension (admin only)
  app.post(api.extensions.enable.path, isAuthenticated, isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    await extensionManager.enableExtension(id);
    res.json({ success: true });
  });

  // Disable extension (admin only)
  app.post(api.extensions.disable.path, isAuthenticated, isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    await extensionManager.disableExtension(id);
    res.json({ success: true });
  });

  // Uninstall extension (admin only)
  app.delete(api.extensions.uninstall.path, isAuthenticated, isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    await extensionManager.uninstallExtension(id);
    res.json({ success: true });
  });

  // Update extension config (admin only)
  app.put(api.extensions.updateConfig.path, isAuthenticated, isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    await extensionManager.updateExtensionConfig(id, req.body);
    res.json({ success: true });
  });

  // Get extension logs (admin only)
  app.get(api.extensions.logs.path, isAuthenticated, isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const ext = await extensionManager.getExtension(id);
    if (!ext) {
      return res.status(404).json({ message: 'Extension not found' });
    }
    const logs = await extensionManager.getExtensionLogs(id);
    res.json(logs);
  });

  // === HCAPTCHA & AGE VERIFICATION ===
  
  // Get hCaptcha site key (public, safe to expose)
  app.get('/api/config/hcaptcha', (req, res) => {
    res.json({ siteKey: process.env.HCAPTCHA_SITE_KEY || '' });
  });

  // Verify hCaptcha token
  app.post('/api/verify-captcha', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Captcha token required' });
      }

      const secretKey = process.env.HCAPTCHA_SECRET_KEY;
      if (!secretKey) {
        return res.status(500).json({ success: false, message: 'hCaptcha not configured' });
      }

      const response = await fetch('https://api.hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      });

      const data = await response.json() as { success: boolean; 'error-codes'?: string[] };
      
      if (data.success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Captcha verification failed',
          errors: data['error-codes'] 
        });
      }
    } catch (error) {
      console.error('hCaptcha verification error:', error);
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  });

  // Update profile with age verification
  app.post('/api/verify-age', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId || req.oidc?.user?.sub;
      const { dateOfBirth } = req.body;
      
      if (!dateOfBirth) {
        return res.status(400).json({ success: false, message: 'Date of birth required' });
      }

      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 16) {
        return res.status(403).json({ 
          success: false, 
          message: 'You must be at least 16 years old to use DisabilitySquare' 
        });
      }

      let profile = await storage.getProfile(userId);
      if (!profile) {
        profile = await storage.createProfile({ 
          userId, 
          dateOfBirth: dob,
          ageVerified: true,
          ageVerifiedAt: new Date()
        } as any);
      } else {
        profile = await storage.updateProfile(userId, {
          dateOfBirth: dob,
          ageVerified: true,
          ageVerifiedAt: new Date()
        } as any);
      }

      res.json({ success: true, profile });
    } catch (error) {
      console.error('Age verification error:', error);
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  });

  // === VOICE TRANSCRIPTION (Accessibility Feature) ===
  const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB limit
  
  app.post('/api/transcribe', isAuthenticated, async (req: any, res) => {
    try {
      const { audio } = req.body;
      if (!audio) {
        return res.status(400).json({ message: 'Audio data required' });
      }
      
      if (typeof audio !== 'string' || audio.length > MAX_AUDIO_SIZE * 1.37) {
        return res.status(400).json({ message: 'Audio file too large (max 10MB)' });
      }
      
      const { speechToText, ensureCompatibleFormat } = await import('./replit_integrations/audio/client');
      
      const rawBuffer = Buffer.from(audio, 'base64');
      if (rawBuffer.length > MAX_AUDIO_SIZE) {
        return res.status(400).json({ message: 'Audio file too large (max 10MB)' });
      }
      
      const { buffer: audioBuffer, format } = await ensureCompatibleFormat(rawBuffer);
      const transcript = await speechToText(audioBuffer, format);
      
      if (!transcript || transcript.trim() === '') {
        return res.json({ transcript: '', message: 'No speech detected' });
      }
      
      res.json({ transcript });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Failed to transcribe audio. Please try again.' });
    }
  });

  return httpServer;
}
