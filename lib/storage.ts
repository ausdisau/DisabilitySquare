import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { 
  users, profiles, groups, posts, comments, gameScores,
  type Profile, type InsertProfile,
  type Group, type InsertGroup,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type GameScore, type InsertGameScore
} from "../shared/schema";

export const storage = {
  // Profiles
  async getProfile(userId: string) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  },

  async upsertProfile(userId: string, data: Partial<InsertProfile>) {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db.update(profiles)
        .set(data)
        .where(eq(profiles.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(profiles)
      .values({ ...data, userId } as any)
      .returning();
    return created;
  },

  // Groups
  async listGroups(category?: string, search?: string) {
    let query = db.select().from(groups);
    if (category) {
      return await db.select().from(groups).where(eq(groups.category, category));
    }
    if (search) {
      return await db.select().from(groups).where(sql`${groups.name} ILIKE ${`%${search}%`}`);
    }
    return await query;
  },

  async getGroup(id: number) {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  },

  async createGroup(data: InsertGroup & { createdById: string }) {
    const [group] = await db.insert(groups).values(data).returning();
    return group;
  },

  // Posts
  async listPosts(groupId?: number) {
    const result = await db.query.posts.findMany({
      where: groupId ? eq(posts.groupId, groupId) : undefined,
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
      }
    });
    return result;
  },

  async getPost(id: number) {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
        comments: {
          with: { author: true },
          orderBy: [desc(comments.createdAt)]
        }
      }
    });
    return post;
  },

  async createPost(data: InsertPost & { authorId: string }) {
    const [post] = await db.insert(posts).values(data).returning();
    return post;
  },

  // Comments
  async createComment(data: InsertComment & { authorId: string }) {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  },

  // Games
  async createGameScore(data: InsertGameScore & { userId: string }) {
    const [score] = await db.insert(gameScores).values(data).returning();
    return score;
  },

  async getLeaderboard(gameName: string) {
    const scores = await db.query.gameScores.findMany({
      where: eq(gameScores.gameName, gameName),
      orderBy: [desc(gameScores.score)],
      limit: 10,
      with: {
        user: true
      }
    });
    return scores;
  },
};
