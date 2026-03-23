import { db } from "./db";
import { eq, desc, and, sql, sum, gte, lte, lt, inArray, ne } from "drizzle-orm";
import { 
  users, profiles, groups, posts, comments, gameScores, groupMembers,
  badges, userBadges, pointsLedger, userPoints, userReports,
  spoonStatus, journalEntries, serviceProviders, resources, savedResources, jobListings,
  transportProviders, transportVehicles, tripQuotes, trips,
  postReactions,
  forumCategories, forumThreads, forumReplies, forumVotes,
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
  type TransportVehicle, type InsertTransportVehicle,
  type TripQuote, type InsertTripQuote,
  type Trip, type InsertTrip,
  type PostReaction,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumReply, type InsertForumReply,
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
  listAllReports(status?: string): Promise<UserReport[]>;
  updateReportStatus(id: number, status: string, reviewedBy: string, adminNotes?: string): Promise<UserReport | undefined>;

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

  // Reactions (empathetic reactions: hug, me_too, helpful, inspiring)
  addReaction(postId: number, userId: string, reactionType: string): Promise<PostReaction>;
  removeReaction(postId: number, userId: string): Promise<void>;
  getReactionCounts(postId: number): Promise<Record<string, number>>;
  getUserReaction(postId: number, userId: string): Promise<PostReaction | undefined>;
  getReactionCountsBulk(postIds: number[]): Promise<Record<number, Record<string, number>>>;

  // Peer Connect — find users with matching diagnosis or interests
  getPeerMatches(userId: string, limit?: number): Promise<(User & { profile: Profile | null })[]>;
  listAllProfiles(): Promise<(User & { profile: Profile | null })[]>;

  // Community Forums
  seedForumCategories(): Promise<void>;
  listForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(slug: string): Promise<ForumCategory | undefined>;
  listForumThreads(categoryId: number, limit?: number): Promise<(ForumThread & { author: User })[]>;
  getForumThread(id: number, repliesPage?: number, repliesLimit?: number): Promise<(ForumThread & { author: User; replies: (ForumReply & { author: User })[]; totalReplies: number }) | undefined>;
  createForumThread(data: InsertForumThread, authorId: string): Promise<ForumThread>;
  createForumReply(data: InsertForumReply, authorId: string): Promise<ForumReply>;
  toggleForumVote(userId: string, entityType: string, entityId: number): Promise<{ voted: boolean; count: number; recipientId?: string }>;
  getUserForumVotes(userId: string, entityType: string, entityIds: number[]): Promise<number[]>;
  markAcceptedAnswer(threadId: number, replyId: number, requestingUserId: string): Promise<{ replyAuthorId: string; wasAlreadyAccepted: boolean }>;

  // Public stats (unauthenticated)
  getPublicStats(): Promise<{ memberCount: number; threadCount: number; replyCount: number }>;
  getPublicRecentActivity(limit?: number): Promise<{ id: number; title: string; categorySlug: string; createdAt: Date | null }[]>;

  // Transport Module
  seedTransportProviders(): Promise<void>;
  listTransportProviders(): Promise<TransportProvider[]>;
  getTransportProvider(id: number): Promise<TransportProvider | undefined>;
  findNearbyVehicles(filters: { accessNeeds: string[]; capacity: number; originLat?: number; originLng?: number; radiusKm?: number }): Promise<(TransportVehicle & { provider: TransportProvider })[]>;
  createTripQuote(data: InsertTripQuote): Promise<TripQuote>;
  getTripQuote(id: number): Promise<TripQuote | undefined>;
  createTrip(data: InsertTrip): Promise<Trip>;
  getTrip(id: number): Promise<(Trip & { provider: TransportProvider }) | undefined>;
  getUserTrips(sessionId?: string, userId?: string): Promise<(Trip & { provider: TransportProvider })[]>;
  updateTripStatus(id: number, status: string): Promise<Trip>;
  cancelTrip(id: number): Promise<Trip>;
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

  // === TRANSPORT MODULE ===

  async seedTransportProviders(): Promise<void> {
    const existing = await db.select().from(transportProviders).limit(1);
    if (existing.length > 0) return;

    const [wat] = await db.insert(transportProviders).values({
      name: "Sydney Accessible Transport Co.",
      kind: "wat",
      ndisSupport: true,
      rateCard: {
        baseFare: 8.0,
        perKm: 2.8,
        perMinute: 0.45,
        wheelchairSurcharge: 12.0,
        rampSurcharge: 5.0,
        driverAssistanceSurcharge: 8.0,
      },
      adapterKey: "zoomly_manual",
      active: true,
    }).returning();

    const [rideshare] = await db.insert(transportProviders).values({
      name: "CityRide Partner Network",
      kind: "rideshare",
      ndisSupport: false,
      rateCard: {
        baseFare: 5.0,
        perKm: 1.9,
        perMinute: 0.3,
        wheelchairSurcharge: 0,
        rampSurcharge: 0,
        driverAssistanceSurcharge: 4.0,
      },
      adapterKey: "zoomly_manual",
      active: true,
    }).returning();

    await db.insert(transportVehicles).values([
      {
        providerId: wat.id,
        vehicleType: "wheelchair_van",
        capacity: 4,
        accessibilityFeatures: ["wheelchair", "ramp", "driver_assistance", "low_sensory", "no_stairs"],
        lat: "-33.8688",
        lng: "151.2093",
        available: true,
      },
      {
        providerId: wat.id,
        vehicleType: "minibus",
        capacity: 8,
        accessibilityFeatures: ["wheelchair", "ramp", "no_stairs"],
        lat: "-33.8750",
        lng: "151.2050",
        available: true,
      },
      {
        providerId: rideshare.id,
        vehicleType: "sedan",
        capacity: 4,
        accessibilityFeatures: ["driver_assistance"],
        lat: "-33.8700",
        lng: "151.2100",
        available: true,
      },
      {
        providerId: rideshare.id,
        vehicleType: "suv",
        capacity: 5,
        accessibilityFeatures: ["driver_assistance", "low_sensory"],
        lat: "-33.8650",
        lng: "151.2150",
        available: true,
      },
    ]);
  }

  async listTransportProviders(): Promise<TransportProvider[]> {
    return await db.select().from(transportProviders).where(eq(transportProviders.active, true));
  }

  async getTransportProvider(id: number): Promise<TransportProvider | undefined> {
    const [provider] = await db.select().from(transportProviders).where(eq(transportProviders.id, id));
    return provider;
  }

  async findNearbyVehicles(filters: { accessNeeds: string[]; capacity: number; originLat?: number; originLng?: number; radiusKm?: number }): Promise<(TransportVehicle & { provider: TransportProvider })[]> {
    const allVehicles = await db.query.transportVehicles.findMany({
      where: eq(transportVehicles.available, true),
      with: {
        provider: true,
      },
    });

    const radiusKm = filters.radiusKm ?? 50;

    function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return (allVehicles as any[]).filter((v: any) => {
      if (v.capacity < filters.capacity) return false;
      if (!v.provider?.active) return false;
      if (filters.originLat !== undefined && filters.originLng !== undefined && v.lat && v.lng) {
        const dist = haversineKm(filters.originLat, filters.originLng, parseFloat(v.lat), parseFloat(v.lng));
        if (dist > radiusKm) return false;
      }
      if (filters.accessNeeds.length === 0) return true;
      const features = v.accessibilityFeatures as string[];
      return filters.accessNeeds.every(need => features.includes(need));
    });
  }

  async createTripQuote(data: InsertTripQuote): Promise<TripQuote> {
    const [quote] = await db.insert(tripQuotes).values(data).returning();
    return quote;
  }

  async getTripQuote(id: number): Promise<TripQuote | undefined> {
    const [quote] = await db.select().from(tripQuotes).where(eq(tripQuotes.id, id));
    return quote;
  }

  async createTrip(data: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(data).returning();
    return trip;
  }

  async getTrip(id: number): Promise<(Trip & { provider: TransportProvider }) | undefined> {
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: { provider: true },
    });
    return trip as any;
  }

  async getUserTrips(sessionId?: string, userId?: string): Promise<(Trip & { provider: TransportProvider })[]> {
    const userTrips = await db.query.trips.findMany({
      where: userId
        ? eq(trips.userId, userId)
        : sessionId
          ? eq(trips.sessionId, sessionId)
          : undefined,
      with: { provider: true },
      orderBy: [desc(trips.createdAt)],
    });
    return userTrips as any;
  }

  async updateTripStatus(id: number, status: string): Promise<Trip> {
    const [updated] = await db.update(trips)
      .set({ status, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return updated;
  }

  async cancelTrip(id: number): Promise<Trip> {
    const [updated] = await db.update(trips)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return updated;
  }

  // === REACTIONS ===
  async addReaction(postId: number, userId: string, reactionType: string): Promise<PostReaction> {
    const [reaction] = await db
      .insert(postReactions)
      .values({ postId, userId, reactionType })
      .onConflictDoUpdate({
        target: [postReactions.postId, postReactions.userId],
        set: { reactionType },
      })
      .returning();
    return reaction;
  }

  async removeReaction(postId: number, userId: string): Promise<void> {
    await db.delete(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)));
  }

  async getReactionCounts(postId: number): Promise<Record<string, number>> {
    const rows = await db
      .select({ reactionType: postReactions.reactionType, count: sql<number>`count(*)::int` })
      .from(postReactions)
      .where(eq(postReactions.postId, postId))
      .groupBy(postReactions.reactionType);
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.reactionType] = row.count;
    return counts;
  }

  async getUserReaction(postId: number, userId: string): Promise<PostReaction | undefined> {
    const [reaction] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)));
    return reaction;
  }

  async getReactionCountsBulk(postIds: number[]): Promise<Record<number, Record<string, number>>> {
    if (postIds.length === 0) return {};
    const rows = await db
      .select({ postId: postReactions.postId, reactionType: postReactions.reactionType, count: sql<number>`count(*)::int` })
      .from(postReactions)
      .where(inArray(postReactions.postId, postIds))
      .groupBy(postReactions.postId, postReactions.reactionType);
    const result: Record<number, Record<string, number>> = {};
    for (const row of rows) {
      if (!result[row.postId]) result[row.postId] = {};
      result[row.postId][row.reactionType] = row.count;
    }
    return result;
  }

  // === PEER CONNECT ===
  async getPeerMatches(userId: string, limit = 20): Promise<(User & { profile: Profile | null })[]> {
    const myProfile = await this.getProfile(userId);
    const myDiagnosis = myProfile?.diagnosis?.toLowerCase() || "";
    const myInterests: string[] = (myProfile?.interests as string[]) || [];

    const allUsers = await db.query.users.findMany({
      where: ne(users.id, userId),
      with: { profile: true },
      limit: 200,
    });

    const scored = (allUsers as any[]).map((u: any) => {
      const profile = u.profile;
      let score = 0;
      if (profile?.diagnosis && myDiagnosis && profile.diagnosis.toLowerCase().includes(myDiagnosis)) score += 3;
      if (profile?.diagnosis && myDiagnosis && myDiagnosis.includes(profile.diagnosis.toLowerCase())) score += 3;
      const theirInterests: string[] = (profile?.interests as string[]) || [];
      const shared = theirInterests.filter((i: string) => myInterests.includes(i));
      score += shared.length;
      if (profile?.location && myProfile?.location && profile.location === myProfile.location) score += 1;
      return { ...u, _score: score };
    });

    return scored
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...u }: any) => u);
  }

  async listAllProfiles(): Promise<(User & { profile: Profile | null })[]> {
    return await db.query.users.findMany({
      with: { profile: true },
      limit: 100,
    }) as any;
  }

  async listAllReports(status?: string): Promise<UserReport[]> {
    if (status) {
      return await db.select().from(userReports).where(eq(userReports.status, status)).orderBy(desc(userReports.createdAt));
    }
    return await db.select().from(userReports).orderBy(desc(userReports.createdAt));
  }

  async updateReportStatus(id: number, status: string, reviewedBy: string, adminNotes?: string): Promise<UserReport | undefined> {
    const [updated] = await db.update(userReports)
      .set({ status, reviewedBy, adminNotes, reviewedAt: new Date() })
      .where(eq(userReports.id, id))
      .returning();
    return updated;
  }

  // === COMMUNITY FORUMS ===

  async seedForumCategories(): Promise<void> {
    const existing = await db.select().from(forumCategories).limit(1);
    if (existing.length > 0) return;

    const defaultCategories = [
      { name: "Mental Health", slug: "mental-health", description: "Share experiences, coping strategies, and support for mental health challenges.", icon: "Brain", sortOrder: 0 },
      { name: "Mobility", slug: "mobility", description: "Discussions about mobility aids, accessibility, and getting around with physical disabilities.", icon: "Accessibility", sortOrder: 1 },
      { name: "Chronic Pain", slug: "chronic-pain", description: "A space for those living with chronic pain conditions to connect and share strategies.", icon: "Activity", sortOrder: 2 },
      { name: "NDIS & Funding", slug: "ndis-funding", description: "Navigate the NDIS, funding plans, and financial support for people with disability.", icon: "FileText", sortOrder: 3 },
      { name: "Daily Living", slug: "daily-living", description: "Tips, tools, and conversations about managing everyday tasks with a disability.", icon: "Home", sortOrder: 4 },
      { name: "General", slug: "general", description: "A place for everything else — introduce yourself, share news, or just chat.", icon: "MessageSquare", sortOrder: 5 },
    ];

    await db.insert(forumCategories).values(defaultCategories);
  }

  async listForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories).orderBy(forumCategories.sortOrder);
  }

  async getForumCategory(slug: string): Promise<ForumCategory | undefined> {
    const [cat] = await db.select().from(forumCategories).where(eq(forumCategories.slug, slug));
    return cat;
  }

  async listForumThreads(categoryId: number, limit = 30): Promise<(ForumThread & { author: User })[]> {
    return db.query.forumThreads.findMany({
      where: eq(forumThreads.categoryId, categoryId),
      orderBy: [desc(forumThreads.lastActivityAt)],
      with: { author: true },
      limit,
    }) as any;
  }

  async getForumThread(id: number, repliesPage = 1, repliesLimit = 20): Promise<(ForumThread & { author: User; replies: (ForumReply & { author: User })[]; totalReplies: number }) | undefined> {
    const thread = await db.query.forumThreads.findFirst({
      where: eq(forumThreads.id, id),
      with: { author: true },
    });
    if (!thread) return undefined;

    const offset = (repliesPage - 1) * repliesLimit;
    const [{ count: totalReplies }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(forumReplies)
      .where(eq(forumReplies.threadId, id));

    const replies = await db.query.forumReplies.findMany({
      where: eq(forumReplies.threadId, id),
      orderBy: [forumReplies.createdAt],
      with: { author: true },
      limit: repliesLimit,
      offset,
    });

    return { ...(thread as any), replies, totalReplies };
  }

  async createForumThread(data: InsertForumThread, authorId: string): Promise<ForumThread> {
    const [thread] = await db.insert(forumThreads).values({ ...data, authorId }).returning();
    // Update category thread count and lastActivityAt
    await db.update(forumCategories)
      .set({ threadCount: sql`${forumCategories.threadCount} + 1`, lastActivityAt: new Date() })
      .where(eq(forumCategories.id, data.categoryId));
    return thread;
  }

  async createForumReply(data: InsertForumReply, authorId: string): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values({ ...data, authorId }).returning();
    // Update thread reply count and lastActivityAt
    await db.update(forumThreads)
      .set({ replyCount: sql`${forumThreads.replyCount} + 1`, lastActivityAt: new Date() })
      .where(eq(forumThreads.id, data.threadId));
    // Also update category lastActivityAt
    const [thread] = await db.select({ categoryId: forumThreads.categoryId }).from(forumThreads).where(eq(forumThreads.id, data.threadId));
    if (thread) {
      await db.update(forumCategories).set({ lastActivityAt: new Date() }).where(eq(forumCategories.id, thread.categoryId));
    }
    return reply;
  }

  async toggleForumVote(userId: string, entityType: string, entityId: number): Promise<{ voted: boolean; count: number; recipientId?: string }> {
    const [existing] = await db.select().from(forumVotes).where(
      and(eq(forumVotes.userId, userId), eq(forumVotes.entityType, entityType), eq(forumVotes.entityId, entityId))
    );
    if (existing) {
      await db.delete(forumVotes).where(eq(forumVotes.id, existing.id));
      if (entityType === 'thread') {
        await db.update(forumThreads).set({ upvotesCount: sql`${forumThreads.upvotesCount} - 1` }).where(eq(forumThreads.id, entityId));
        const [t] = await db.select({ upvotesCount: forumThreads.upvotesCount, authorId: forumThreads.authorId }).from(forumThreads).where(eq(forumThreads.id, entityId));
        return { voted: false, count: t?.upvotesCount ?? 0, recipientId: t?.authorId };
      } else {
        await db.update(forumReplies).set({ upvotesCount: sql`${forumReplies.upvotesCount} - 1` }).where(eq(forumReplies.id, entityId));
        const [r] = await db.select({ upvotesCount: forumReplies.upvotesCount, authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, entityId));
        return { voted: false, count: r?.upvotesCount ?? 0, recipientId: r?.authorId };
      }
    } else {
      await db.insert(forumVotes).values({ userId, entityType, entityId });
      if (entityType === 'thread') {
        await db.update(forumThreads).set({ upvotesCount: sql`${forumThreads.upvotesCount} + 1` }).where(eq(forumThreads.id, entityId));
        const [t] = await db.select({ upvotesCount: forumThreads.upvotesCount, authorId: forumThreads.authorId }).from(forumThreads).where(eq(forumThreads.id, entityId));
        return { voted: true, count: t?.upvotesCount ?? 1, recipientId: t?.authorId };
      } else {
        await db.update(forumReplies).set({ upvotesCount: sql`${forumReplies.upvotesCount} + 1` }).where(eq(forumReplies.id, entityId));
        const [r] = await db.select({ upvotesCount: forumReplies.upvotesCount, authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, entityId));
        return { voted: true, count: r?.upvotesCount ?? 1, recipientId: r?.authorId };
      }
    }
  }

  async getUserForumVotes(userId: string, entityType: string, entityIds: number[]): Promise<number[]> {
    if (!entityIds.length) return [];
    const votes = await db.select({ entityId: forumVotes.entityId }).from(forumVotes).where(
      and(eq(forumVotes.userId, userId), eq(forumVotes.entityType, entityType), inArray(forumVotes.entityId, entityIds))
    );
    return votes.map(v => v.entityId);
  }

  async markAcceptedAnswer(threadId: number, replyId: number, requestingUserId: string): Promise<{ replyAuthorId: string; wasAlreadyAccepted: boolean }> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId));
    if (!thread || thread.authorId !== requestingUserId) throw new Error("Not authorized");
    // Verify the reply belongs to this thread
    const [reply] = await db.select().from(forumReplies).where(
      and(eq(forumReplies.id, replyId), eq(forumReplies.threadId, threadId))
    );
    if (!reply) throw new Error("Reply not found in this thread");
    const wasAlreadyAccepted = reply.isAcceptedAnswer;
    // Clear existing accepted answer on this thread
    await db.update(forumReplies).set({ isAcceptedAnswer: false }).where(eq(forumReplies.threadId, threadId));
    // Set new accepted answer
    await db.update(forumReplies).set({ isAcceptedAnswer: true }).where(eq(forumReplies.id, replyId));
    // Mark thread as solved
    await db.update(forumThreads).set({ isSolved: true }).where(eq(forumThreads.id, threadId));
    return { replyAuthorId: reply.authorId, wasAlreadyAccepted };
  }

  // === PUBLIC STATS ===

  async getPublicStats(): Promise<{ memberCount: number; threadCount: number; replyCount: number }> {
    const [memberRow] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [threadRow] = await db.select({ count: sql<number>`count(*)::int` }).from(forumThreads);
    const [replyRow] = await db.select({ count: sql<number>`count(*)::int` }).from(forumReplies);
    return {
      memberCount: memberRow?.count ?? 0,
      threadCount: threadRow?.count ?? 0,
      replyCount: replyRow?.count ?? 0,
    };
  }

  async getPublicRecentActivity(limit = 10): Promise<{ id: number; title: string; categorySlug: string; createdAt: Date | null }[]> {
    const threads = await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        categorySlug: forumCategories.slug,
        createdAt: forumThreads.createdAt,
      })
      .from(forumThreads)
      .innerJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .orderBy(desc(forumThreads.createdAt))
      .limit(limit);
    return threads;
  }
}

export const storage = new DatabaseStorage();
