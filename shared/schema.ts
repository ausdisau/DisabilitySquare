import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

// === PROFILES ===
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  location: text("location"),
  diagnosis: text("diagnosis"),
  interests: jsonb("interests").$type<string[]>().default([]),
  accessibilitySettings: jsonb("accessibility_settings").$type<{
    highContrast: boolean;
    fontSize: "normal" | "large" | "extra-large";
  }>().default({ highContrast: false, fontSize: "normal" }),
  dateOfBirth: timestamp("date_of_birth"),
  ageVerified: boolean("age_verified").default(false),
  ageVerifiedAt: timestamp("age_verified_at"),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
  comments: many(comments),
  memberships: many(groupMembers),
  gameScores: many(gameScores),
  pointsRecord: one(userPoints, {
    fields: [users.id],
    references: [userPoints.userId],
  }),
  badges: many(userBadges),
  pointsHistory: many(pointsLedger),
}));

// === GROUPS ===
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'diagnosis', 'interest', 'location'
  imageUrl: text("image_url"),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdById],
    references: [users.id],
  }),
  members: many(groupMembers),
  posts: many(posts),
}));

// === GROUP MEMBERS ===
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

// === POSTS ===
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id), // Nullable for general "village square" posts
  tags: jsonb("tags").$type<string[]>().default([]),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
  comments: many(comments),
}));

// === COMMENTS ===
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

// === GAME SCORES ===
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameName: text("game_name").notNull(), // 'chess', 'tetris'
  score: integer("score").notNull(),
  playedAt: timestamp("played_at").defaultNow(),
});

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  user: one(users, {
    fields: [gameScores.userId],
    references: [users.id],
  }),
}));

// === VALORIZATION SYSTEM ===

// Badges that users can earn
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  category: text("category").notNull(), // 'connector', 'mentor', 'advocate', 'ally', 'contributor'
  pointsRequired: integer("points_required").notNull().default(0),
  color: text("color").notNull().default("#1B4B8A"), // Badge color
});

// User earned badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Points ledger - tracks all point transactions
export const pointsLedger = pgTable("points_ledger", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  actionType: text("action_type").notNull(), // 'post', 'comment', 'like_given', 'like_received', 'group_join', 'reply_to_other', 'mentored'
  description: text("description"),
  relatedUserId: varchar("related_user_id").references(() => users.id), // For cross-user interactions
  createdAt: timestamp("created_at").defaultNow(),
});

export const pointsLedgerRelations = relations(pointsLedger, ({ one }) => ({
  user: one(users, {
    fields: [pointsLedger.userId],
    references: [users.id],
  }),
  relatedUser: one(users, {
    fields: [pointsLedger.relatedUserId],
    references: [users.id],
  }),
}));

// User total points cache for quick lookup
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
}));

// Point values for different actions
export const POINT_VALUES = {
  POST_CREATED: 10,
  COMMENT_CREATED: 5,
  LIKE_GIVEN: 1,
  LIKE_RECEIVED: 2,
  GROUP_JOINED: 5,
  REPLY_TO_OTHER: 8, // Rewarding cross-user interaction
  THOUGHTFUL_COMMENT: 15, // Comments over 100 chars
  FIRST_POST_IN_GROUP: 20,
  WELCOMED_NEWCOMER: 10,
} as const;

// === EXTENSION SYSTEM ===

