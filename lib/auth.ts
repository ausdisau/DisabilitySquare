import { getSession } from "@auth0/nextjs-auth0";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;
  
  const auth0Id = session.user.sub;
  
  // Find or create user in our database
  let [user] = await db.select().from(users).where(eq(users.id, auth0Id));
  
  if (!user) {
    // Create user from Auth0 profile
    const [newUser] = await db.insert(users).values({
      id: auth0Id,
      email: session.user.email || null,
      firstName: session.user.given_name || session.user.nickname || null,
      lastName: session.user.family_name || null,
      profileImageUrl: session.user.picture || null,
    }).returning();
    user = newUser;
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
