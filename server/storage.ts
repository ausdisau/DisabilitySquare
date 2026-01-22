import { db } from "./db";
import { eq, desc, and, sql, sum } from "drizzle-orm";
import { 
  users, profiles, groups, posts, comments, gameScores, groupMembers,
  badges, userBadges, pointsLedger, userPoints,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Group, type InsertGroup,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type GameScore, type InsertGameScore,
  type Badge, type InsertBadge,
  type UserBadge, type InsertUserBadge,
  type PointsLedgerEntry, type InsertPointsLedgerEntry,
  type UserPoints, type InsertUserPoints,
  POINT_VALUES
} from "@shared/schema";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth stuff (delegated or re-implemented if needed, but we use authStorage for that)
  getUser(id: string): Promise<User | undefined>;
  
  // Profile
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;

  // Groups
  listGroups(category?: string, search?: string): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  
  // Posts
  listPosts(groupId?: number, tag?: string): Promise<(Post & { author: User })[]>;
  getPost(id: number): Promise<(Post & { comments: (Comment & { author: User })[] }) | undefined>;
  createPost(post: InsertPost): Promise<Post>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;

  // Games
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getLeaderboard(gameName: string): Promise<(GameScore & { user: User })[]>;

  // Valorization System
  awardPoints(entry: InsertPointsLedgerEntry): Promise<PointsLedgerEntry>;
  getUserPoints(userId: string): Promise<UserPoints | undefined>;
  getPointsLeaderboard(limit?: number): Promise<(UserPoints & { user: User })[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: number): Promise<UserBadge>;
  getAllBadges(): Promise<Badge[]>;
  getRecentAchievements(limit?: number): Promise<(PointsLedgerEntry & { user: User })[]>;
  initializeUserPoints(userId: string): Promise<UserPoints>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, profileUpdate: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db.update(profiles)
      .set(profileUpdate)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async listGroups(category?: string, search?: string): Promise<Group[]> {
    let query = db.select().from(groups);
    const conditions = [];
    if (category) conditions.push(eq(groups.category, category));
    if (search) conditions.push(sql`${groups.name} ILIKE ${`%${search}%`}`); // Simple search
    
    if (conditions.length > 0) {
      // @ts-ignore - drizzle type inference can be tricky with dynamic where
      return await query.where(and(...conditions));
    }
    return await query;
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async listPosts(groupId?: number, tag?: string): Promise<(Post & { author: User })[]> {
    const conditions = [];
    if (groupId) conditions.push(eq(posts.groupId, groupId));
    // Tag filtering would require JSONB containment check, simpler to skip or do basic if needed. 
    // Drizzle has limited JSONB operator support in some versions, but we'll try basic approach or skip tag for now if complex.
    
    const result = await db.query.posts.findMany({
      where: groupId ? eq(posts.groupId, groupId) : undefined,
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
      }
    });
    
    // Manual filter for tags if needed (since it's jsonb)
    if (tag) {
      return result.filter(p => (p.tags as string[])?.includes(tag)) as any;
    }
    return result as any;
  }

  async getPost(id: number): Promise<(Post & { comments: (Comment & { author: User })[] }) | undefined> {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        comments: {
          with: { author: true },
          orderBy: [desc(comments.createdAt)]
        }
      }
    });
    return post as any;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async createGameScore(score: InsertGameScore): Promise<GameScore> {
    const [newScore] = await db.insert(gameScores).values(score).returning();
    return newScore;
  }

  async getLeaderboard(gameName: string): Promise<(GameScore & { user: User })[]> {
    const scores = await db.query.gameScores.findMany({
      where: eq(gameScores.gameName, gameName),
      orderBy: [desc(gameScores.score)],
      limit: 10,
      with: {
        user: true
      }
    });
    return scores as any;
  }

  // === VALORIZATION SYSTEM ===

  async initializeUserPoints(userId: string): Promise<UserPoints> {
    const existing = await this.getUserPoints(userId);
    if (existing) return existing;
    
    const [newRecord] = await db.insert(userPoints).values({
      userId,
      totalPoints: 0,
      level: 1,
    }).returning();
    return newRecord;
  }

  async awardPoints(entry: InsertPointsLedgerEntry): Promise<PointsLedgerEntry> {
    // Create ledger entry
    const [ledgerEntry] = await db.insert(pointsLedger).values(entry).returning();
    
    // Update or create user points record
    const existing = await this.getUserPoints(entry.userId);
    let newTotal = entry.points;
    if (existing) {
      newTotal = existing.totalPoints + entry.points;
      const newLevel = Math.floor(newTotal / 100) + 1; // Level up every 100 points
      await db.update(userPoints)
        .set({ 
          totalPoints: newTotal, 
          level: newLevel,
          updatedAt: new Date() 
        })
        .where(eq(userPoints.userId, entry.userId));
    } else {
      await db.insert(userPoints).values({
        userId: entry.userId,
        totalPoints: entry.points,
        level: 1,
      });
    }
    
    // Check and award badges based on new total points
    await this.checkAndAwardBadges(entry.userId, newTotal);
    
    return ledgerEntry;
  }

  private async checkAndAwardBadges(userId: string, totalPoints: number): Promise<void> {
    // Get all badges the user doesn't have yet
    const allBadgesList = await this.getAllBadges();
    const userBadgesList = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badgeId));
    
    // Award badges where user meets the points threshold
    for (const badge of allBadgesList) {
      if (!earnedBadgeIds.has(badge.id) && totalPoints >= badge.pointsRequired) {
        await this.awardBadge(userId, badge.id);
      }
    }
  }

  async getUserPoints(userId: string): Promise<UserPoints | undefined> {
    const [record] = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    return record;
  }

  async getPointsLeaderboard(limit: number = 10): Promise<(UserPoints & { user: User })[]> {
    const leaders = await db.query.userPoints.findMany({
      orderBy: [desc(userPoints.totalPoints)],
      limit,
      with: {
        user: true
      }
    });
    return leaders as any;
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadgesList = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
      with: {
        badge: true
      }
    });
    return userBadgesList as any;
  }

  async awardBadge(userId: string, badgeId: number): Promise<UserBadge> {
    // Check if already has badge
    const existing = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    if (existing.length > 0) return existing[0];
    
    const [newBadge] = await db.insert(userBadges).values({
      userId,
      badgeId,
    }).returning();
    return newBadge;
  }

  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getRecentAchievements(limit: number = 20): Promise<(PointsLedgerEntry & { user: User })[]> {
    const recent = await db.query.pointsLedger.findMany({
      orderBy: [desc(pointsLedger.createdAt)],
      limit,
      with: {
        user: true
      }
    });
    return recent as any;
  }
}

export const storage = new DatabaseStorage();