// Extension registry - stores installed extensions
export const extensions = pgTable("extensions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull().default("1.0.0"),
  author: text("author").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  config: jsonb("config").$type<Record<string, any>>().default({}),
  hooks: jsonb("hooks").$type<string[]>().default([]), // Event hooks this extension subscribes to
  permissions: jsonb("permissions").$type<string[]>().default([]), // Required permissions
  entryPoint: text("entry_point").notNull(), // Path to extension module
  installedAt: timestamp("installed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extension event hooks - tracks which extensions respond to which events
export const extensionHooks = pgTable("extension_hooks", {
  id: serial("id").primaryKey(),
  extensionId: integer("extension_id").notNull().references(() => extensions.id),
  eventType: text("event_type").notNull(), // 'post.created', 'comment.created', 'group.joined', etc.
  priority: integer("priority").notNull().default(100), // Lower = runs first
  enabled: boolean("enabled").notNull().default(true),
});

export const extensionHooksRelations = relations(extensionHooks, ({ one }) => ({
  extension: one(extensions, {
    fields: [extensionHooks.extensionId],
    references: [extensions.id],
  }),
}));

// Extension logs - for debugging and monitoring
export const extensionLogs = pgTable("extension_logs", {
  id: serial("id").primaryKey(),
  extensionId: integer("extension_id").notNull().references(() => extensions.id),
  level: text("level").notNull(), // 'info', 'warn', 'error'
  message: text("message").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const extensionLogsRelations = relations(extensionLogs, ({ one }) => ({
  extension: one(extensions, {
    fields: [extensionLogs.extensionId],
    references: [extensions.id],
  }),
}));

export const extensionsRelations = relations(extensions, ({ many }) => ({
  hooks: many(extensionHooks),
  logs: many(extensionLogs),
}));

// Platform event types that extensions can hook into
export const EXTENSION_EVENTS = {
  // User events
  USER_REGISTERED: 'user.registered',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  
  // Post events
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  POST_LIKED: 'post.liked',
  
  // Comment events
  COMMENT_CREATED: 'comment.created',
  COMMENT_DELETED: 'comment.deleted',
  
  // Group events
  GROUP_CREATED: 'group.created',
  GROUP_JOINED: 'group.joined',
  GROUP_LEFT: 'group.left',
  
  // Valorization events
  POINTS_AWARDED: 'points.awarded',
  BADGE_EARNED: 'badge.earned',
  LEVEL_UP: 'level.up',
  
  // Game events
  GAME_SCORE_SAVED: 'game.score_saved',
  
  // Custom extension events
  EXTENSION_INSTALLED: 'extension.installed',
  EXTENSION_ENABLED: 'extension.enabled',
  EXTENSION_DISABLED: 'extension.disabled',
} as const;

// Extension permissions
export const EXTENSION_PERMISSIONS = {
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  READ_POSTS: 'read:posts',
  WRITE_POSTS: 'write:posts',
  READ_COMMENTS: 'read:comments',
  WRITE_COMMENTS: 'write:comments',
  READ_GROUPS: 'read:groups',
  WRITE_GROUPS: 'write:groups',
  READ_POINTS: 'read:points',
  AWARD_POINTS: 'award:points',
  AWARD_BADGES: 'award:badges',
  SEND_NOTIFICATIONS: 'send:notifications',
} as const;

// === ZOD SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdById: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, authorId: true, likesCount: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, authorId: true, createdAt: true });
export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true, userId: true, playedAt: true });

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;

// Valorization types
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertPointsLedgerSchema = createInsertSchema(pointsLedger).omit({ id: true, createdAt: true });
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({ id: true, updatedAt: true });

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type PointsLedgerEntry = typeof pointsLedger.$inferSelect;
export type InsertPointsLedgerEntry = z.infer<typeof insertPointsLedgerSchema>;
export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;

// Extension types
export const insertExtensionSchema = createInsertSchema(extensions).omit({ id: true, installedAt: true, updatedAt: true });
export const insertExtensionHookSchema = createInsertSchema(extensionHooks).omit({ id: true });
export const insertExtensionLogSchema = createInsertSchema(extensionLogs).omit({ id: true, createdAt: true });

export type Extension = typeof extensions.$inferSelect;
export type InsertExtension = z.infer<typeof insertExtensionSchema>;
export type ExtensionHook = typeof extensionHooks.$inferSelect;
export type InsertExtensionHook = z.infer<typeof insertExtensionHookSchema>;
export type ExtensionLog = typeof extensionLogs.$inferSelect;
export type InsertExtensionLog = z.infer<typeof insertExtensionLogSchema>;

// Extension context passed to extension handlers
export interface ExtensionContext {
  extensionId: number;
  storage: any; // Access to storage methods
  log: (level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, any>) => Promise<void>;
  awardPoints: (userId: string, points: number, actionType: string, description: string) => Promise<void>;
  awardBadge: (userId: string, badgeId: number) => Promise<void>;
  getConfig: () => Record<string, any>;
  setConfig: (config: Record<string, any>) => Promise<void>;
}

// Extension event payload types
export interface ExtensionEventPayload {
  eventType: string;
  timestamp: Date;
  data: Record<string, any>;
  userId?: string;
}

// Extension manifest for installation
export interface ExtensionManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  hooks: string[];
  permissions: string[];
  defaultConfig?: Record<string, any>;
}

// === USER REPORTS (for safety/eSafety compliance) ===
export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").notNull().references(() => users.id),
  reportType: varchar("report_type", { length: 50 }).notNull(), // 'underage', 'harassment', 'inappropriate_content', etc.
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'reviewed', 'dismissed', 'actioned'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
}, (table) => ({
  uniqueReport: unique("unique_report_per_user_type").on(table.reporterId, table.reportedUserId, table.reportType),
}));

