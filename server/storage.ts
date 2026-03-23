import { db } from "./db";
import { eq, desc, and, sql, sum, gte, lte } from "drizzle-orm";
import { 
  users, profiles, groups, posts, comments, gameScores, groupMembers,
  badges, userBadges, pointsLedger, userPoints, userReports,
  spoonStatus, journalEntries, serviceProviders, resources, savedResources, jobListings,
  transportProviders, tripRequests,
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
  type UserReport, type InsertUserReport,
  type SpoonStatus, type InsertSpoonStatus,
  type JournalEntry, type InsertJournalEntry,
  type ServiceProvider, type InsertServiceProvider,
  type Resource, type InsertResource,
  type JobListing, type InsertJobListing,
  type TransportProvider, type InsertTransportProvider,
  type TripRequest, type InsertTripRequest,
  POINT_VALUES
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  makeUserAdmin(userId: string): Promise<void>;
  
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
  
  // User Reports (eSafety compliance)
  createUserReport(report: InsertUserReport): Promise<UserReport>;
  getUserReports(userId: string): Promise<UserReport[]>;
  hasReportedUser(reporterId: string, reportedUserId: string, reportType: string): Promise<boolean>;

  // Spoon Status
  setSpoonStatus(userId: string, data: InsertSpoonStatus): Promise<SpoonStatus>;
  getSpoonStatus(userId: string, date: string): Promise<SpoonStatus | undefined>;
  getSpoonHistory(userId: string, days?: number): Promise<SpoonStatus[]>;

  // Journal
  upsertJournalEntry(userId: string, data: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined>;
  listJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;

  // Service Providers
  listServiceProviders(filters?: { category?: string; state?: string; ndisRegistered?: boolean; search?: string }): Promise<ServiceProvider[]>;
  getServiceProvider(id: number): Promise<ServiceProvider | undefined>;
  createServiceProvider(data: InsertServiceProvider, submittedById: string): Promise<ServiceProvider>;
  approveServiceProvider(id: number): Promise<void>;

  // Resources
  listResources(filters?: { category?: string; search?: string }): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(data: InsertResource, addedById: string): Promise<Resource>;
  approveResource(id: number): Promise<void>;
  toggleSaveResource(userId: string, resourceId: number): Promise<{ saved: boolean }>;
  getSavedResourceIds(userId: string): Promise<number[]>;

  // Job Listings
  listJobListings(filters?: { category?: string; state?: string; type?: string; isRemote?: boolean; search?: string }): Promise<JobListing[]>;
  getJobListing(id: number): Promise<JobListing | undefined>;
  createJobListing(data: InsertJobListing, postedById: string): Promise<JobListing>;
  approveJobListing(id: number): Promise<void>;

  // Transport Providers
  listTransportProviders(filters?: { type?: string; state?: string; isWheelchairAccessible?: boolean; acceptsCompanionCard?: boolean; isNdisTransportFunded?: boolean; search?: string }): Promise<TransportProvider[]>;
  getTransportProvider(id: number): Promise<TransportProvider | undefined>;
  createTransportProvider(data: InsertTransportProvider, submittedById: string): Promise<TransportProvider>;
  approveTransportProvider(id: number): Promise<void>;

  // Trip Requests
  createTripRequest(data: InsertTripRequest, userId: string): Promise<TripRequest>;
  listMyTripRequests(userId: string): Promise<TripRequest[]>;
  cancelTripRequest(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async makeUserAdmin(userId: string): Promise<void> {
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, userId));
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
  
  // User Reports (eSafety compliance)
  async createUserReport(report: InsertUserReport): Promise<UserReport> {
    const [newReport] = await db.insert(userReports).values(report).returning();
    return newReport;
  }
  
  async getUserReports(userId: string): Promise<UserReport[]> {
    return await db.select().from(userReports)
      .where(eq(userReports.reportedUserId, userId))
      .orderBy(desc(userReports.createdAt));
  }
  
  async hasReportedUser(reporterId: string, reportedUserId: string, reportType: string): Promise<boolean> {
    const existing = await db.select().from(userReports).where(
      and(
        eq(userReports.reporterId, reporterId),
        eq(userReports.reportedUserId, reportedUserId),
        eq(userReports.reportType, reportType)
      )
    );
    return existing.length > 0;
  }

  // === SPOON STATUS ===
  async setSpoonStatus(userId: string, data: InsertSpoonStatus): Promise<SpoonStatus> {
    const existing = await this.getSpoonStatus(userId, data.date);
    if (existing) {
      const [updated] = await db.update(spoonStatus)
        .set({ spoons: data.spoons, note: data.note })
        .where(and(eq(spoonStatus.userId, userId), eq(spoonStatus.date, data.date)))
        .returning();
      return updated;
    }
    const [newEntry] = await db.insert(spoonStatus).values({ ...data, userId }).returning();
    return newEntry;
  }

  async getSpoonStatus(userId: string, date: string): Promise<SpoonStatus | undefined> {
    const [entry] = await db.select().from(spoonStatus)
      .where(and(eq(spoonStatus.userId, userId), eq(spoonStatus.date, date)));
    return entry;
  }

  async getSpoonHistory(userId: string, days: number = 30): Promise<SpoonStatus[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return await db.select().from(spoonStatus)
      .where(and(eq(spoonStatus.userId, userId), gte(spoonStatus.date, cutoffStr)))
      .orderBy(desc(spoonStatus.date));
  }

  // === JOURNAL ===
  async upsertJournalEntry(userId: string, data: InsertJournalEntry): Promise<JournalEntry> {
    const existing = await this.getJournalEntry(userId, data.date);
    if (existing) {
      const [updated] = await db.update(journalEntries)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, data.date)))
        .returning();
      return updated;
    }
    const [newEntry] = await db.insert(journalEntries).values({ ...data, userId }).returning();
    return newEntry;
  }

  async getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, date)));
    return entry;
  }

  async listJournalEntries(userId: string, limit: number = 30): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date))
      .limit(limit);
  }

  // === SERVICE PROVIDERS ===
  async listServiceProviders(filters?: { category?: string; state?: string; ndisRegistered?: boolean; search?: string }): Promise<ServiceProvider[]> {
    const conditions = [eq(serviceProviders.approved, true)];
    if (filters?.category) conditions.push(eq(serviceProviders.category, filters.category));
    if (filters?.state) conditions.push(eq(serviceProviders.state, filters.state));
    if (filters?.ndisRegistered !== undefined) conditions.push(eq(serviceProviders.ndisRegistered, filters.ndisRegistered));
    if (filters?.search) conditions.push(sql`${serviceProviders.name} ILIKE ${`%${filters.search}%`}`);
    return await db.select().from(serviceProviders).where(and(...conditions)).orderBy(serviceProviders.name);
  }

  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async createServiceProvider(data: InsertServiceProvider, submittedById: string): Promise<ServiceProvider> {
    const [newProvider] = await db.insert(serviceProviders).values({ ...data, submittedById, approved: false }).returning();
    return newProvider;
  }

  async approveServiceProvider(id: number): Promise<void> {
    await db.update(serviceProviders).set({ approved: true }).where(eq(serviceProviders.id, id));
  }

  // === RESOURCES ===
  async listResources(filters?: { category?: string; search?: string }): Promise<Resource[]> {
    const conditions = [eq(resources.approved, true)];
    if (filters?.category) conditions.push(eq(resources.category, filters.category));
    if (filters?.search) conditions.push(sql`(${resources.title} ILIKE ${`%${filters.search}%`} OR ${resources.description} ILIKE ${`%${filters.search}%`})`);
    return await db.select().from(resources).where(and(...conditions)).orderBy(desc(resources.saves));
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(data: InsertResource, addedById: string): Promise<Resource> {
    const [newResource] = await db.insert(resources).values({ ...data, addedById, approved: false }).returning();
    return newResource;
  }

  async approveResource(id: number): Promise<void> {
    await db.update(resources).set({ approved: true }).where(eq(resources.id, id));
  }

  async toggleSaveResource(userId: string, resourceId: number): Promise<{ saved: boolean }> {
    const existing = await db.select().from(savedResources)
      .where(and(eq(savedResources.userId, userId), eq(savedResources.resourceId, resourceId)));
    if (existing.length > 0) {
      await db.delete(savedResources).where(and(eq(savedResources.userId, userId), eq(savedResources.resourceId, resourceId)));
      await db.update(resources).set({ saves: sql`saves - 1` }).where(eq(resources.id, resourceId));
      return { saved: false };
    }
    await db.insert(savedResources).values({ userId, resourceId });
    await db.update(resources).set({ saves: sql`saves + 1` }).where(eq(resources.id, resourceId));
    return { saved: true };
  }

  async getSavedResourceIds(userId: string): Promise<number[]> {
    const saved = await db.select({ resourceId: savedResources.resourceId }).from(savedResources).where(eq(savedResources.userId, userId));
    return saved.map(s => s.resourceId);
  }

  // === JOB LISTINGS ===
  async listJobListings(filters?: { category?: string; state?: string; type?: string; isRemote?: boolean; search?: string }): Promise<JobListing[]> {
    const conditions = [eq(jobListings.approved, true)];
    if (filters?.category) conditions.push(eq(jobListings.category, filters.category));
    if (filters?.state) conditions.push(eq(jobListings.state, filters.state));
    if (filters?.type) conditions.push(eq(jobListings.type, filters.type));
    if (filters?.isRemote !== undefined) conditions.push(eq(jobListings.isRemote, filters.isRemote));
    if (filters?.search) conditions.push(sql`(${jobListings.title} ILIKE ${`%${filters.search}%`} OR ${jobListings.company} ILIKE ${`%${filters.search}%`})`);
    return await db.select().from(jobListings).where(and(...conditions)).orderBy(desc(jobListings.createdAt));
  }

  async getJobListing(id: number): Promise<JobListing | undefined> {
    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, id));
    return job;
  }

  async createJobListing(data: InsertJobListing, postedById: string): Promise<JobListing> {
    const [newJob] = await db.insert(jobListings).values({ ...data, postedById, approved: false }).returning();
    return newJob;
  }

  async approveJobListing(id: number): Promise<void> {
    await db.update(jobListings).set({ approved: true }).where(eq(jobListings.id, id));
  }

  // === TRANSPORT PROVIDERS ===
  async listTransportProviders(filters?: { type?: string; state?: string; isWheelchairAccessible?: boolean; acceptsCompanionCard?: boolean; isNdisTransportFunded?: boolean; search?: string }): Promise<TransportProvider[]> {
    const conditions = [eq(transportProviders.approved, true)];
    if (filters?.type) conditions.push(eq(transportProviders.type, filters.type));
    if (filters?.state) conditions.push(eq(transportProviders.state, filters.state));
    if (filters?.isWheelchairAccessible) conditions.push(eq(transportProviders.isWheelchairAccessible, true));
    if (filters?.acceptsCompanionCard) conditions.push(eq(transportProviders.acceptsCompanionCard, true));
    if (filters?.isNdisTransportFunded) conditions.push(eq(transportProviders.isNdisTransportFunded, true));
    if (filters?.search) conditions.push(sql`${transportProviders.name} ILIKE ${`%${filters.search}%`}`);
    return await db.select().from(transportProviders).where(and(...conditions)).orderBy(transportProviders.name);
  }

  async getTransportProvider(id: number): Promise<TransportProvider | undefined> {
    const [provider] = await db.select().from(transportProviders).where(eq(transportProviders.id, id));
    return provider;
  }

  async createTransportProvider(data: InsertTransportProvider, submittedById: string): Promise<TransportProvider> {
    const [newProvider] = await db.insert(transportProviders).values({ ...data, submittedById, approved: false }).returning();
    return newProvider;
  }

  async approveTransportProvider(id: number): Promise<void> {
    await db.update(transportProviders).set({ approved: true }).where(eq(transportProviders.id, id));
  }

  // === TRIP REQUESTS ===
  async createTripRequest(data: InsertTripRequest, userId: string): Promise<TripRequest> {
    const [request] = await db.insert(tripRequests).values({ ...data, userId, status: "pending" }).returning();
    return request;
  }

  async listMyTripRequests(userId: string): Promise<TripRequest[]> {
    return await db.select().from(tripRequests).where(eq(tripRequests.userId, userId)).orderBy(desc(tripRequests.createdAt));
  }

  async cancelTripRequest(id: number, userId: string): Promise<void> {
    await db.update(tripRequests).set({ status: "cancelled" }).where(and(eq(tripRequests.id, id), eq(tripRequests.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
