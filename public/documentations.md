ZYNG – Super Detailed Product & Technical Documentation (MVP → Scale)
1. Vision
Zyng is a campus-exclusive, semi-anonymous social platform designed to enable raw, honest, and real-time student expression. It prioritizes authenticity, relevance, and emotional engagement over polished identity-based social media.
The goal is not to be another social app, but to become: > “The real voice of campus life.”
________________________________________
2. Product Strategy
Core Philosophy
•	Low friction entry
•	High emotional engagement
•	Hyper-local relevance (campus-based)
•	Anonymity with accountability
Success Metric (MVP)
•	Daily active usage per campus
•	Posts per user per day
•	Reply depth (conversation quality)
________________________________________
3. MVP Feature Set (With Purpose)
3.1 Anonymous Feed (Core Engine)
Users can post anonymously via personas.
Why it matters:
•	Removes fear of judgment
•	Encourages honesty
•	Drives high engagement
________________________________________
3.2 Persona System
Users create multiple identities.
Why it matters:
•	Psychological safety
•	Freedom of expression
•	Identity flexibility
________________________________________
3.3 Expiring Posts (6h / 24h / 48h)
Why it matters:
•	Reduces long-term risk
•	Encourages real-time sharing
•	Keeps content fresh
________________________________________
4. Advanced Post Types (Key Differentiator)
Instead of just “posts”, Zyng introduces structured post types.
________________________________________
4.1 Regular Post
•	General thoughts, updates
________________________________________
4.2 Confession Posts
•	Anonymous emotional sharing
Why it matters:
•	High virality
•	Deep engagement
•	Builds habit
________________________________________
4.3 Polls
•	Quick opinion gathering
Why it matters:
•	Fast interaction
•	Easy engagement
________________________________________
4.4 Hot Takes
•	Short opinion-based posts
Why it matters:
•	Drives debates
•	High reply rates
________________________________________
4.5 Missed Connections
•	“Saw someone…” posts
Why it matters:
•	Emotional hook
•	Viral potential
________________________________________
4.6 Trend Posts
•	Users create campus trends
Why it matters:
•	Community identity
•	Repeat engagement
________________________________________
4.7 Campus Pulse Posts
•	Captures real-time sentiment
Why it matters:
•	Makes platform feel alive
•	Encourages daily check-ins
________________________________________
5. Social Expansion Features (Phase 2)
5.1 Rooms
Topic-based discussion spaces.
Why it matters:
•	Structured conversations
•	Community building
________________________________________
5.2 Messaging (Controlled)
•	Reply → DM transition
Why it matters:
•	Keeps initial simplicity
•	Enables deeper connection
________________________________________
5.3 Events
•	Create & join campus events
Why it matters:
•	Real-world connection
•	Utility beyond content
________________________________________
6. Growth & Opportunity Layer (Phase 3)
6.1 Job Board
•	Student-focused opportunities
Why it matters:
•	Monetization potential
•	Long-term value
________________________________________
6.2 Alumni Mode
After graduation:
•	Profile evolves into professional identity
Why it matters:
•	Retention beyond school
•	Career bridge
________________________________________
7. Real-Time Features (Phase 4)
7.1 Voice Rooms (Agora)
•	Drop-in conversations
7.2 Calls
•	Voice & video
Why it matters:
•	Real-time engagement
•	Strong retention
________________________________________
8. Trust & Safety System
Trust Score
Based on:
•	Engagement
•	Reports
•	Activity
Impact:
•	Feature access
•	Posting limits
________________________________________
Moderation
•	Reporting system
•	Auto restrictions
________________________________________
9. Pages & Routes
Public
•	/
•	/login
•	/verify
Authenticated
•	/feed
•	/post/[id]
•	/create
•	/rooms
•	/events
•	/notifications
•	/profile
•	/personas
________________________________________
10. Tech Stack
Frontend
•	Next.js (App Router)
•	Tailwind CSS
•	React Query
•	Zustand
Backend
•	Next.js API routes (thin controllers)
•	Service layer in /lib
Database
•	Supabase (PostgreSQL)
Storage
•	Playbook API
Auth
•	Custom JWT (Supabase-compatible)
Deployment
•	Vercel
________________________________________
11. System Architecture
Client (Next.js) → API Routes (thin) → Service Layer → Database (Supabase) → Storage (Playbook)
________________________________________
12. Performance Strategy
•	Server Components
•	Streaming + Suspense
•	Minimal client JS
•	Lazy loading
•	Cursor-based pagination
Goal:
•	Ultra-fast performance (2G compatible)
________________________________________
13. Database Schema (Core Tables)
users personas posts replies reactions reports invites rooms events
________________________________________
14. API Design Principle
Routes only:
•	Validate
•	Call service
•	Return response
No business logic inside routes.
________________________________________
15. Launch Plan
•	Start with Unilorin
•	Seed initial users
•	Enable invite system
________________________________________
16. Roadmap
Phase 1:
•	Feed
•	Personas
•	Posts
Phase 2:
•	Rooms
•	Polls
•	Messaging
Phase 3:
•	Events
•	Jobs
•	Trends
Phase 4:
•	Voice (Agora)
________________________________________
17. PWA Strategy
•	Enable installable web app
•	Offline caching (basic)
•	Mobile-first UI
________________________________________
FINAL NOTE
Zyng succeeds if:
•	Students feel safe to speak
•	Content feels real and immediate
•	The campus feels alive inside the app
Not by feature count, but by emotional relevance.
________________________________________
END







