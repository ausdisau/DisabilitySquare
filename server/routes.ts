import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth0, registerAuth0Routes, isAuthenticated } from "./auth0";
import { api } from "@shared/routes";
import { z } from "zod";

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
      const group = await storage.createGroup({
        ...input,
        createdById: req.userId || req.oidc?.user?.sub,
      });
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
      const post = await storage.createPost({
        ...input,
        authorId: req.userId || req.oidc?.user?.sub,
      });
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
      const comment = await storage.createComment({
        ...input,
        authorId: req.userId || req.oidc?.user?.sub,
      });
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

  return httpServer;
}
