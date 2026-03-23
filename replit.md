# DisabilitySquare

An accessible social networking platform for people with disabilities.

## Overview

DisabilitySquare is a community-focused platform designed with accessibility as a core principle. It provides a safe space for people with disabilities to connect, share experiences, and engage with others through community groups, a village square feed, private messaging, and games.

## Tech Stack

- **Frontend**: React with Vite, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: Supabase PostgreSQL with Drizzle ORM (falls back to local DATABASE_URL if SUPABASE_DATABASE_URL not set)
- **Authentication**: Auth0 (express-openid-connect)
- **Routing**: wouter (frontend), Express routes (backend)
- **AI/Accessibility**: OpenAI integration for voice-to-text transcription

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

## Competitive Features (vs Spoony & others)

Five key features added to differentiate DisabilitySquare:

### 1. Spoon Tracker (`/spoons`)
- 12-spoon energy selector (spoon theory)
- Optional daily note
- 14-day bar chart history
- 30-day average and streak stats

### 2. Health Journal (`/journal`)
- Daily mood tracking (1-5 scale with emoji)
- Symptom selection (common + custom)
- Pain level and energy level sliders
- Private notes per day
- History view of all past entries (private to user only)
- Navigate back/forward through dates

### 3. Service Provider Directory (`/providers`)
- Browse 10+ seeded Australian disability service providers
- Filter by category, state, NDIS registration
- Search by name
- Submit new providers for admin review
- Full NDIS registration details displayed

### 4. Resource Library (`/resources`)
- Curated AU disability resources (NDIS, mental health, legal, employment, housing, etc.)
- Bookmark/save resources for quick access
- Filter by category or search
- Submit resources for community review
- Track how many people saved each resource

### 5. Job Board (`/jobs`)
- Disability-welcoming job listings
- Filter by category, state, type, remote
- Post jobs for admin review
- Shows accessible workplace and disability-welcome badges
- Click-through to apply online or via email

## Transport Module (`/transport`)

Accessible transport search and booking feature:

### Features
- **Public/Guest access**: No login required; session tracked via `sessionStorage`
- **Multi-step booking flow**: Search → Quote Results → Confirmation
- **My Trips tab**: View and cancel active/past trips
- **Accessibility need filters**: wheelchair, ramp, driver assistance, low sensory, no stairs
- **NDIS eligibility badges**: Shown per provider
- **Price calculation**: Uses Google Maps Directions API (falls back to haversine estimate if key not configured)

### API Endpoints
- `POST /api/transport/quote` — Get transport quotes for a trip
- `POST /api/transport/trips` — Book a trip from a quote
- `GET /api/transport/trips/:id` — Get a specific trip
- `GET /api/transport/trips?sessionId=...` — List trips for session/user
- `POST /api/transport/trips/:id/cancel` — Cancel a pending booking
- `POST /api/transport/seed-demo` — Seed demo transport data

### Adapter Pattern
Located in `server/transport/adapters/`:
- **ZoomlyManualAdapter** (`zoomly_manual`): Default, returns pending status with reference
- **UberGuestRidesAdapter** (`uber_guest`): Stub, activates only when `UBER_CLIENT_ID` + `UBER_CLIENT_SECRET` are set

### Database Tables
- `transport_providers`: Provider name, kind, NDIS support, rate card, adapter key
- `transport_vehicles`: Vehicle type, capacity, accessibility features, lat/lng
- `trip_quotes`: Quote with options, pricing, expiry
- `trips`: Booked trip with status, external ref, price

### Demo Seed
Two providers auto-seeded on server startup near Sydney CBD:
1. **Sydney Accessible Transport Co.** (WAT, NDIS eligible)
2. **CityRide Partner Network** (rideshare, standard)

### Google Maps Configuration
Set `GOOGLE_MAPS_API_KEY` environment variable to enable real routing. Falls back to haversine distance estimation.

## Patient Support Network Features

DisabilitySquare is positioned as a patient support network comparable to The Mighty, BioNews, Spoony, and SuperHue, with Australian-specific differentiators.

### Empathetic Reactions System
Replaces/augments the simple Like button with 4 empathetic reaction types (inspired by The Mighty):
- 🤗 **Hug** — emotional validation
- ✋ **Me Too** — shared experience
- 💡 **Helpful** — practical value
- ✨ **Inspiring** — uplifting content

