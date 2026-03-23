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

  // === SPOON STATUS ===
  app.get('/api/spoons/today', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const today = new Date().toISOString().split('T')[0];
    const status = await storage.getSpoonStatus(userId, today);
    res.json(status || null);
  });

  app.post('/api/spoons', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const schema = z.object({ spoons: z.number().int().min(1).max(12), note: z.string().optional(), date: z.string() });
      const input = schema.parse(req.body);
      const status = await storage.setSpoonStatus(userId, input);
      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/spoons/history', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const days = req.query.days ? Number(req.query.days) : 30;
    const history = await storage.getSpoonHistory(userId, days);
    res.json(history);
  });

  // === JOURNAL ===
  app.get('/api/journal', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const entries = await storage.listJournalEntries(userId, limit);
    res.json(entries);
  });

  app.get('/api/journal/:date', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const entry = await storage.getJournalEntry(userId, req.params.date);
    res.json(entry || null);
  });

  app.post('/api/journal', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const schema = z.object({
        date: z.string(),
        mood: z.number().int().min(1).max(5),
        symptoms: z.array(z.string()).optional().default([]),
        painLevel: z.number().int().min(0).max(10).optional(),
        energyLevel: z.number().int().min(1).max(10).optional(),
        notes: z.string().optional(),
        isPrivate: z.boolean().optional().default(true),
      });
      const input = schema.parse(req.body);
      const entry = await storage.upsertJournalEntry(userId, input as any);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // === SERVICE PROVIDERS ===
  app.get('/api/providers', async (req, res) => {
    const filters = {
      category: req.query.category as string | undefined,
      state: req.query.state as string | undefined,
      ndisRegistered: req.query.ndisRegistered === 'true' ? true : req.query.ndisRegistered === 'false' ? false : undefined,
      search: req.query.search as string | undefined,
    };
    const providers = await storage.listServiceProviders(filters);
    res.json(providers);
  });

  app.get('/api/providers/:id', async (req, res) => {
    const provider = await storage.getServiceProvider(Number(req.params.id));
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  });

  app.post('/api/providers', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const schema = z.object({
        name: z.string().min(2),
        category: z.enum(['allied_health', 'support_worker', 'accommodation', 'employment', 'legal', 'mental_health', 'equipment', 'other']),
        description: z.string().min(10),
        location: z.string().min(2),
        state: z.string().min(2),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        ndisRegistered: z.boolean().optional().default(false),
        acceptsNdis: z.boolean().optional().default(false),
        disabilityTypes: z.array(z.string()).optional().default([]),
      });
      const input = schema.parse(req.body);
      const provider = await storage.createServiceProvider(input as any, userId);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/providers/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    await storage.approveServiceProvider(Number(req.params.id));
    res.json({ success: true });
  });

  // === RESOURCES ===
  app.get('/api/resources', async (req, res) => {
    const filters = {
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
    };
    const resourcesList = await storage.listResources(filters);
    res.json(resourcesList);
  });

  app.get('/api/resources/saved', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const savedIds = await storage.getSavedResourceIds(userId);
    res.json(savedIds);
  });

  app.post('/api/resources/:id/save', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    const result = await storage.toggleSaveResource(userId, Number(req.params.id));
    res.json(result);
  });

  app.post('/api/resources', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const schema = z.object({
        title: z.string().min(2),
        description: z.string().min(10),
        url: z.string().url(),
        category: z.enum(['ndis', 'mental_health', 'employment', 'legal', 'housing', 'community', 'research', 'tools']),
        tags: z.array(z.string()).optional().default([]),
        source: z.string().min(2),
        isAustralian: z.boolean().optional().default(true),
      });
      const input = schema.parse(req.body);
      const resource = await storage.createResource(input as any, userId);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/resources/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    await storage.approveResource(Number(req.params.id));
    res.json({ success: true });
  });

  // === JOB LISTINGS ===
  app.get('/api/jobs', async (req, res) => {
    const filters = {
      category: req.query.category as string | undefined,
      state: req.query.state as string | undefined,
      type: req.query.type as string | undefined,
      isRemote: req.query.isRemote === 'true' ? true : req.query.isRemote === 'false' ? false : undefined,
      search: req.query.search as string | undefined,
    };
    const jobs = await storage.listJobListings(filters);
    res.json(jobs);
  });

  app.get('/api/jobs/:id', async (req, res) => {
    const job = await storage.getJobListing(Number(req.params.id));
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    const userId = req.userId || req.oidc?.user?.sub;
    try {
      const schema = z.object({
        title: z.string().min(2),
        company: z.string().min(2),
        description: z.string().min(10),
        location: z.string().min(2),
        state: z.string().min(2),
        type: z.enum(['full_time', 'part_time', 'casual', 'volunteer', 'contract']),
        salary: z.string().optional(),
        category: z.enum(['admin', 'healthcare', 'tech', 'creative', 'education', 'retail', 'trades', 'other']),
        tags: z.array(z.string()).optional().default([]),
        isRemote: z.boolean().optional().default(false),
        isAccessible: z.boolean().optional().default(false),
        disabilityWelcome: z.boolean().optional().default(false),
        applyUrl: z.string().url().optional(),
        applyEmail: z.string().email().optional(),
        expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined),
      });
      const input = schema.parse(req.body);
      const job = await storage.createJobListing(input as any, userId);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/jobs/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    await storage.approveJobListing(Number(req.params.id));
    res.json({ success: true });
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
