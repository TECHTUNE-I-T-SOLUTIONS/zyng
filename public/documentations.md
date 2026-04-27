# Zyng Developer Documentation

This document is the long-form product and engineering guide for Zyng. It is written for future teammates, collaborators, reviewers, and maintainers who need to understand not just what the app does today, but why it exists, how it is structured, and what is still evolving.

## 1. Product Summary

Zyng is a campus-exclusive social platform built around semi-anonymous expression, campus relevance, and a strong trust model.

The product is intentionally not a generic social network. It is designed to feel like a living campus layer where students can speak honestly through personas, interact in real time, discover opportunities, and move into an alumni professional space after graduation.

The project currently spans:

- Student-facing social experiences
- Alumni-facing professional experiences
- Admin and moderation tools
- Database-driven maintenance mode
- Thin API routes backed by service-layer logic

## 2. Product Vision

The long-term vision is for Zyng to become the most relevant digital voice of campus life, then naturally grow into an alumni network and opportunity layer after graduation.

The core idea is:

- students should feel safe to speak
- content should feel immediate and local
- alumni should have a reason to stay
- the platform should reward trust, relevance, and participation

## 3. What Zyng Is Solving

Most campus products either:

- over-expose identity and kill honest expression, or
- hide identity so much that the platform loses accountability and usefulness

Zyng balances both. Users speak through personas, but the system still maintains a real user account, trust score, referral history, moderation trail, and campus affiliation.

That gives us:

- lower friction for posting
- more candid content
- moderation leverage
- better safety and accountability

## 4. Current Product State

Zyng is no longer just an idea or a static UI shell. The repository now contains:

- a public marketing site
- auth pages for users and admins
- a student app under `/z-*`
- an alumni app under `/z-alumni/*`
- admin/moderation routes under `/z-manage/*`
- service-layer logic in `lib/services`
- Supabase-backed schema and maintenance SQL
- notification triggers for many core events
- route documentation and sitemap files

## 5. What Already Exists

### Public site

The public app explains the product, features, privacy model, terms, and contact flow.

### User auth

The user auth flow currently supports:

- signup
- login
- recovery using a security question

### Student experience

The student-side experience includes:

- feed
- post creation
- post detail
- personas
- notifications
- profile
- messages
- rooms
- events
- jobs
- marketplace
- search
- referral
- pro hub

### Alumni experience

The alumni experience is separated from the student experience and includes:

- alumni feed
- alumni create
- alumni post detail
- alumni messages
- alumni profile
- alumni pro workspace
- alumni jobs
- alumni events
- alumni marketplace
- alumni notifications
- alumni personas
- alumni referral
- alumni rooms
- alumni search
- alumni portfolio

### Admin experience

The admin console currently covers:

- dashboard
- users
- content moderation
- database overview
- verification queue

### Maintenance mode

Maintenance mode is now a real database-driven feature with:

- a settings table
- an audit log table
- a fixed banner in the app shell
- admin controls for toggling and editing banner text
- notification triggers for users and admins when maintenance starts and ends

## 6. Architecture Overview

Zyng uses a fairly standard but intentionally thin architecture:

Client UI
→ Next.js App Router pages
→ thin API routes
→ service-layer logic in `/lib`
→ Supabase/PostgreSQL

The design principle is simple:

- routes validate and hand off
- services do the reusable data work
- the database owns persistence and triggers

That keeps the app easier to scale and easier to hand off to a team.

## 7. Code Organization

Important paths:

- `app/` - all routes and pages
- `lib/services/` - reusable data and domain logic
- `lib/db/schema.sql` - production schema
- `lib/db/maintenance.sql` - maintenance mode schema and triggers
- `lib/db/maintenance-fix.sql` - foreign key correction for maintenance updates
- `components/` - shared UI components
- `docs/` - route lists and route behavior docs
- `public/schools/` - school seed data

## 8. Data Model Philosophy

The database is designed around real product behavior, not just display needs.

Examples:

- `users` stores the account identity and campus affiliation
- `personas` stores public-facing identities
- `posts` stores the content the user publishes
- `replies` and `reactions` capture engagement
- `notifications` stores user-facing alerts
- `admin_notifications` stores moderation and operations alerts
- `reports` and `report_reviews` capture moderation workflow
- `referrals` captures growth and signup attribution
- `resumes` captures alumni career data
- `opportunities` and `opportunity_applications` capture the jobs layer
- `maintenance_settings` and `maintenance_audit_logs` power maintenance mode

