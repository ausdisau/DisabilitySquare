# DisabilitySquare

## Overview
DisabilitySquare is an accessible social networking platform dedicated to people with disabilities. It aims to foster a supportive community through features like groups, a village square feed, private messaging, and games. The platform integrates a Social Role Valorization (SRV) model to reward genuine interactions and offers unique features such as a Spoon Tracker, Health Journal, Service Provider Directory, Resource Library, Job Board, and an Accessible Transport Search & Booking module. It differentiates itself from competitors by incorporating Australian-specific features like NDIS-awareness and eSafety compliance, aiming to be a comprehensive patient support network.

## User Preferences
The user wants me to focus on creating a concise, streamlined replit.md that focuses on the essential information for guiding a replit coding agent. The compressed version should prioritize information in this exact order: Overview, User Preferences, System Architecture, External Dependencies. I must remove all changelogs, update logs, and date-wise entries. I need to focus on high-level features only, avoid granular implementation details, consolidate redundant information, and prioritize architectural decisions over implementation specifics. External dependencies should focus on what's actually integrated. I must output the compressed replit.md content within <replit_md> tags in proper Markdown format.

## System Architecture

### Core Design Principles
The platform is built with accessibility as a core principle, featuring high contrast mode, adjustable font sizes, keyboard navigation, skip links, and ARIA labels. It utilizes a Valorization Points System based on the Social Role Valorization (SRV) model to encourage meaningful community engagement, awarding points for activities and auto-awarding badges and levels.

### UI/UX
The UI/UX is designed with a 2004-era social network aesthetic, featuring a fixed-width boxy layout, colored section headers, flat post cards, a top navigation bar, a chronological feed with a right sidebar for community stats, top members, and groups. Brand colors include Navy Blue (#1B4B8A), Orange (#E07830), Teal (#2A9D8F), and Cream (#F5F2ED).

### Technical Implementations
- **Frontend**: React with Vite, TypeScript, TailwindCSS, shadcn/ui, wouter for routing.
- **Backend**: Express.js with TypeScript, Express routes.
- **Database**: Supabase PostgreSQL with Drizzle ORM.
- **Authentication**: Auth0 (express-openid-connect).
- **Extension Framework**: A flexible system allowing for custom functionality via TypeScript modules with defined event hooks (e.g., user, posts, comments, groups, valorization, games, extensions) and a context API for interaction.

### Feature Specifications
- **Spoon Tracker**: A 12-spoon energy selector with daily notes, 14-day history, and streak stats.
- **Health Journal**: Daily mood tracking, symptom selection, pain/energy level sliders, and private notes with a historical view.
- **Service Provider Directory**: Browsable and searchable directory of Australian disability service providers, filterable by category, state, and NDIS registration.
- **Resource Library**: Curated Australian disability resources, bookmarkable, filterable, and searchable.
- **Job Board**: Disability-welcoming job listings, filterable, with accessible workplace badges.
- **Transport Module**: Accessible transport search and booking with a multi-step flow, accessibility need filters, NDIS eligibility badges, and price calculation using Google Maps Directions API. It uses an Adapter Pattern for transport providers.
- **Patient Support Network Features**:
    - **Empathetic Reactions**: Replaces simple "Like" with "Hug", "Me Too", "Helpful", "Inspiring" reactions.
    - **Health Story Prompts**: Profile prompts like "What I wish people knew about my condition."
    - **Peer Connect**: Matches users by shared diagnosis, interests, and location.
    - **Daily Wellness Check-In**: Quick mood check-in with streak tracking.
- **Community Forums**: Structured bulletin board with 8 categories, thread types (General, Advice Request), upvoting, accepted answers, and valorization points for participation.
- **Blogs & Personal Stories**: Long-form writing space where members can publish personal stories, lived-experience articles, and community essays. Features include draft/publish workflow, rich textarea editor, tags (up to 5), empathetic reactions (hug, me too, helpful, inspiring), comments, and safety reporting on posts. Pages: `/blogs` (listing with tag filter), `/blogs/write` (new post), `/blogs/edit/:id` (edit), `/blogs/my` (manage own posts), `/blogs/:slug` (post detail).

- **Discover & Participate**: Personalised social graph with people suggestions, matched services, accessible events with venue accessibility metadata, and a 5-step Participation Journey wizard (activity → support needs → service provider → accessible transport → confirm).
- **Admin eSafety Reports**: Moderation dashboard for reviewing eSafety reports with scheme classification, status workflow, and user deactivation.

### CSS Design System
All pages use `sm-*` CSS tokens defined in `index.css` — never use shadcn `Card`/`CardContent`/`CardHeader`/`CardTitle` for page-level layouts. Key tokens: `sm-card`, `sm-card-title`, `sm-card-body`, `sm-post` (left accent border), `sm-nav-link`, `sm-profile-panel` (navy gradient identity card at top of sidebar), `sm-topbar`.

### Database Schema
Key tables include `users`, `profiles`, `groups`, `posts`, `comments`, `gameScores`, `badges`, `user_badges`, `points_ledger`, `user_points`, `transport_providers`, `transport_vehicles`, `trip_quotes`, `trips`, `post_reactions`, `forum_categories`, `forum_threads`, `forum_replies`, `forum_votes`, `venues`, `events`, `event_attendees`, `user_connections`, `user_service_affinities`, `participation_journeys`, `blog_posts`, `blog_comments`, and `blog_post_reactions`.

### DB Column Notes
- `transport_providers` table: uses `kind` column (not `type`), has `ndis_support`, `rate_card` (jsonb), `adapter_key`, `active`
- New tables (venues, events, event_attendees, user_connections, user_service_affinities, participation_journeys) created via direct SQL (drizzle push is interactive)

## External Dependencies
- **Auth0**: For user authentication.
- **Supabase PostgreSQL**: Primary database solution.
- **OpenAI**: For AI/Accessibility features like voice-to-text transcription.
- **Google Maps Directions API**: Used for price calculation in the Transport Module (with a fallback to haversine estimation).
- **Uber Guest Rides Adapter**: Optional integration for transport services if `UBER_CLIENT_ID` and `UBER_CLIENT_SECRET` are configured.