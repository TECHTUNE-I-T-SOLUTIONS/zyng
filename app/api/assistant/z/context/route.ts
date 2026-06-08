import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APP_SURFACES = [
  { name: 'Home', path: '/', purpose: 'Public landing page for Zyng.' },
  { name: 'About', path: '/about', purpose: 'Public explanation of Zyng and its mission.' },
  { name: 'Features', path: '/features', purpose: 'Overview of Zyng product features.' },
  { name: 'FAQ', path: '/faq', purpose: 'Frequently asked questions about Zyng.' },
  { name: 'Contact', path: '/contact', purpose: 'Public contact and support entry point.' },
  { name: 'Feedback', path: '/feedback', purpose: 'Collect product feedback.' },
  { name: 'Login', path: '/in/login', purpose: 'Sign in to Zyng.' },
  { name: 'Signup', path: '/in/signup', purpose: 'Create a Zyng account with school, faculty, department, graduation month, and recovery details.' },
  { name: 'Recover Account', path: '/in/recover', purpose: 'Recover a Zyng account.' },
  { name: 'Feed', path: '/z-feed', purpose: 'Campus posts, replies, reactions, and social discovery.' },
  { name: 'Create', path: '/z-create', purpose: 'Create Zyng posts, confessions, polls, hot takes, and missed connections.' },
  { name: 'Search', path: '/z-search', purpose: 'Search across Zyng content and people.' },
  { name: 'Pro Hub', path: '/z-pro', purpose: 'Professional tools, portfolio, applications, jobs, and resume workflows.' },
  { name: 'Create Job', path: '/z-pro/create-job', purpose: 'Create professional opportunities and job posts.' },
  { name: 'Applications', path: '/z-pro/applications', purpose: 'Manage opportunity applications.' },
  { name: 'Rooms', path: '/z-rooms', purpose: 'Focused campus rooms and conversations.' },
  { name: 'Events', path: '/z-events', purpose: 'Campus events and activities.' },
  { name: 'Marketplace', path: '/z-marketplace', purpose: 'Student listings, buying, selling, and sharing items.' },
  { name: 'Z-Sights', path: '/z-sights', purpose: 'Projects, portfolios, shipped work, and creative/professional showcases.' },
  { name: 'Jobs', path: '/z-jobs', purpose: 'Gigs, internships, jobs, and opportunities.' },
  { name: 'Messages', path: '/z-messages', purpose: 'Direct conversations between users/personas.' },
  { name: 'Notifications', path: '/z-notifications', purpose: 'Personal alerts and activity updates.' },
  { name: 'Personas', path: '/z-personas', purpose: 'Create and activate public identities used around Zyng.' },
  { name: 'Profile', path: '/z-profile', purpose: 'Account, school context, skills, hobbies, and persona management.' },
  { name: 'Reports', path: '/z-reports', purpose: 'Track user-submitted reports and moderation outcomes.' },
  { name: 'Alumni Dashboard', path: '/z-alumni/dashboard', purpose: 'Alumni home and professional/social overview.' },
  { name: 'Alumni Feed', path: '/z-alumni/feed', purpose: 'Alumni social and professional posts.' },
  { name: 'Alumni Create', path: '/z-alumni/create', purpose: 'Create alumni posts, trends, polls, pulses, and opportunities.' },
  { name: 'Alumni Connect', path: '/z-alumni/connect', purpose: 'Discover and connect with alumni.' },
  { name: 'Alumni Messages', path: '/z-alumni/messages', purpose: 'Alumni direct messages.' },
  { name: 'Alumni Jobs', path: '/z-alumni/jobs', purpose: 'Alumni jobs and opportunities.' },
  { name: 'Alumni Events', path: '/z-alumni/events', purpose: 'Alumni events.' },
  { name: 'Alumni Marketplace', path: '/z-alumni/marketplace', purpose: 'Alumni marketplace.' },
  { name: 'Alumni Portfolio', path: '/z-alumni/portfolio', purpose: 'Alumni portfolio tools.' },
  { name: 'Alumni Profile', path: '/z-alumni/profile', purpose: 'Alumni profile and account details.' },
];

const loadWebsiteKnowledge = async () => {
  try {
    const docs = await readFile(path.join(process.cwd(), 'public', 'documentations.md'), 'utf8');
    return docs.slice(0, 7000);
  } catch {
    return '';
  }
};

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const [userResult, notificationsResult, postsResult, eventsResult, jobsResult, projectsResult, marketplaceResult, roomsResult, websiteKnowledge] = await Promise.all([
      supabaseAdmin.from('users').select('id, skills, hobbies, trust_score, school_id, faculty_id, department_id, status, personas(id, name, avatar_url, is_active)').eq('id', userId).single(),
      supabaseAdmin.from('notifications').select('id, title, message, type, created_at, is_read').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }).limit(8),
      supabaseAdmin.from('posts').select('id, content, hashtags, created_at').order('created_at', { ascending: false }).limit(8),
      supabaseAdmin.from('zing_events').select('id, title, description, start_time, location, tags').order('start_time', { ascending: true }).limit(8),
      supabaseAdmin.from('opportunities').select('id, title, company, location, type, created_at').order('created_at', { ascending: false }).limit(6),
      supabaseAdmin.from('zync_projects').select('id, title, description, category, tags, created_at').order('created_at', { ascending: false }).limit(6),
      supabaseAdmin.from('zing_marketplace').select('id, title, description, price, category, created_at').eq('is_sold', false).order('created_at', { ascending: false }).limit(6),
      supabaseAdmin.from('zing_rooms').select('id, name, description, created_at').order('created_at', { ascending: false }).limit(6),
      loadWebsiteKnowledge(),
    ]);

    const errors = [userResult.error, notificationsResult.error, postsResult.error, eventsResult.error, jobsResult.error, projectsResult.error, marketplaceResult.error, roomsResult.error].filter(Boolean);
    if (errors.length) console.warn('Z context partial errors', errors);

    return NextResponse.json({
      user: userResult.data ? {
        id: userResult.data.id,
        activePersona: (userResult.data as any).personas?.find((persona: any) => persona.is_active) || null,
        skills: userResult.data.skills || [],
        hobbies: userResult.data.hobbies || [],
        trust_score: userResult.data.trust_score,
        school_id: userResult.data.school_id,
        faculty_id: userResult.data.faculty_id,
        department_id: userResult.data.department_id,
        status: userResult.data.status,
      } : null,
      notifications: notificationsResult.data || [],
      latestPosts: postsResult.data || [],
      events: eventsResult.data || [],
      jobs: jobsResult.data || [],
      projects: projectsResult.data || [],
      marketplace: marketplaceResult.data || [],
      rooms: roomsResult.data || [],
      appSurfaces: APP_SURFACES,
      websiteKnowledge,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Z context failed', error);
    return NextResponse.json({ error: 'Failed to load Z context' }, { status: 500 });
  }
}
