import { auth, requiresAuth } from "express-openid-connect";
import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupAuth0(app: Express) {
  // Ensure issuerBaseURL has https:// prefix
  let issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL || "";
  if (issuerBaseURL && !issuerBaseURL.startsWith("https://") && !issuerBaseURL.startsWith("http://")) {
    issuerBaseURL = `https://${issuerBaseURL}`;
  }
  // Remove trailing slash if present
  issuerBaseURL = issuerBaseURL.replace(/\/$/, "");

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET || process.env.SESSION_SECRET,
    baseURL: process.env.AUTH0_BASE_URL || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL,
    routes: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      callback: "/api/auth/callback",
    },
  };

  // Only set up Auth0 if credentials are configured
  if (config.clientID && config.issuerBaseURL) {
    console.log(`Auth0 config: issuerBaseURL=${config.issuerBaseURL}, baseURL=${config.baseURL}`);
    app.use(auth(config));
    console.log("Auth0 authentication enabled");
  } else {
    console.log("Auth0 credentials not configured - running without authentication");
    console.log(`  AUTH0_CLIENT_ID: ${config.clientID ? "set" : "not set"}`);
    console.log(`  AUTH0_ISSUER_BASE_URL: ${config.issuerBaseURL ? "set" : "not set"}`);
  }
}

// Middleware to check if user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Sync user to database on each authenticated request
  try {
    const auth0User = req.oidc.user;
    if (auth0User?.sub) {
      const [existingUser] = await db.select().from(users).where(eq(users.id, auth0User.sub));
      
      if (!existingUser) {
        await db.insert(users).values({
          id: auth0User.sub,
          email: auth0User.email || null,
          firstName: auth0User.given_name || auth0User.nickname || null,
          lastName: auth0User.family_name || null,
          profileImageUrl: auth0User.picture || null,
        });
      }
      
      // Attach user ID to request for easy access
      (req as any).userId = auth0User.sub;
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }
  
  next();
};

// Get current user from request
export function getCurrentUser(req: Request) {
  if (!req.oidc?.isAuthenticated()) {
    return null;
  }
  return {
    id: req.oidc.user?.sub,
    email: req.oidc.user?.email,
    name: req.oidc.user?.name,
    picture: req.oidc.user?.picture,
  };
}

// Register Auth0 specific routes
export function registerAuth0Routes(app: Express) {
  // Get current user info
  app.get("/api/auth/user", (req, res) => {
    if (!req.oidc?.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json({
      id: req.oidc.user?.sub,
      email: req.oidc.user?.email,
      name: req.oidc.user?.name,
      firstName: req.oidc.user?.given_name,
      lastName: req.oidc.user?.family_name,
      picture: req.oidc.user?.picture,
    });
  });
  
  // Health check for auth status
  app.get("/api/auth/status", (req, res) => {
    res.json({
      isAuthenticated: req.oidc?.isAuthenticated() || false,
    });
  });
}
