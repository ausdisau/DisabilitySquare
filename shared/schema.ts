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
