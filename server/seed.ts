import { db } from "./db";
import { users, profiles, groups, posts, comments, groupMembers } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if we have users
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create mock users (Auth table)
  const user1 = (await db.insert(users).values({
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Wonder",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  }).returning())[0];

  const user2 = (await db.insert(users).values({
    email: "bob@example.com",
    firstName: "Bob",
    lastName: "Builder",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  }).returning())[0];

  const user3 = (await db.insert(users).values({
    email: "charlie@example.com",
    firstName: "Charlie",
    lastName: "Chaplin",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  }).returning())[0];

  // Create Profiles
  await db.insert(profiles).values([
    {
      userId: user1.id,
      bio: "Wheelchair user, loves accessible travel and tech.",
      location: "New York, USA",
      diagnosis: "Spinal Cord Injury",
      interests: ["Travel", "Tech", "Accessibility"],
    },
    {
      userId: user2.id,
      bio: "Autistic advocate and programmer.",
      location: "London, UK",
      diagnosis: "Autism Spectrum Disorder",
      interests: ["Coding", "Advocacy", "Sci-Fi"],
    },
    {
      userId: user3.id,
      bio: "Low vision gamer.",
      location: "Berlin, Germany",
      diagnosis: "Retinitis Pigmentosa",
      interests: ["Gaming", "Audiobooks"],
    },
  ]);

  // Create Groups
  const group1 = (await db.insert(groups).values({
    name: "Wheelchair Users United",
    description: "A space for wheelchair users to share tips and support.",
    category: "diagnosis",
    createdById: user1.id,
  }).returning())[0];

  const group2 = (await db.insert(groups).values({
    name: "Autism Advocacy",
    description: "Discussing neurodiversity and self-advocacy.",
    category: "diagnosis",
    createdById: user2.id,
  }).returning())[0];

  const group3 = (await db.insert(groups).values({
    name: "Accessible Gaming",
    description: "Discussing games with great accessibility features.",
    category: "interest",
    createdById: user3.id,
  }).returning())[0];

  // Join groups
  await db.insert(groupMembers).values([
    { groupId: group1.id, userId: user1.id },
    { groupId: group2.id, userId: user2.id },
    { groupId: group3.id, userId: user3.id },
    { groupId: group3.id, userId: user1.id },
  ]);

  // Create Posts
  const post1 = (await db.insert(posts).values({
    title: "Best accessible ramps in NYC?",
    content: "I'm visiting NYC next week. Any recommendations for accessible restaurants with good ramps?",
    authorId: user1.id,
    groupId: group1.id,
    tags: ["travel", "nyc", "ramps"],
  }).returning())[0];

  const post2 = (await db.insert(posts).values({
    title: "The importance of stimming",
    content: "Stimming helps me regulate my emotions. How about you?",
    authorId: user2.id,
    groupId: group2.id,
    tags: ["stimming", "regulation"],
  }).returning())[0];

  const post3 = (await db.insert(posts).values({
    title: "Check out this new accessible controller!",
    content: "Just got the new adaptive kit. It's game-changing.",
    authorId: user3.id,
    groupId: group3.id,
    tags: ["tech", "gaming"],
  }).returning())[0];

  // General Village Square Post
  await db.insert(posts).values({
    title: "Welcome to DisabilitySquare!",
    content: "So glad to be here in this new community.",
    authorId: user1.id,
    tags: ["welcome", "community"],
  });

  // Comments
  await db.insert(comments).values([
    {
      content: "Have you checked out the guide on the city website?",
      authorId: user2.id,
      postId: post1.id,
    },
    {
      content: "I love it too! It's very grounding.",
      authorId: user1.id,
      postId: post2.id,
    },
  ]);

  console.log("Database seeded successfully!");
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
