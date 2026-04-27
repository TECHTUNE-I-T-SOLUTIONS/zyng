# Zyng

<p align="center">
  <img src="public/logo.png" alt="Zyng logo" width="96" />
</p>

<p align="center">
  <strong>Campus voice. Alumni growth. Trust-first social product.</strong>
</p>

<p align="center">
  <a href="docs/routes.md">Routes</a> ·
  <a href="docs/route-guide.md">Route Guide</a> ·
  <a href="public/documentations.md">Developer Docs</a> ·
  <a href="lib/db/schema.sql">Schema</a> ·
  <a href="public/vibecoding.md">Vibe Coders</a>
</p>

<p align="center
</p>

## Overview

Zyng is a campus-exclusive, semi-anonymous social platform for students and alumni.

It combines:

- persona-based posting
- campus communities
- messaging
- referrals
- opportunities
- moderation
- alumni professional tooling
- maintenance-mode controls

The product is organized so that student and alumni experiences stay separate but still share the same foundation where appropriate.

## Product At A Glance

- Public marketing site
- Student auth and onboarding
- Student feed, personas, posts, replies, rooms, notifications, search, referrals, pro hub
- Alumni experience under `/z-alumni`
- Admin and moderation console under `/z-manage`
- Maintenance banner and admin-controlled maintenance state
- Thin API routes with service-layer logic
- Supabase/PostgreSQL schema with event-driven triggers

## Visual Direction

The app leans toward:

- bold contrast
- compact, high-density UI
- dark professional surfaces for admin and alumni areas
- bright accent treatments for critical actions
- thin persistent status UI where needed, such as maintenance mode

That styling direction is intentional. It keeps the product feeling serious, modern, and operational rather than generic.

## How The Codebase Is Organized

- [`public/documentations.md`](public/documentations.md) - long-form developer guide
- [`public/vibecoding.md`](public/vibecoding.md) - how to work on Zyng quickly and safely
- [`docs/routes.md`](docs/routes.md) - route URL list
- [`docs/route-guide.md`](docs/route-guide.md) - route purpose guide
- [`public/schools/`](public/schools/) - school and department seed data
- [`lib/db/schema.sql`](lib/db/schema.sql) - core schema
- [`lib/db/maintenance.sql`](lib/db/maintenance.sql) - maintenance-mode schema and triggers
- [`lib/db/maintenance-fix.sql`](lib/db/maintenance-fix.sql) - maintenance FK correction
- [`components/`](components/) - shared UI
- [`lib/services/`](lib/services/) - shared service logic

## Key Runtime Areas

### Student experience

The student app lives under the core `/z-*` routes and covers:

- feed and posting
- notifications
- profile and personas
- messaging and rooms
- events, jobs, marketplace, search, and referrals

### Alumni experience

The alumni app lives under `/z-alumni/*` and focuses on:

- professional feed
- alumni posting
- opportunity discovery and matching
- resume management
- referrals and profile identity
- alumni-specific search and rooms

### Admin experience

The admin console lives under `/z-manage/*` and covers:

- dashboard
- users
- content moderation
- database view
- verification
- maintenance mode

## Important Docs

- [`public/documentations.md`](public/documentations.md) - read this first if you are joining the project
- [`docs/routes.md`](docs/routes.md) - quick URL index
- [`docs/route-guide.md`](docs/route-guide.md) - route-by-route explanation
- [`sitemap.xml`](sitemap.xml) - production sitemap template

## Environment

The app expects Supabase keys and URLs in `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` for legacy compatibility
- `SUPABASE_SECRET_KEY` for server-only routes

## Database

Supabase/PostgreSQL powers:

- users
- personas
- posts
- replies
- reactions
- reports and report reviews
- referrals
- resumes
- opportunities and applications
- notifications
- admin notifications
- maintenance mode tables and audit logs

Run the SQL files in this order:

1. [`lib/db/schema.sql`](lib/db/schema.sql)
2. [`lib/db/maintenance.sql`](lib/db/maintenance.sql)
3. [`lib/db/maintenance-fix.sql`](lib/db/maintenance-fix.sql)

## Build And Verify

```bash
pnpm build
```

## Notes For New Contributors

- The app uses a service layer for reusable data access.
- API routes should stay thin.
- Client-side access is intentionally limited for admin and maintenance operations.
- The maintenance banner is database-driven and fixed at the top without breaking layout.

## Roadmap Summary

- stronger validation and test coverage
- deeper resume and application workflows
- richer moderation and admin tooling
- more realtime features
- continued alumni growth tooling

## License

Internal project.