export const userReportsRelations = relations(userReports, ({ one }) => ({
  reporter: one(users, {
    fields: [userReports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [userReports.reportedUserId],
    references: [users.id],
    relationName: "reportedUser",
  }),
  reviewer: one(users, {
    fields: [userReports.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

export const insertUserReportSchema = createInsertSchema(userReports).omit({ 
  id: true, 
  createdAt: true, 
  reviewedAt: true, 
  reviewedBy: true, 
  adminNotes: true 
});
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;

// === SPOON STATUS (Spoon Theory Energy Tracker) ===
export const spoonStatus = pgTable("spoon_status", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  spoons: integer("spoons").notNull(), // 1-12
  note: text("note"), // optional note
  date: text("date").notNull(), // 'YYYY-MM-DD' format for easy daily grouping
  createdAt: timestamp("created_at").defaultNow(),
});

export const spoonStatusRelations = relations(spoonStatus, ({ one }) => ({
  user: one(users, {
    fields: [spoonStatus.userId],
    references: [users.id],
  }),
}));

export const insertSpoonStatusSchema = createInsertSchema(spoonStatus).omit({ id: true, userId: true, createdAt: true });
export type SpoonStatus = typeof spoonStatus.$inferSelect;
export type InsertSpoonStatus = z.infer<typeof insertSpoonStatusSchema>;

// === SYMPTOM/MOOD JOURNAL ===
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: text("date").notNull(), // 'YYYY-MM-DD'
  mood: integer("mood").notNull(), // 1-5 scale
  symptoms: jsonb("symptoms").$type<string[]>().default([]),
  painLevel: integer("pain_level"), // 0-10, optional
  energyLevel: integer("energy_level"), // 1-10, optional
  notes: text("notes"),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

// === SERVICE PROVIDER DIRECTORY ===
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'allied_health', 'support_worker', 'accommodation', 'employment', 'legal', 'mental_health', 'equipment', 'other'
  description: text("description").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(), // AU state or 'National' or 'Online'
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  ndisRegistered: boolean("ndis_registered").default(false),
  acceptsNdis: boolean("accepts_ndis").default(false),
  disabilityTypes: jsonb("disability_types").$type<string[]>().default([]),
  approved: boolean("approved").default(false), // Admin approved
  submittedById: varchar("submitted_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceProvidersRelations = relations(serviceProviders, ({ one }) => ({
  submittedBy: one(users, {
    fields: [serviceProviders.submittedById],
    references: [users.id],
  }),
}));

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true, submittedById: true, approved: true, createdAt: true });
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

// === RESOURCE LIBRARY ===
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(), // 'ndis', 'mental_health', 'employment', 'legal', 'housing', 'community', 'research', 'tools'
  tags: jsonb("tags").$type<string[]>().default([]),
  source: text("source").notNull(), // Publisher/organisation name
  isAustralian: boolean("is_australian").default(true),
  addedById: varchar("added_by_id").references(() => users.id),
  approved: boolean("approved").default(false),
  saves: integer("saves").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resourcesRelations = relations(resources, ({ one }) => ({
  addedBy: one(users, {
    fields: [resources.addedById],
    references: [users.id],
  }),
}));

export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, addedById: true, approved: true, saves: true, createdAt: true });
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// User saved resources (bookmarks)
export const savedResources = pgTable("saved_resources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  savedAt: timestamp("saved_at").defaultNow(),
}, (table) => ({
  uniqueSave: unique("unique_save").on(table.userId, table.resourceId),
}));

export const savedResourcesRelations = relations(savedResources, ({ one }) => ({
  user: one(users, {
    fields: [savedResources.userId],
    references: [users.id],
  }),
  resource: one(resources, {
    fields: [savedResources.resourceId],
    references: [resources.id],
  }),
}));

// === JOB BOARD ===
export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  type: text("type").notNull(), // 'full_time', 'part_time', 'casual', 'volunteer', 'contract'
  salary: text("salary"), // Optional salary range as text
  category: text("category").notNull(), // 'admin', 'healthcare', 'tech', 'creative', 'education', 'retail', 'trades', 'other'
  tags: jsonb("tags").$type<string[]>().default([]),
  isRemote: boolean("is_remote").default(false),
  isAccessible: boolean("is_accessible").default(false), // Employer confirmed accessible workplace
  disabilityWelcome: boolean("disability_welcome").default(false), // Explicitly welcoming people with disabilities
  applyUrl: text("apply_url"),
  applyEmail: text("apply_email"),
  expiresAt: timestamp("expires_at"),
  postedById: varchar("posted_by_id").references(() => users.id),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobListingsRelations = relations(jobListings, ({ one }) => ({
  postedBy: one(users, {
    fields: [jobListings.postedById],
    references: [users.id],
  }),
}));