ZYNG – Full Technical & Product Documentation
1. Vision
Zyng is a campus-exclusive, semi-anonymous social network designed to enable authentic student expression, connection, and real-time interaction within a trusted environment.
________________________________________
2. Product Scope
Core Pillars
•	Anonymous expression (via personas)
•	Campus-restricted social network
•	Real-time engagement
•	Trust-based access control
________________________________________
3. Feature Breakdown
3.1 Social Layer
•	Anonymous posts (text, image)
•	Threaded replies
•	Reactions (upvote/downvote initially)
•	Trending algorithm
•	Expiring content (6h / 24h / 48h)
3.2 Persona System
•	Multiple personas per user
•	Avatar selection (generated/preset)
•	Persona switching
•	Persona-based reputation
3.3 Connection Layer
•	Follow personas (optional future)
•	Tag friends (persona mentions)
•	Anonymous interactions
3.4 Campus Layer
•	School-based isolation
•	Faculty & department tagging
•	Campus-specific trends
3.5 Trust System
•	Hidden trust score per user
•	Inputs:
o	Upvotes
o	Reports
o	Activity consistency
•	Outputs:
o	Feature unlocks
o	Posting limits
3.6 Invite System
•	Limited invites per user
•	Invite codes/links
•	Growth control per campus
3.7 Notifications
•	Replies
•	Mentions
•	System alerts
3.8 Moderation
•	Report system
•	Auto-flag thresholds
•	Admin dashboard (future)
3.9 Future Extensions
•	Voice rooms (Agora)
•	Video calls (Agora)
•	Anonymous 1-on-1 chat
•	Events hosting
•	Campus marketplace
________________________________________
4. Pages & Routes
Public
•	/ Landing page
•	/login Phone input
•	/verify OTP verification
Authenticated
•	/feed Main feed
•	/post/[id] Post thread
•	/create Create post
•	/personas Manage personas
•	/profile User profile
•	/notifications
________________________________________
5. Tech Stack
Frontend
•	Next.js (App Router)
•	Tailwind CSS
•	Zustand (state management)
Backend (BFF via Next API routes)
•	Next.js API routes
•	Edge + Serverless functions
Database
•	Supabase (PostgreSQL)
Storage
•	Playbook API (media storage)
Auth
•	Custom JWT (signed server-side)
Email
•	Nodemailer
Realtime (optional later)
•	Supabase Realtime / WebSockets
Deployment
•	Vercel
________________________________________
6. Architecture Overview
Client (Next.js) ↓ API Routes (Next.js) ↓ Supabase (DB) ↓ Playbook (Storage)
________________________________________
7. Auth System Design
Flow
1.	User enters phone
2.	OTP sent
3.	Verify OTP
4.	Create user
5.	Issue JWT
JWT Payload
{
  user_id,
  phone,
  issued_at,
  expires_at
}
Important Note (RLS)
If using custom JWT:
•	You CAN still use Supabase RLS
•	But you must:
o	Sign JWT with Supabase secret
o	Match claims (sub = user_id)
________________________________________
8. Database Schema
users
•	id (uuid)
•	phone
•	school
•	department
•	trust_score
•	created_at
personas
•	id
•	user_id
•	username
•	avatar
•	reputation
posts
•	id
•	persona_id
•	content
•	media_url
•	campus
•	expires_at
•	created_at
replies
•	id
•	post_id
•	persona_id
•	content
reactions
•	id
•	user_id
•	post_id
•	type
reports
•	id
•	target_id
•	type
•	reason
invites
•	id
•	code
•	inviter_id
•	used_by
________________________________________
9. API Contracts
POST /api/auth/send-otp
Request:
{ phone }
POST /api/auth/verify
{ phone, otp }
Response:
{ token }
________________________________________
POST /api/post
{ persona_id, content }
________________________________________
GET /api/feed
?campus=unilorin&sort=trending
________________________________________
POST /api/reply
{ post_id, content }
________________________________________
10. Anonymity Protection
•	Never expose user_id
•	Only persona_id used client-side
•	Separate tables for identity mapping
•	Logs restricted
________________________________________
11. Performance Strategy
•	ISR/SSR hybrid rendering
•	Edge caching
•	Image compression (Playbook)
•	Lazy loading
•	Pagination (cursor-based)
Goal:
•	Works on 2G networks
________________________________________
12. Security
•	Rate limiting (Redis optional)
•	Input validation
•	JWT expiration
•	RLS enforcement
________________________________________
13. Deployment Plan
•	Vercel (frontend + API)
•	Supabase (DB)
•	Playbook (storage)
________________________________________
14. Launch Strategy
•	Start with Unilorin
•	Seed 50–100 users
•	Use invite system
________________________________________
15. Roadmap
Phase 1:
•	Core feed
•	Personas
•	Posting
Phase 2:
•	Trust system
•	Notifications
Phase 3:
•	Realtime
•	Voice (Agora)
________________________________________
16. Agora Note
Agora supports:
•	Voice calls
•	Group voice rooms
•	Video calls
Use later for:
•	Anonymous talk rooms
________________________________________
END








