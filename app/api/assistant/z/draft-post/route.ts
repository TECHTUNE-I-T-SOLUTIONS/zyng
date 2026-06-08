import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PostType = 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection';

const POST_TYPES: PostType[] = ['regular', 'confession', 'poll', 'hot_take', 'missed_connection'];

const inferPostType = (prompt: string): PostType => {
  const normalized = prompt.toLowerCase();
  if (/\bpoll|vote|options?\b/.test(normalized)) return 'poll';
  if (/\bconfess|confession|anonymous|secret\b/.test(normalized)) return 'confession';
  if (/\bhot\s*take|controversial|spicy|unpopular opinion|authentic type\b/.test(normalized)) return 'hot_take';
  if (/\bmissed|connection|saw someone|looking for someone\b/.test(normalized)) return 'missed_connection';
  return 'regular';
};

const normalizeType = (type: unknown, prompt: string): PostType => {
  if (typeof type === 'string' && POST_TYPES.includes(type as PostType)) return type as PostType;
  return inferPostType(prompt);
};

const hashtagsFrom = (text: string, type: PostType) => {
  const base: Record<PostType, string[]> = {
    regular: ['#zyng', '#campus'],
    confession: ['#confession', '#campus'],
    poll: ['#poll', '#campus'],
    hot_take: ['#hottake', '#campus'],
    missed_connection: ['#missed', '#campus'],
  };
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !['create', 'write', 'draft', 'post', 'zyng', 'want', 'wanna', 'please', 'help'].includes(word));
  return Array.from(new Set([...base[type], ...words.slice(0, 3).map((word) => `#${word}`)])).slice(0, 5).join(' ');
};

const fallbackDraft = (prompt: string, requestedType?: string) => {
  const type = normalizeType(requestedType, prompt);
  const topic = prompt
    .replace(/\b(i wanna|i want to|help me|can you|please|take me to|create page)\b/gi, '')
    .replace(/\b(create|write|draft|make|post|zyng|hot take|confession|poll|missed connection)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const contentByType: Record<PostType, string> = {
    regular: topic || 'What is something happening on campus that more people should be talking about?',
    confession: topic ? `Confession: ${topic}` : 'Confession: I have something I need to get off my chest.',
    poll: topic || 'Which recent tech development matters most for students right now?',
    hot_take: topic
      ? `Hot take: ${topic}. We should be talking less about hype and more about what actually helps students build, learn, and create.`
      : 'Hot take: the best technology is not the flashiest one. It is the one that makes students more capable.',
    missed_connection: topic || 'I crossed paths with someone and would love to find them again.',
  };

  return {
    type,
    content: contentByType[type].slice(0, 500),
    hashtag: hashtagsFrom(`${prompt} ${contentByType[type]}`, type),
    pollOptions: type === 'poll' ? ['AI tools', 'Robotics', 'Clean tech', 'Biotech'] : ['', ''],
  };
};

const parseJsonObject = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('No JSON object in draft response');
  return JSON.parse(candidate.slice(start, end + 1));
};

export async function POST(request: Request) {
  try {
    const { prompt, requestedType, context } = await request.json();
    const cleanPrompt = String(prompt || '').trim();
    if (!cleanPrompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ draft: fallbackDraft(cleanPrompt, requestedType) });

    const ai = new GoogleGenAI({ apiKey });
    const type = normalizeType(requestedType, cleanPrompt);
    const instruction = `
Create a Zyng post draft from the user request.
Return only JSON with this exact shape:
{
  "type": "regular" | "confession" | "poll" | "hot_take" | "missed_connection",
  "content": "post text, max 500 chars",
  "hashtag": "#one #two #three",
  "pollOptions": ["option 1", "option 2"]
}

Rules:
- If the user asks for hot take, authentic type, spicy opinion, or strong opinion, use "hot_take".
- Make the content sound ready to post, not like instructions.
- Generate concise relevant hashtags without spaces inside a hashtag.
- For polls, content is the question and pollOptions must have 2-4 useful options.
- For non-polls, pollOptions must be [].
- Do not include private user data.

Requested type: ${type}
User request: ${cleanPrompt}
Helpful context: ${JSON.stringify({
      activePersona: context?.user?.activePersona?.name || null,
      appSurfaces: context?.appSurfaces || [],
      latestPosts: Array.isArray(context?.latestPosts) ? context.latestPosts.slice(0, 3) : [],
    })}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: instruction,
      config: { temperature: 0.65, maxOutputTokens: 450 },
    });
    const parsed = parseJsonObject(response.text || '{}');
    const draftType = normalizeType(parsed.type, cleanPrompt);
    const content = String(parsed.content || fallbackDraft(cleanPrompt, draftType).content).slice(0, 500);
    const pollOptions = draftType === 'poll'
      ? (Array.isArray(parsed.pollOptions) ? parsed.pollOptions.map(String).filter(Boolean).slice(0, 4) : fallbackDraft(cleanPrompt, draftType).pollOptions)
      : [];

    return NextResponse.json({
      draft: {
        type: draftType,
        content,
        hashtag: String(parsed.hashtag || hashtagsFrom(`${cleanPrompt} ${content}`, draftType)).slice(0, 120),
        pollOptions,
      },
    });
  } catch (error) {
    console.error('Z draft post failed', error);
    return NextResponse.json({ error: 'Failed to draft post' }, { status: 500 });
  }
}