export const insertJobListingSchema = createInsertSchema(jobListings).omit({ id: true, postedById: true, approved: true, createdAt: true });
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;

// === TRANSPORT MODULE ===

export const transportProviders = pgTable("transport_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // 'wat' (wheelchair accessible), 'rideshare', 'taxi', 'community_transport'
  ndisSupport: boolean("ndis_support").default(false),
  rateCard: jsonb("rate_card").$type<{
    baseFare: number;
    perKm: number;
    perMinute: number;
    wheelchairSurcharge: number;
    rampSurcharge: number;
    driverAssistanceSurcharge: number;
  }>().notNull(),
  adapterKey: text("adapter_key").notNull().default("zoomly_manual"), // 'zoomly_manual' | 'uber_guest'
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transportVehicles = pgTable("transport_vehicles", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => transportProviders.id),
  vehicleType: text("vehicle_type").notNull(), // 'wheelchair_van', 'sedan', 'suv', 'minibus'
  capacity: integer("capacity").notNull().default(4),
  accessibilityFeatures: jsonb("accessibility_features").$type<string[]>().default([]),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  available: boolean("available").default(true),
});

export const tripQuotes = pgTable("trip_quotes", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"), // guest session identifier
  userId: varchar("user_id").references(() => users.id), // null for guests
  pickupAddress: text("pickup_address").notNull(),
  pickupLat: text("pickup_lat").notNull(),
  pickupLng: text("pickup_lng").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  dropoffLat: text("dropoff_lat").notNull(),
  dropoffLng: text("dropoff_lng").notNull(),
  accessNeeds: jsonb("access_needs").$type<string[]>().default([]),
  companionCount: integer("companion_count").default(0),
  fundingType: text("funding_type").default("private"), // 'ndis', 'private', 'transport_allowance'
  distanceKm: text("distance_km"),
  durationMinutes: integer("duration_minutes"),
  options: jsonb("options").$type<Array<{
    providerId: number;
    providerName: string;
    vehicleType: string;
    etaMinutes: number;
    priceAud: number;
    ndisEligible: boolean;
    vehicleId: number;
  }>>().default([]),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => tripQuotes.id),
  providerId: integer("provider_id").notNull().references(() => transportProviders.id),
  vehicleId: integer("vehicle_id").references(() => transportVehicles.id),
  sessionId: text("session_id"),
  userId: varchar("user_id").references(() => users.id),
  pickupAddress: text("pickup_address").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  priceAud: text("price_aud").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  externalRef: text("external_ref"),
  accessNeeds: jsonb("access_needs").$type<string[]>().default([]),
  fundingType: text("funding_type").default("private"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transportProvidersRelations = relations(transportProviders, ({ many }) => ({
  vehicles: many(transportVehicles),
  trips: many(trips),
}));

export const transportVehiclesRelations = relations(transportVehicles, ({ one }) => ({
  provider: one(transportProviders, {
    fields: [transportVehicles.providerId],
    references: [transportProviders.id],
  }),
}));

export const tripQuotesRelations = relations(tripQuotes, ({ one, many }) => ({
  user: one(users, {
    fields: [tripQuotes.userId],
    references: [users.id],
  }),
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one }) => ({
  quote: one(tripQuotes, {
    fields: [trips.quoteId],
    references: [tripQuotes.id],
  }),
  provider: one(transportProviders, {
    fields: [trips.providerId],
    references: [transportProviders.id],
  }),
  vehicle: one(transportVehicles, {
    fields: [trips.vehicleId],
    references: [transportVehicles.id],
  }),
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
}));

export const insertTransportProviderSchema = createInsertSchema(transportProviders).omit({ id: true, createdAt: true });
export const insertTransportVehicleSchema = createInsertSchema(transportVehicles).omit({ id: true });
export const insertTripQuoteSchema = createInsertSchema(tripQuotes).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true, updatedAt: true });

export type TransportProvider = typeof transportProviders.$inferSelect;
export type InsertTransportProvider = z.infer<typeof insertTransportProviderSchema>;
export type TransportVehicle = typeof transportVehicles.$inferSelect;
export type InsertTransportVehicle = z.infer<typeof insertTransportVehicleSchema>;
export type TripQuote = typeof tripQuotes.$inferSelect;
export type InsertTripQuote = z.infer<typeof insertTripQuoteSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

// === AI CHAT CONVERSATIONS (for voice features) ===
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
