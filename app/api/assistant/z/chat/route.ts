import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-pro'];
const LIVE_MODELS = ['gemini-2.5-flash-lite'];

const ROUTES = [
  { label: 'Home', path: '/', keywords: ['home', 'landing'] },
  { label: 'About', path: '/about', keywords: ['about', 'mission'] },
  { label: 'Features', path: '/features', keywords: ['features', 'what can zyng do'] },
  { label: 'FAQ', path: '/faq', keywords: ['faq', 'questions'] },
  { label: 'Contact', path: '/contact', keywords: ['contact', 'support'] },
  { label: 'Signup', path: '/in/signup', keywords: ['signup', 'sign up', 'register', 'create account'] },
  { label: 'Login', path: '/in/login', keywords: ['login', 'log in', 'signin', 'sign in'] },
  { label: 'Feed', path: '/z-feed', keywords: ['feed', 'campus feed', 'posts', 'zyngs'] },
  { label: 'Create', path: '/z-create', keywords: ['create', 'create post', 'new post', 'post', 'zyng', 'confession', 'poll', 'hot take', 'missed'] },
  { label: 'Search', path: '/z-search', keywords: ['search', 'find'] },
  { label: 'Pro Hub', path: '/z-pro', keywords: ['pro hub', 'pro', 'professional hub'] },
  { label: 'Portfolio Builder', path: '/z-pro/portfolio', keywords: ['portfolio', 'resume', 'cv', 'builder'] },
  { label: 'Applications', path: '/z-pro/applications', keywords: ['applications', 'my applications'] },
  { label: 'Create Job', path: '/z-pro/create-job', keywords: ['create job', 'post job'] },
  { label: 'Rooms', path: '/z-rooms', keywords: ['rooms', 'room', 'communities', 'chat rooms'] },
  { label: 'Events', path: '/z-events', keywords: ['events', 'event'] },
  { label: 'Marketplace', path: '/z-marketplace', keywords: ['marketplace', 'market', 'products', 'product', 'buy', 'sell'] },
  { label: 'Z-Sights', path: '/z-sights', keywords: ['z-sights', 'sights', 'places', 'campus sights'] },
  { label: 'Jobs', path: '/z-jobs', keywords: ['jobs', 'job', 'gigs', 'gig', 'opportunities', 'opportunity'] },
  { label: 'Messages', path: '/z-messages', keywords: ['messages', 'message', 'inbox', 'dm'] },
  { label: 'Notifications', path: '/z-notifications', keywords: ['notifications', 'notification', 'alerts'] },
  { label: 'Profile', path: '/z-profile', keywords: ['profile', 'account'] },
  { label: 'Personas', path: '/z-personas', keywords: ['personas', 'persona'] },
  { label: 'Referrals', path: '/z-referral', keywords: ['referrals', 'referral', 'invite', 'invites'] },
  { label: 'Verification', path: '/z-verify', keywords: ['verify', 'verification', 'verified'] },
  { label: 'Reports', path: '/z-reports', keywords: ['reports', 'moderation reports'] },
  { label: 'Alumni Dashboard', path: '/z-alumni/dashboard', keywords: ['alumni dashboard', 'alumni home'] },
  { label: 'Alumni Feed', path: '/z-alumni/feed', keywords: ['alumni feed'] },
  { label: 'Alumni Create', path: '/z-alumni/create', keywords: ['alumni create', 'alumni post'] },
  { label: 'Alumni Connect', path: '/z-alumni/connect', keywords: ['alumni connect', 'connect alumni'] },
  { label: 'Alumni Messages', path: '/z-alumni/messages', keywords: ['alumni messages'] },
  { label: 'Alumni Jobs', path: '/z-alumni/jobs', keywords: ['alumni jobs'] },
  { label: 'Alumni Events', path: '/z-alumni/events', keywords: ['alumni events'] },
  { label: 'Alumni Marketplace', path: '/z-alumni/marketplace', keywords: ['alumni marketplace'] },
  { label: 'Alumni Portfolio', path: '/z-alumni/portfolio', keywords: ['alumni portfolio'] },
  { label: 'Alumni Profile', path: '/z-alumni/profile', keywords: ['alumni profile'] },
];

const findRoute = (text: string) => {
  const normalized = text.toLowerCase();
  return ROUTES.find((route) => route.keywords.some((keyword) => normalized.includes(keyword)));
};

const compactContextForLive = (context: any) => ({
  user: context?.user ? { activePersona: context.user.activePersona } : undefined,
  notifications: Array.isArray(context?.notifications) ? context.notifications.slice(0, 2) : [],
  latestPosts: Array.isArray(context?.latestPosts) ? context.latestPosts.slice(0, 2) : [],
  events: Array.isArray(context?.events) ? context.events.slice(0, 2) : [],
  jobs: Array.isArray(context?.jobs) ? context.jobs.slice(0, 2) : [],
  rooms: Array.isArray(context?.rooms) ? context.rooms.slice(0, 2) : [],
});

export async function POST(request: Request) {
  try {
    const { message, context, history, callActive } = await request.json();
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Z is not configured yet' }, { status: 503 });

    const ai = new GoogleGenAI({ apiKey });
    const liveMode = Boolean(callActive);
    const prompt = liveMode ? `
You are Z, Zyng's live voice assistant.
Reply like a fast voice call: one short sentence, direct, warm, and useful.
Do not use Markdown in live voice mode.
If a Zyng page would help, ask "Would you like me to take you there?"
Never use the user's real name, full_name, email, phone, or raw username.
Use only the active persona name if you need to address them.

Compact context:
${JSON.stringify(compactContextForLive(context), null, 2)}

Recent turns:
${JSON.stringify(Array.isArray(history) ? history.slice(-4) : [], null, 2)}

User said:
${message}
` : `
You are Z, Zyng's personal AI assistant.
You are professional, warm, concise, and campus-aware.
Use the provided platform context when relevant. Do not claim access to private data beyond this context.
If the user asks for something you cannot verify, say what you can see and suggest a next action.
You understand Zyng from context.appSurfaces and context.websiteKnowledge. Use those to explain how the website works, where features live, and what the user can do next.
Identity rules:
- Never use the user's real name, full_name, account name, email, phone, or raw username.
- Address the user only by their active persona name from context.user.activePersona.name.
- If there is no active persona, say "your active persona" or "you".

Formatting rules:
- Use concise Markdown.
- Prefer short paragraphs and numbered lists for recommendations.
- Bold important object names, jobs, events, and actions.
- Do not produce giant walls of text.
- If a Zyng page would help, ask "Would you like me to take you there?"

Context:
${JSON.stringify(context || {}, null, 2)}

Recent conversation:
${JSON.stringify(Array.isArray(history) ? history.slice(-8) : [], null, 2)}

User message:
${message}
`;
    const suggestedRoute = findRoute(message);

    for (const model of liveMode ? LIVE_MODELS : MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: liveMode ? 0.35 : 0.45,
            maxOutputTokens: liveMode ? 45 : 700,
          },
        });
        return NextResponse.json({
          reply: response.text || 'I am here, but I could not form a clear reply yet.',
          suggestedRoute,
        });
      } catch (error) {
        console.warn(`Z chat failed with ${model}`, error);
      }
    }

    return NextResponse.json({ error: 'Z could not answer right now' }, { status: 503 });
  } catch (error) {
    console.error('Z chat failed', error);
    return NextResponse.json({ error: 'Failed to talk to Z' }, { status: 500 });
  }
}