API: `POST /api/posts/:id/react`, `DELETE /api/posts/:id/react`, `GET /api/posts/:id/reactions`, `POST /api/reactions/bulk`
Table: `post_reactions` (unique per user per post)
Component: `client/src/components/PostReactions.tsx`

### Health Story Prompts
Profile prompts inspired by The Mighty's community engagement model:
- "What I wish people knew about my condition"
- "My good day looks like"
- "Support looks like"

Stored as `healthPrompts` JSONB column in `profiles` table. Shown on member cards in /connect.

### Peer Connect (`/connect`)
Diagnosis-based peer matching inspired by Spoony's matching system. Matches users by:
1. Shared diagnosis (weighted highest)
2. Common interests
3. Same location

API: `GET /api/connect/matches` (scored matches), `GET /api/connect/members` (browse all)
Page: `client/src/pages/Connect.tsx`

### Daily Wellness Check-In
Quick mood check-in (1-5 emoji scale) stored via the existing journal API. Shows check-in streak.
Component: `client/src/components/WellnessCheckIn.tsx`

### Australian Differentiators
- Data hosted in AU (Supabase)
- NDIS-aware transport and service directory
- eSafety compliance (16+ age gate, content moderation)
- Australian service providers seeded

## Community Forums (`/forums`)

A structured, pre-algorithmic bulletin board system for peer advice and community discussion.

### Features
- **8 categories**: Mental Health, Mobility & Physical, Chronic Pain, NDIS & Funding, Daily Living, Diagnosis & Medical, Work & Employment, General Discussion
- **Thread types**: General discussion OR Advice Request (with accepted answer marking)
- **Upvoting**: Members can upvote threads and replies (one vote per entity per user, toggleable)
- **Accepted Answer**: Original poster can mark one reply as the accepted answer on Advice Request threads — pinned at top
- **Valorization**: Thread creation (+15pts), thoughtful reply (+10pts), reply (+5pts), accepted answer (+20pts)
- **Retro design**: Matches site aesthetic with retro-box, retro-post components

### API Endpoints
- `GET /api/forums/categories` — List all categories
- `GET /api/forums/categories/:slug` — Get category by slug
- `GET /api/forums/categories/:slug/threads` — List threads (by lastActivityAt desc)
- `POST /api/forums/categories/:slug/threads` — Create thread
- `GET /api/forums/threads/:id` — Get thread with replies
- `POST /api/forums/threads/:id/replies` — Post reply
- `POST /api/forums/threads/:id/vote` — Toggle upvote on thread
- `POST /api/forums/replies/:id/vote` — Toggle upvote on reply
- `POST /api/forums/votes/bulk` — Get user's votes for multiple entities
- `POST /api/forums/replies/:id/accept` — Mark reply as accepted answer

### Database Tables
- `forum_categories`: id, name, slug, description, icon, threadCount, lastActivityAt, sortOrder
- `forum_threads`: id, categoryId, authorId, title, body, isAdviceRequest, isSolved, mediaUrls, upvotesCount, replyCount, tags, lastActivityAt, createdAt
- `forum_replies`: id, threadId, authorId, body, isAcceptedAnswer, mediaUrls, upvotesCount, createdAt
- `forum_votes`: id, userId, entityType, entityId, createdAt (unique per userId+entityType+entityId)

### Frontend Pages
- `client/src/pages/Forums.tsx` — Category list
- `client/src/pages/ForumCategory.tsx` — Thread list for a category
- `client/src/pages/ForumThread.tsx` — Thread detail with replies and reply composer
- `client/src/components/CreateThreadDialog.tsx` — Modal form to create threads

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
- Added 5 competitive features: Spoon Tracker, Health Journal, Service Directory, Resource Library, Job Board
- Seeded 10 service providers, 10 resources, 6 job listings (all approved)
- Added Transport Search & Booking Module with adapter pattern, NDIS support, public access
- Redesigned UI to 2004-era social network aesthetic: fixed-width boxy layout, colored section headers, flat post cards, top nav bar, chronological feed with right sidebar (community stats, top members, groups)
- Added Social/Knowledge Graph — Participation Matching & Discover Page (`/discover`)
