# DisabilitySquare

An accessible social networking platform for people with disabilities.

## Overview

DisabilitySquare is a community-focused platform designed with accessibility as a core principle. It provides a safe space for people with disabilities to connect, share experiences, and engage with others through community groups, a village square feed, private messaging, and games.

## Tech Stack

- **Frontend**: React with Vite, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth0 (express-openid-connect)
- **Routing**: wouter (frontend), Express routes (backend)

## Brand Colors

- Navy Blue: #1B4B8A (primary)
- Orange: #E07830 (accent)
- Teal: #2A9D8F (secondary accent)
- Cream: #F5F2ED (background)

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   └── index.css       # Global styles
│   └── public/
│       └── logo.png        # DisabilitySquare logo
├── server/                 # Express backend
│   ├── auth0.ts            # Auth0 integration
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
└── shared/                 # Shared code
    ├── schema.ts           # Drizzle schema
    └── routes.ts           # API route definitions
```

## Authentication Setup (Auth0)

This app uses Auth0 for authentication. To enable login:

1. Create an Auth0 account at https://auth0.com
2. Create a new "Regular Web Application"
3. Configure the following in Auth0 Dashboard:
   - **Allowed Callback URLs**: `https://your-replit-url/api/auth/callback`
   - **Allowed Logout URLs**: `https://your-replit-url`
   - **Allowed Web Origins**: `https://your-replit-url`
4. Set these environment variables:
   - `AUTH0_CLIENT_ID`: Your Auth0 Client ID
   - `AUTH0_ISSUER_BASE_URL`: Your Auth0 domain (e.g., https://your-tenant.auth0.com)
   - `AUTH0_SECRET`: A long random string (use `openssl rand -hex 32` to generate)

## Accessibility Features

- **High Contrast Mode**: Toggle for users who need increased contrast
- **Adjustable Font Sizes**: Normal, Large, Extra Large options
- **Keyboard Navigation**: Full support for keyboard-only navigation
- **Skip Links**: Quick navigation to main content
- **ARIA Labels**: Proper screen reader support

## Database Schema

- **users**: User accounts synced from Auth0
- **profiles**: Extended user profile information
- **groups**: Community groups (by diagnosis, interests, location)
- **posts**: Village square feed posts
- **comments**: Comments on posts
- **gameScores**: High scores for games
- **badges**: Available community badges with point thresholds
- **user_badges**: Badges earned by users
- **points_ledger**: Transaction log of all points awarded
- **user_points**: Aggregate user points and levels

## Valorization Points System (SRV Model)

The platform uses a Social Role Valorization (SRV) model to reward genuine community interactions:

### Point Values
- **Post Created**: 10 points
- **Comment Created**: 5 points (15 for thoughtful 100+ character comments)
- **Reply Engagement**: 8 points to the post author when someone comments
- **Group Created**: 20 points

### Levels
- Users gain 1 level for every 100 points earned

### Badges (Auto-awarded at thresholds)
- **Newcomer** (0 pts): Welcome to the community
- **Connector** (50 pts): Building relationships
- **Rising Star** (100 pts): Actively participating
- **Advocate** (250 pts): Speaking up for others
- **Ally** (500 pts): A true supporter
- **Mentor** (750 pts): Guiding others
- **Community Pillar** (1000 pts): Foundation of the community

## Running the Project

The app runs with `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Extension Framework

The platform includes a flexible extension system for adding custom functionality:

### Extension Structure
Extensions are TypeScript modules in `server/extensions/` that export:
- `manifest`: Metadata including name, version, hooks, and permissions
- `handler`: Async function that responds to platform events

### Available Event Hooks
- User: `user.registered`, `user.profile_updated`
- Posts: `post.created`, `post.updated`, `post.deleted`, `post.liked`
- Comments: `comment.created`, `comment.deleted`
- Groups: `group.created`, `group.joined`, `group.left`
- Valorization: `points.awarded`, `badge.earned`, `level.up`
- Games: `game.score_saved`
- Extensions: `extension.installed`, `extension.enabled`, `extension.disabled`

### Extension Context API
- `context.log(level, message, metadata)` - Log for debugging
- `context.awardPoints(userId, points, actionType, description)` - Award valorization points
- `context.awardBadge(userId, badgeId)` - Award badges
- `context.getConfig()` / `context.setConfig(config)` - Manage configuration

### Sample Extension
See `server/extensions/samples/welcome-extension.ts` for a working example.

## Recent Changes

- Integrated Auth0 authentication
- Applied DisabilitySquare brand colors
- Added logo to landing page and sidebar
- Implemented accessibility controls
- Implemented Valorization Points System (SRV model)
- Added Recognition page with leaderboard and activity feed
- Auto-badge awarding when users reach point thresholds
- Sidebar displays user points and level
- Profile page shows earned badges
- Added Extension Framework for platform extensibility
- Extensions page with documentation and management UI
- Added admin role persistence (first user becomes admin, stored in database)
- Extension management routes now require admin authorization
- Hardened extension entry point validation with path resolution and symlink checks
- ExtensionContext now uses storage methods for consistent valorization behavior
