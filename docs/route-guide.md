# Zyng Route Guide

## Public

- `/` - marketing homepage
- `/about` - product story and mission
- `/contact` - contact page
- `/faq` - common questions
- `/features` - feature overview
- `/feedback` - user feedback form
- `/privacy` - privacy policy
- `/terms` - terms of service

## User Auth

- `/in/login` - student login
- `/in/signup` - student registration
- `/in/recover` - password recovery using security question flow

## Student App

- `/z-feed` - student feed
- `/z-create` - create a Zyng post
- `/z-post/[id]` - post detail and replies
- `/z-notifications` - user notifications
- `/z-profile` - student profile
- `/z-personas` - persona management
- `/z-messages` - direct messaging
- `/z-rooms` - discussion rooms
- `/z-events` - campus events
- `/z-jobs` - opportunities and jobs
- `/z-marketplace` - campus marketplace
- `/z-search` - search across content and campus data
- `/z-referral` - referral code and referral tracking
- `/z-pro` - student professional tools
- `/z-pro/create-job` - create opportunity from the student side
- `/z-alumni` - student-facing alumni entry point

## Alumni App

- `/z-alumni/dashboard` - alumni overview
- `/z-alumni/feed` - alumni feed
- `/z-alumni/create` - alumni post composer
- `/z-alumni/post/[id]` - alumni post detail with opportunity matching
- `/z-alumni/messages` - alumni messaging
- `/z-alumni/profile` - alumni identity
- `/z-alumni/pro` - alumni workspace for resumes, opportunities, and applications
- `/z-alumni/jobs` - alumni job board
- `/z-alumni/events` - alumni events
- `/z-alumni/marketplace` - alumni marketplace
- `/z-alumni/notifications` - alumni notifications
- `/z-alumni/personas` - alumni persona management
- `/z-alumni/referral` - alumni referrals
- `/z-alumni/rooms` - alumni rooms
- `/z-alumni/search` - alumni search across people, posts, rooms, and opportunities
- `/z-alumni/portfolio` - alumni portfolio

## Admin Auth

- `/z-manage-auth/login` - admin login
- `/z-manage-auth/signup` - admin signup request and creation

## Admin Console

- `/z-manage/dashboard` - platform overview and maintenance controls
- `/z-manage/users` - user management
- `/z-manage/content` - report review and moderation
- `/z-manage/db` - database and platform health view
- `/z-manage/verification` - verification queue

## API Routes

- `/api/auth/register` - register student accounts
- `/api/auth/recover` - recovery flow by phone and security question
- `/api/auth/token` - mint auth token
- `/api/admin/signup` - admin registration flow
- `/api/admin/reports` - admin report access and updates
- `/api/maintenance` - read and update maintenance mode
- `/api/opportunities` - create and list opportunities
- `/api/opportunity-applications` - create and list opportunity applications
- `/api/referrals` - referral CRUD
- `/api/report-reviews` - report review CRUD
- `/api/resumes` - resume CRUD
- `/api/zyncs` - follow/zync relationships
- `/api/zyngs` - post CRUD
