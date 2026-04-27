# Zyng Vibecoding Guide

This guide explains how to work on Zyng in a fast, collaborative, and product-aware way.

The goal is not just to ship code. The goal is to ship code that fits the product, respects the architecture, and keeps the campus and alumni experiences cleanly separated.

## 1. What Vibecoding Means Here

In Zyng, vibecoding means:

- moving quickly without losing the product vision
- making changes in small, understandable steps
- checking the existing app structure before adding new work
- keeping UI, service logic, and database logic aligned
- using the right route group for the right user experience

It does not mean:

- throwing features into random files
- bypassing service layers
- hardcoding values that should come from the database
- mixing student and alumni concerns
- leaving half-finished flows behind without checking build status

## 2. Working Style

When you build in Zyng, think in this order:

1. Understand the user role.
2. Find the correct route group.
3. Check whether the feature already has a service or API route.
4. Check the schema before inventing new fields.
5. Update types if the UI needs new data.
6. Keep the UI clean and aligned with the visual language of that area.
7. Verify with a build or typecheck before moving on.

That rhythm keeps the project from drifting.

## 3. Core Principles

### Keep concerns separated

- Public pages stay public.
- Student pages stay in the core app.
- Alumni pages stay in `/z-alumni`.
- Admin pages stay in `/z-manage`.
- Backend-only logic stays in routes or services, not in the browser.

### Prefer the service layer

If a feature is reused, it should live in `lib/services` instead of being copied into several pages.

### Let the database do real work

Use SQL tables, triggers, and relationships when the behavior belongs in the database.

Examples:

- notifications
- maintenance mode
- report reviews
- referrals
- opportunity matching

### Keep routes thin

Routes should validate, authorize, call services, and return data.

They should not become a second business-logic layer.

## 4. How To Add A New Feature

Use this checklist:

1. Define the feature from the user’s point of view.
2. Decide whether it belongs to student, alumni, or admin.
3. Check if the schema already supports it.
4. Add or update schema if needed.
5. Add or update a service function.
6. Add a thin API route if the browser should not talk directly to the database.
7. Build the UI in the correct route group.
8. Update types if the page needs new fields.
9. Run `pnpm build`.
10. Document the route if it is new or important.

## 5. UI Expectations

### Student UI

- energetic
- campus-first
- fast to use
- focused on expression and discovery

### Alumni UI

- more professional
- calmer
- career-oriented
- less playful, more intentional

### Admin UI

- compact
- clear
- high contrast
- operational and safe

### Maintenance Banner

- thin
- fixed
- readable
- visible without disrupting the page

## 6. Data Expectations

When building forms and workflows, use the real schema fields.

If a column exists in the database and the feature depends on it, the UI should try to capture it or backfill it.

Important examples:

- `users.full_name`
- `users.z_name`
- `users.school_id`
- `users.faculty_id`
- `users.department_id`
- `users.course_of_study`
- `users.hobbies`
- `users.skills`
- `users.bio`
- `users.graduation_date`
- `users.referral_code`
- `users.security_question`
- `users.security_answer_hash`
- `admins.level`
- `maintenance_settings.is_enabled`
- `maintenance_settings.title`
- `maintenance_settings.message`

If the data is not meant to be filled by the client, it should be created by a route, service, or trigger instead.

## 7. Authentication And Security

Use the correct Supabase client for the correct context:

- public browser code should use the publishable or anon key
- backend routes should use the secret key client
- admin routes must verify the current user against `admins`

Never move secret-only logic into a public component.

For protected actions:

- verify the session
- verify the role
- reject unauthorized requests on the server

## 8. Database And Triggers

If the behavior is important and recurring, prefer database triggers.

Good trigger candidates in Zyng:

- maintenance mode notifications
- report review notifications
- referral signup notifications
- opportunity matching notifications
- verification notifications

If a trigger is added, check:

- table names
- foreign key references
- column names
- insert order
- whether the notification should go to users, admins, or both

## 9. How To Avoid Mistakes

Before you ship, check:

- does this route already exist?
- is there an existing service function I should reuse?
- does the schema contain the fields I’m writing?
- is this client-side or server-side work?
- does the admin route need authorization?
- is the banner/layout going to disrupt the screen?
- did I update types if the UI depends on new nested data?

## 10. What To Do When Moving Fast

When vibecoding, do small loops:

- inspect
- modify
- build
- review
- repeat

That is much safer than making a lot of changes without validating them.

## 11. Good Zyng Habits

- Use clear route names.
- Keep alumni and student experiences separate.
- Keep the admin console protected.
- Prefer explicit data access over assumptions.
- Make banners and alerts visible but non-disruptive.
- Keep docs updated when routes or workflows change.
- Leave future contributors enough context to continue without guessing.

## 12. Anti-Patterns

Avoid:

- hardcoding temporary data in production flows
- using client-side code for privileged actions
- writing directly to the database from random pages when a service already exists
- copying the same logic across student and alumni pages
- leaving stale references to old columns
- introducing UI that breaks the product’s tone

## 13. Team Collaboration

When a team joins later, the easiest way to work in Zyng is:

- read the documentation first
- follow the route guide
- understand the role separation
- inspect the service layer before editing UI
- keep changes small and reviewable

That makes vibecoding productive instead of chaotic.

## 14. Final Reminder

Zyng should always feel:

- campus-aware
- professional where it needs to be
- safe to use
- fast to move through
- easy to maintain as the team grows

If a change does not help with that, it probably needs to be simplified.

