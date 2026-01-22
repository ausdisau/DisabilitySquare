import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
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