ZYNG – Product Documentation (Web MVP → Scalable Platform)
1. Product Overview
Zyng is a campus-based, semi-anonymous social platform designed for students to express themselves freely, connect authentically, and engage in real-time campus conversations without fear of identity exposure.
It combines anonymity, structured social interaction, and trust-based participation to create a safe but vibrant student ecosystem.
________________________________________
2. Core Principles
•	Anonymity with accountability
•	Campus exclusivity
•	Low-friction onboarding
•	Behavior-driven trust system
•	Real-time relevance (hyperlocal content)
________________________________________
3. Target Users
•	University students
•	Polytechnic students
•	College communities
________________________________________
4. MVP Feature Set
4.1 Authentication
•	Phone number login (OTP verification via Termii)
•	No email required
•	Basic onboarding:
o	Select school
o	Select optional department
________________________________________
4.2 Persona System (Core Feature)
Users do not post as themselves.
Each user can:
•	Create multiple personas
•	Customize:
o	Username (e.g., SilentMedic)
o	Avatar (generated or preset)
Rules:
•	Personas are not linked publicly
•	Backend maintains hidden user-persona mapping
________________________________________
4.3 Campus Feed
•	Location: /feed
Features:
•	Anonymous posts
•	Campus-specific content only
•	Sorting:
o	Trending
o	New
Post Types:
•	Text
•	Image (optional for MVP+)
Post Metadata:
•	Persona name
•	Timestamp
•	Expiry timer (6h / 24h / 48h)
Interactions:
•	Reply (threaded)
•	React (upvote/downvote or emoji later)
________________________________________
4.4 Post Expiry System
•	Each post has TTL (time-to-live)
•	Auto-delete or archive after expiration
•	Backend cron or queue handles cleanup
________________________________________
4.5 Trust Score System
Each user has a hidden trust score based on:
•	Engagement quality
•	Reports received
•	Upvotes/downvotes
Effects:
•	Low trust:
o	Limited posting
o	Shadow restrictions
•	High trust:
o	Full features unlocked
________________________________________
4.6 Invite System
•	Each user gets limited invites (e.g., 3)
•	Invite via link or code
•	Required to join certain campuses (optional toggle)
________________________________________
4.7 Reporting & Moderation
Users can report:
•	Spam
•	Abuse
•	Non-student behavior
System:
•	Auto-flag thresholds
•	Temporary persona suspension
•	Admin dashboard for review
________________________________________
4.8 Profile (Private)
Route: /profile
Contains:
•	Phone number (hidden from others)
•	Selected school
•	Department
•	Personas list
•	Trust level indicator
•	Invite count
________________________________________
4.9 Notifications
•	New replies
•	Mentions
•	Invite usage
•	System alerts
________________________________________
5. Pages & Routes
Public
•	/ → Landing page
•	/login → Phone login
•	/verify → OTP screen
Authenticated
•	/feed → Main campus feed
•	/post/:id → Single post thread
•	/create → Create post
•	/profile → User profile
•	/personas → Manage personas
•	/notifications → Notifications
________________________________________
6. Database Design (High-Level)
Users
•	id
•	phone
•	school
•	department
•	trust_score
•	created_at
Personas
•	id
•	user_id
•	username
•	avatar
•	created_at
Posts
•	id
•	persona_id
•	content
•	campus
•	created_at
•	expires_at
Replies
•	id
•	post_id
•	persona_id
•	content
•	created_at
Reactions
•	id
•	user_id
•	post_id
•	type
Reports
•	id
•	target_id
•	target_type
•	reason
•	created_at
Invites
•	id
•	inviter_id
•	code
•	used_by
•	created_at
________________________________________
7. Backend Architecture
Stack
•	Node.js (NestJS or Express)
•	PostgreSQL
•	Redis (for rate limiting, caching)
Key Services
•	Auth Service (OTP handling)
•	Persona Service
•	Feed Service
•	Trust Engine
•	Moderation Service
________________________________________
8. Anonymity Architecture
Critical Rule:
•	Never expose user_id in frontend
Flow:
•	User logs in → gets JWT
•	Creates persona → persona_id used publicly
•	Posts → tied to persona_id only
________________________________________
9. Frontend Architecture
Stack
•	Next.js (App Router)
•	Tailwind CSS
•	Zustand or Redux (state)
Layout
•	Sidebar (desktop)
•	Bottom nav (mobile)
________________________________________
10. UI/UX Principles
•	Minimal, dark-friendly UI
•	Fast interactions
•	No clutter
•	Focus on content
________________________________________
11. Growth Strategy (Phase 1)
•	Launch in ONE campus
•	Seed with 50–100 students
•	Use invite system to expand
________________________________________
12. Future Features
•	Anonymous 1-on-1 matching
•	Voice confessions
•	Campus trends dashboard
•	Event promotions
________________________________________
13. Naming
Zyng / Zyngal both work.
Zyng:
•	Short
•	Punchy
•	Memorable
Zyngal:
•	More unique domain presence
Recommendation: Start with Zyng, secure Zyngal as backup.
________________________________________
14. MVP Goal
Deliver a working anonymous campus feed with:
•	Personas
•	Posting
•	Replies
•	Expiry
•	Trust system (basic)
Launch fast. Iterate based on real usage.
________________________________________
END