That structure is important because a new engineer should be able to trace a feature from UI to service to SQL quickly.

## 9. Notifications Strategy

Notifications are intentionally broad and event-driven.

The system currently notifies users and admins for events like:

- user signup
- school creation and activation
- persona creation
- post creation and updates
- replies
- reactions
- chat-related events
- room activity
- resume changes
- opportunity creation and matching
- referrals
- reports and report reviews
- verification submission and completion
- maintenance mode on/off

The notification system is designed to keep the platform feeling active and to inform the right people at the right time.

## 10. Admin and Moderation

Admin capability is now split into levels:

- `super`
- `admin`
- `sub`
- `moderator`

Important point for the team:

- the UI hides privileged controls where possible
- the API routes also enforce admin access server-side
- the maintenance controls are readable and writable only by verified admins

That means the app does not rely only on the front end for protection.

## 11. Maintenance Mode

Maintenance mode is a first-class feature, not an afterthought.

It has:

- editable banner title
- editable banner message
- a database row that stores current state
- audit logs for changes
- automatic notifications when maintenance starts and ends

It is intended to be visible but non-disruptive:

- fixed at the top
- thin on mobile and desktop
- does not reflow the page heavily
- easy to dismiss visually while still being noticeable

## 12. Current Feature Set by Role

### Student

- create a user account
- create personas
- post content
- reply and react
- receive notifications
- search campus content
- explore opportunities
- build a referral identity
- use pro tools

### Alumni

- maintain a professional identity
- write alumni posts
- view matched opportunities
- create or apply to opportunities
- manage resumes
- track referral activity
- engage in alumni rooms and messaging

### Admin

- review reports
- review verification requests
- manage users
- inspect platform health
- toggle maintenance mode
- create admin accounts if super-admin

## 13. What Is Still In Progress

These areas are not necessarily unfinished, but they are still the places where future work will likely happen:

- better server-side validation for all forms
- more robust password hashing for recovery secrets
- fuller admin role management UI
- richer resume editing UX
- better opportunity matching heuristics
- room creation and room detail workflows
- notification filtering and read/unread management
- stronger RLS and policy documentation
- tests for critical workflows

## 14. Future Roadmap

### Phase 1: Stabilization

- tighten auth and recovery flows
- improve data validation
- seed and backfill missing profile data
- add test coverage for core routes and services

### Phase 2: Social depth

- richer replies and threads
- content sharing
- better room experiences
- better moderation tooling

### Phase 3: Growth and alumni retention

- more opportunity tooling
- referral rewards
- alumni profile exports
- resume templates and ATS-friendly exports

### Phase 4: Real-time expansion

- voice rooms
- live calls
- deeper realtime presence

### Phase 5: Platform maturity

- analytics dashboards
- richer admin governance
- fine-grained permissions
- automation around moderation and engagement

## 15. Testing Status

What has already been validated locally:

- Next.js production build completes successfully
- route groups do not collide
- admin APIs enforce server-side authorization
- alumni and student route trees coexist
- maintenance banner renders without breaking layout

What still needs deeper coverage:

- server-side integration tests for auth and recovery
- database migration validation in Supabase
- permission tests for admin routes
- smoke tests for maintenance on/off

## 16. Deployment Notes

Before shipping:

- confirm `.env.local` uses the correct Supabase keys
- run the SQL migrations in the correct order
- verify `maintenance-fix.sql` after `maintenance.sql`
- update `sitemap.xml` with the real production domain
- ensure admin seed accounts exist if the team needs them

## 17. Developer Onboarding Notes

If a new developer joins the project, the fastest way for them to understand Zyng is:

1. Read this file.
2. Read `README.md`.
3. Read `docs/routes.md`.
4. Read `docs/route-guide.md`.
5. Inspect `lib/db/schema.sql`.
6. Inspect `lib/services/`.
7. Compare a student route and an alumni route side by side.

That should give them a good mental model of how the product is shaped.

## 18. Product Principles

Zyng should always try to be:

- campus-first
- trust-aware
- fast and lightweight
- easy to moderate
- clear about what belongs to students and what belongs to alumni
- simple enough to use quickly, but deep enough to stay relevant

## 19. Final Note

Zyng succeeds if the platform feels:

- alive on campus
- useful after graduation
- safe enough for honest expression
- structured enough for moderation and growth

The goal is not just feature count. The goal is cultural relevance.
