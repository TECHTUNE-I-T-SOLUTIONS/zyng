'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Mic, Phone, PhoneOff, Send, Square, Volume2, VolumeX, X } from 'lucide-react';

type ZAssistantProps = {
  user?: any;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Position = {
  x: number;
  y: number;
};

type MobilePosition = {
  side: 'left' | 'right';
  y: number;
};

type NavigationTarget = {
  label: string;
  path: string;
};

type PostType = 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection';

type PostDraft = {
  type: PostType;
  content: string;
  hashtag: string;
  pollOptions: string[];
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const Z_CREATE_DRAFT_EVENT = 'z:create-draft';
const Z_SUBMIT_DRAFT_EVENT = 'z:submit-draft';

const getDefaultPosition = (): Position => {
  if (typeof window === 'undefined') return { x: 16, y: 220 };
  return {
    x: Math.max(12, window.innerWidth - 78),
    y: Math.max(88, window.innerHeight - 132),
  };
};

const getDefaultMobilePosition = (): MobilePosition => ({
  side: 'right',
  y: typeof window === 'undefined' ? 0 : Math.max(96, window.innerHeight - 142),
});

const getStoredMobilePosition = (userId?: string): MobilePosition => {
  if (typeof window === 'undefined' || !userId) return getDefaultMobilePosition();
  try {
    const stored = window.localStorage.getItem(`z-assistant-mobile-position:${userId}`);
    const parsed = stored ? JSON.parse(stored) : null;
    return {
      side: parsed?.side === 'left' ? 'left' : 'right',
      y: typeof parsed?.y === 'number'
        ? Math.max(88, Math.min(parsed.y, window.innerHeight - 96))
        : getDefaultMobilePosition().y,
    };
  } catch {
    return getDefaultMobilePosition();
  }
};

const buildProactiveLine = (context: any) => {
  const notification = context?.notifications?.[0];
  if (notification?.title) return `${notification.title}: ${notification.message || 'you have something new to check.'}`;
  const event = context?.events?.[0];
  if (event?.title) return `There is an upcoming event you may want to see: ${event.title}.`;
  const post = context?.latestPosts?.[0];
  if (post?.content) return `A fresh campus post is getting attention: ${String(post.content).slice(0, 90)}...`;
  return 'I am online. Ask me what is new, what to check, or how to improve your Zyng profile.';
};

const ROUTES: Array<NavigationTarget & { keywords: string[] }> = [
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

const isAffirmative = (text: string) => /^(yes|yeah|yep|sure|ok|okay|please|take me|go|open it|do it|let's go|lets go)\b/i.test(text.trim());

const isDirectNavigationRequest = (text: string) => /\b(take me|go to|open|navigate|show me|bring me)\b/i.test(text);

const isVerifyActionRequest = (text: string) => /\b(verify|verification|verified|account check|verification check)\b/i.test(text)
  && /\b(select|click|press|choose|start|open|continue|help me|take me|go)\b/i.test(text);

const clickVisibleVerifyAction = () => {
  if (typeof window === 'undefined') return false;
  const candidates = Array.from(document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('a, button'));
  const target = candidates.find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const visible = rect.width > 0
      && rect.height > 0
      && rect.bottom > 0
      && rect.top < window.innerHeight
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) !== 0;
    if (!visible) return false;
    const text = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''}`.toLowerCase();
    const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') || '' : '';
    return href.includes('/z-verify') || /\bverify( account| now)?\b/.test(text) || text.includes('verification');
  });
  target?.click();
  return Boolean(target);
};

const postTypeFromText = (text: string): PostType => {
  const normalized = text.toLowerCase();
  if (/\bpoll|vote|options?\b/.test(normalized)) return 'poll';
  if (/\bconfess|confession|anonymous|secret\b/.test(normalized)) return 'confession';
  if (/\bhot\s*take|spicy|controversial|unpopular opinion|authentic type\b/.test(normalized)) return 'hot_take';
  if (/\bmissed|connection|saw someone|looking for someone\b/.test(normalized)) return 'missed_connection';
  return 'regular';
};

const isCreatePostRequest = (text: string) => /\b(create|write|draft|make|post)\b.*\b(post|zyng|confession|poll|hot take|missed)\b/i.test(text)
  || /\b(i wanna|i want to|help me)\b.*\b(create|write|draft|make|put it|fill)\b/i.test(text)
  || /\bput it\b.*\b(field|create|post)\b/i.test(text);

const isSubmitPostRequest = (text: string) => /\b(post|publish|submit|send)\b.*\b(it|this|draft|post|zyng)\b/i.test(text)
  || /\b(go ahead|yes|okay|ok)\b.*\b(post|publish|submit)\b/i.test(text);

const buildCreatePath = (text: string, draftId?: string) => {
  const params = new URLSearchParams();
  params.set('zDraft', draftId || '1');
  params.set('type', postTypeFromText(text));
  params.set('prompt', text);
  return `/z-create?${params.toString()}`;
};

const dispatchCreateDraft = (draft: PostDraft) => {
  window.dispatchEvent(new CustomEvent(Z_CREATE_DRAFT_EVENT, { detail: draft }));
};

const dispatchSubmitDraft = () => {
  window.dispatchEvent(new CustomEvent(Z_SUBMIT_DRAFT_EVENT));
};

const renderMarkdown = (content: string) => {
  const lines = content.split('\n').filter((line) => line.trim());
  return lines.map((line, index) => {
    const orderedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const text = orderedMatch?.[2] || bulletMatch?.[1] || line;
    const formatted = line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => (
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
        : <span key={partIndex}>{part}</span>
    ));

    if (orderedMatch || bulletMatch) {
      const formattedItem = text.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => (
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
          : <span key={partIndex}>{part}</span>
      ));
      return (
        <div key={`${line}-${index}`} className="mb-2 grid grid-cols-[auto_1fr] gap-2 last:mb-0">
          <span className="font-black text-accent">{orderedMatch ? `${orderedMatch[1]}.` : '-'}</span>
          <span>{formattedItem}</span>
        </div>
      );
    }

    return (
      <p key={`${line}-${index}`} className="mb-2 last:mb-0">
        {formatted}
      </p>
    );
  });
};

export function ZAssistant({ user }: ZAssistantProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<NavigationTarget | null>(null);
  const [voiceSupported] = useState(() => (
    typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  ));
  const [position, setPosition] = useState<Position>(() => getDefaultPosition());
  const [mobilePosition, setMobilePosition] = useState<MobilePosition>(() => getStoredMobilePosition(user?.id));
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const mobileDragStartRef = useRef<MobilePosition>({ side: 'right', y: 0 });
  const dragMovedRef = useRef(false);
  const positionRef = useRef<Position>(getDefaultPosition());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const liveVoiceRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const awaitingLiveReplyRef = useRef(false);
  const draftCounterRef = useRef(0);
  const latestDraftRef = useRef<PostDraft | null>(null);

  const isInteractiveTarget = (target: EventTarget | null) => (
    target instanceof HTMLElement
    && Boolean(target.closest('button, input, textarea, select, a, [data-no-drag="true"]'))
  );

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const loadContext = async () => {
      try {
        const response = await fetch('/api/assistant/z/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error(`Expected JSON, got ${response.status}`);
        const json = await response.json();
        if (!mounted || !response.ok) return;
        setContext(json);
        setShowNudge(true);
      } catch (error) {
        console.error('Failed to load Z context', error);
      }
    };

    void loadContext();
    const interval = window.setInterval(loadContext, 90000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!showNudge || open) return;
    const timeout = window.setTimeout(() => setShowNudge(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [open, showNudge]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = window.localStorage.getItem(`z-assistant-position:${user.id}`);
      if (!stored || window.innerWidth < 1024) {
        const next = getDefaultPosition();
        positionRef.current = next;
        window.requestAnimationFrame(() => setPosition(next));
        return;
      }
      const parsed = JSON.parse(stored);
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        const next = {
          x: Math.max(8, Math.min(parsed.x, window.innerWidth - 72)),
          y: Math.max(80, Math.min(parsed.y, window.innerHeight - 96)),
        };
        positionRef.current = next;
        window.requestAnimationFrame(() => setPosition(next));
      }
    } catch {
      // Ignore invalid local placement data.
    }
  }, [user?.id]);

  useEffect(() => {
    const clampToViewport = () => {
      const compact = window.innerWidth < 768;
      setIsCompactViewport(compact);
      if (compact) {
        setMobilePosition((current) => {
          const next = { ...current, y: Math.max(88, Math.min(current.y || getDefaultMobilePosition().y, window.innerHeight - 96)) };
          mobileDragStartRef.current = next;
          return next;
        });
        return;
      }
      const next = {
        x: Math.max(12, Math.min(positionRef.current.x, window.innerWidth - 72)),
        y: Math.max(88, Math.min(positionRef.current.y, window.innerHeight - 112)),
      };
      positionRef.current = next;
      setPosition(next);
    };
    window.addEventListener('resize', clampToViewport);
    window.addEventListener('orientationchange', clampToViewport);
    clampToViewport();
    return () => {
      window.removeEventListener('resize', clampToViewport);
      window.removeEventListener('orientationchange', clampToViewport);
    };
  }, []);

  const proactiveLine = useMemo(() => buildProactiveLine(context), [context]);

  const persistPosition = (next: Position) => {
    if (!user?.id) return;
    window.localStorage.setItem(`z-assistant-position:${user.id}`, JSON.stringify(next));
  };

  const beginDrag = (event: ReactPointerEvent<HTMLElement>, options?: { allowInteractive?: boolean }) => {
    if (!options?.allowInteractive && isInteractiveTarget(event.target)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragMovedRef.current = false;
    if (isCompactViewport) {
      mobileDragStartRef.current = mobilePosition;
      dragOffsetRef.current = { x: event.clientX, y: event.clientY - mobilePosition.y };
      return;
    }
    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    if (isCompactViewport) {
      const next: MobilePosition = {
        side: mobileDragStartRef.current.side,
        y: Math.max(88, Math.min(event.clientY - dragOffsetRef.current.y, window.innerHeight - 96)),
      };
      if (Math.abs(next.y - mobilePosition.y) > 2) dragMovedRef.current = true;
      setMobilePosition(next);
      mobileDragStartRef.current = next;
      return;
    }
    const next = {
      x: Math.max(8, Math.min(event.clientX - dragOffsetRef.current.x, window.innerWidth - 72)),
      y: Math.max(88, Math.min(event.clientY - dragOffsetRef.current.y, window.innerHeight - 112)),
    };
    if (Math.abs(next.x - position.x) > 2 || Math.abs(next.y - position.y) > 2) {
      dragMovedRef.current = true;
    }
    positionRef.current = next;
    setPosition(next);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (isCompactViewport) {
      if (user?.id) window.localStorage.setItem(`z-assistant-mobile-position:${user.id}`, JSON.stringify(mobileDragStartRef.current));
      return;
    }
    persistPosition(positionRef.current);
  };

  const navigateTo = (target: NavigationTarget) => {
    setPendingNavigation(null);
    setOpen(false);
    setShowNudge(false);
    setVoiceStatus(`Taking you to ${target.label}...`);
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    router.push(target.path);
    window.setTimeout(() => setVoiceStatus(''), 1200);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    audioRef.current = null;
    setVoiceStatus((status) => (status.includes('speaking') || status.includes('Preparing') ? '' : status));
  };

  const draftPost = async (text: string): Promise<PostDraft | null> => {
    try {
      const response = await fetch('/api/assistant/z/draft-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, requestedType: postTypeFromText(text), context }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error(`Expected JSON, got ${response.status}`);
      const json = await response.json();
      if (!response.ok || !json.draft) throw new Error(json.error || 'Draft failed');
      return json.draft;
    } catch (error) {
      console.error('Z draft failed', error);
      return null;
    }
  };

  const send = async (message = input, options?: { speakReply?: boolean; inputType?: 'text' | 'speech'; keepClosed?: boolean; fastVoice?: boolean }) => {
    const clean = message.trim();
    if (!clean || loading) return;
    if (pendingNavigation && isAffirmative(clean)) {
      const nextMessages: Message[] = [
        ...messages,
        { role: 'user', content: clean },
        { role: 'assistant', content: `Taking you to **${pendingNavigation.label}** now.` },
      ];
      setMessages(nextMessages);
      setInput('');
      navigateTo(pendingNavigation);
      return;
    }
    if (isVerifyActionRequest(clean)) {
      const clicked = clickVisibleVerifyAction();
      const nextMessages: Message[] = [
        ...messages,
        { role: 'user', content: clean },
        { role: 'assistant', content: clicked ? 'Selecting **Verify** for you now.' : 'Opening **Verification** for you now.' },
      ];
      setMessages(nextMessages);
      setInput('');
      if (!clicked) navigateTo({ label: 'Verification', path: '/z-verify' });
      return;
    }
    if (isSubmitPostRequest(clean)) {
      setMessages([
        ...messages,
        { role: 'user', content: clean },
        { role: 'assistant', content: 'Posting it now.' },
      ]);
      setInput('');
      if (window.location.pathname !== '/z-create') {
        navigateTo({ label: 'Create', path: '/z-create' });
        if (latestDraftRef.current) {
          window.setTimeout(() => dispatchCreateDraft(latestDraftRef.current as PostDraft), 350);
          window.setTimeout(dispatchSubmitDraft, 900);
        }
        return;
      }
      dispatchSubmitDraft();
      return;
    }
    if (isCreatePostRequest(clean)) {
      setLoading(true);
      setMessages([
        ...messages,
        { role: 'user', content: clean },
        { role: 'assistant', content: 'Opening **Create** and filling the draft for you.' },
      ]);
      setInput('');
      const draft = await draftPost(clean);
      draftCounterRef.current += 1;
      const draftId = `z-draft-${user.id}-${draftCounterRef.current}`;
      if (draft) {
        latestDraftRef.current = draft;
        window.sessionStorage.setItem(draftId, JSON.stringify(draft));
      }
      setLoading(false);
      navigateTo({ label: 'Create', path: buildCreatePath(clean, draft ? draftId : undefined) });
      if (draft) {
        window.setTimeout(() => dispatchCreateDraft(draft), 250);
        window.setTimeout(() => dispatchCreateDraft(draft), 900);
      }
      return;
    }
    const directTarget = findRoute(clean);
    if (directTarget && isDirectNavigationRequest(clean)) {
      const nextMessages: Message[] = [
        ...messages,
        { role: 'user', content: clean },
        { role: 'assistant', content: `Taking you to **${directTarget.label}** now.` },
      ];
      setMessages(nextMessages);
      setInput('');
      navigateTo(directTarget);
      return;
    }
    const nextMessages: Message[] = [...messages, { role: 'user', content: clean }];
    setMessages(nextMessages);
    setInput('');
    if (!options?.keepClosed) setOpen(true);
    if (options?.inputType === 'speech' && options.keepClosed) awaitingLiveReplyRef.current = true;
    setLoading(true);
    try {
      const response = await fetch('/api/assistant/z/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, context, history: nextMessages, inputType: options?.inputType || 'text', callActive }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error(`Expected JSON, got ${response.status}`);
      const json = await response.json();
      const reply = response.ok ? json.reply : (json.error || 'Z is unavailable right now.');
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
      if ((options?.speakReply ?? voiceEnabled) && reply) void speak(reply, { fast: options?.fastVoice });
    } catch (error) {
      console.error('Z send failed', error);
      setMessages([...nextMessages, { role: 'assistant', content: 'I could not connect right now. Try again in a moment.' }]);
    } finally {
      awaitingLiveReplyRef.current = false;
      setLoading(false);
    }
  };

  const speak = async (text: string, options?: { fast?: boolean }) => {
    if (typeof window === 'undefined') return;
    const clean = text.replace(/\*\*/g, '').trim();
    if (!clean) return;
    try {
      setVoiceStatus(options?.fast ? 'Preparing live Z voice...' : 'Preparing Z voice...');
      const response = await fetch('/api/assistant/z/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, lowLatency: Boolean(options?.fast) }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error(`Expected JSON, got ${response.status}`);
      const json = await response.json();
      if (!response.ok || !json.audio) throw new Error(json.error || 'TTS failed');
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      const audio = new Audio(json.audio);
      audioRef.current = audio;
      setVoiceStatus('Z is speaking...');
      audio.onended = () => {
        setVoiceStatus('');
        if (liveVoiceRef.current) window.setTimeout(() => startListening(true), 250);
      };
      await audio.play();
    } catch (error) {
      console.warn('Gemini voice failed', error);
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, options?.fast ? 280 : 900));
      utterance.rate = options?.fast ? 1.12 : 1;
      utterance.onend = () => {
        setVoiceStatus('');
        if (liveVoiceRef.current) window.setTimeout(() => startListening(true), 180);
      };
      setVoiceStatus('Z is speaking...');
      window.speechSynthesis?.speak(utterance);
    }
  };

  const startListening = (live = true) => {
    if (!voiceSupported || listening || loading) return;
    stopSpeaking();
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;
    liveVoiceRef.current = live;
    setCallActive(live);
    setVoiceEnabled(true);
    setVoiceStatus(live ? 'Live call is listening...' : 'Recording. Send when ready.');
    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results || [])
        .map((result: any) => result?.[0]?.transcript || '')
        .join(' ')
        .trim();
      if (!transcript) return;
      setInput(transcript);
      const lastResult = event.results?.[event.results.length - 1];
      if (!lastResult?.isFinal) return;
      if (live) {
        setInput('');
        void send(transcript, { speakReply: true, inputType: 'speech', keepClosed: true, fastVoice: true });
        return;
      }
      setVoiceStatus('Recording captured. Review it, then send.');
    };
    recognition.onend = () => {
      setListening(false);
      if (liveVoiceRef.current && !awaitingLiveReplyRef.current) {
        window.setTimeout(() => startListening(true), 180);
        return;
      }
      if (!liveVoiceRef.current && !live) setVoiceStatus((status) => (status === 'Recording. Send when ready.' ? '' : status));
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceStatus(live ? 'Call listening paused. Tap call again to resume.' : 'Recording stopped. Try again.');
    };
    setListening(true);
    recognition.start();
  };

  const stopLiveVoice = () => {
    liveVoiceRef.current = false;
    setCallActive(false);
    recognitionRef.current?.stop();
    stopSpeaking();
    setListening(false);
    setVoiceStatus('');
  };

  const startCall = () => {
    const intro = 'You are connected to Z. Ask me anything about Zyng, your activity, opportunities, or what to do next.';
    liveVoiceRef.current = true;
    setCallActive(true);
    setVoiceEnabled(true);
    setOpen(false);
    setShowNudge(false);
    setMessages((current) => (
      current.some((message) => message.role === 'assistant' && message.content === intro)
        ? current
        : [...current, { role: 'assistant', content: intro }]
    ));
    void speak(intro, { fast: true });
  };

  if (!user?.id) return null;

  return (
    <div
      className="fixed z-50 flex flex-col items-end"
      style={isCompactViewport ? { [mobilePosition.side]: 12, top: mobilePosition.y } : { left: position.x, top: position.y }}
    >
      <AnimatePresence>
        {showNudge && !open && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.96 }}
            onClick={() => {
              setOpen(true);
              setShowNudge(false);
            }}
            className="mb-3 mr-12 max-w-[min(280px,calc(100vw-5rem))] rounded-2xl border border-accent/20 bg-background p-3 text-left text-xs font-semibold leading-5 text-foreground shadow-2xl shadow-black/20 sm:mr-14"
          >
            <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-accent">Z noticed</span>
            {proactiveLine}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.96 }}
            className="mr-12 w-[min(360px,calc(100vw-4.75rem))] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/30 sm:mr-14 sm:w-[min(360px,calc(100vw-5.5rem))]"
          >
            <div
              className="flex cursor-grab touch-none items-center justify-between border-b border-border p-4 active:cursor-grabbing"
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-black">
                  <Image src="/logo.png" alt="Zyng" width={28} height={28} draggable={false} className="pointer-events-none select-none object-contain brightness-0" />
                </div>
                <div>
                  <div className="text-sm font-black">Z</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Your Zyng assistant</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-no-drag="true"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={callActive ? stopLiveVoice : startCall}
                  className={`rounded-xl p-2 transition-colors ${callActive ? 'bg-accent text-black' : 'text-foreground/50 hover:bg-muted hover:text-foreground'}`}
                  aria-label={callActive ? 'End Z call' : 'Start Z call'}
                  title={callActive ? 'End live call' : 'Start live call'}
                >
                  {callActive ? <PhoneOff size={16} /> : <Phone size={16} />}
                </button>
                <button
                  type="button"
                  data-no-drag="true"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    const next = !voiceEnabled;
                    setVoiceEnabled(next);
                    if (!next) stopLiveVoice();
                  }}
                  className="rounded-xl p-2 text-foreground/50 hover:bg-muted hover:text-foreground"
                  aria-label={voiceEnabled ? 'Turn Z voice off' : 'Turn Z voice on'}
                  title={voiceEnabled ? 'Voice replies on' : 'Hear Z replies'}
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  type="button"
                  data-no-drag="true"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-foreground/50 hover:bg-muted hover:text-foreground"
                  aria-label="Close Z"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto p-4">
              {!messages.length && (
                <button type="button" onClick={() => void send('What should I check on Zyng right now?')} className="w-full rounded-2xl border border-border bg-muted p-3 text-left text-sm text-foreground/70">
                  {proactiveLine}
                </button>
              )}
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[82%] rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-black' : 'mr-auto max-w-[88%] rounded-2xl bg-muted px-3 py-2 text-sm leading-6 text-foreground/80'}>
                  {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                </div>
              ))}
              {loading && <div className="inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-foreground/50"><Loader2 size={14} className="animate-spin" /> Z is thinking</div>}
              {voiceStatus && <div className="inline-flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">{listening && <Mic size={14} className="animate-pulse" />}{voiceStatus}</div>}
            </div>

            {(listening || callActive) && (
              <div className="border-t border-border bg-accent/5 px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-widest text-accent">
                  <span>{callActive ? 'Live call' : 'Recording'}</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> On</span>
                </div>
                <div className="min-h-10 rounded-2xl border border-accent/20 bg-background px-3 py-2 text-sm text-foreground/70">
                  {input || 'Listening...'}
                </div>
                {!callActive && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={stopLiveVoice} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-muted py-2 text-xs font-black uppercase tracking-widest">
                      <Square size={14} /> Stop
                    </button>
                    <button type="button" onClick={() => void send()} disabled={!input.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-2 text-xs font-black uppercase tracking-widest text-black disabled:opacity-40">
                      <Send size={14} /> Send
                    </button>
                  </div>
                )}
              </div>
            )}

            <form
              className="flex items-center gap-2 border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (listening || liveVoiceRef.current) {
                    stopLiveVoice();
                    return;
                  }
                  startListening(false);
                }}
                disabled={!voiceSupported || loading}
                className="rounded-2xl border border-border bg-muted p-3 text-foreground/50 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                title={voiceSupported ? (listening ? 'Recording...' : 'Record a message for Z') : 'Voice input is not supported in this browser'}
                aria-label={voiceSupported ? 'Record a message for Z' : 'Voice input is not supported in this browser'}
              >
                {listening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Z..."
                className="min-w-0 flex-1 rounded-2xl border border-border bg-muted px-3 py-3 text-sm outline-none focus:border-accent"
              />
              <button type="submit" disabled={loading || !input.trim()} className="rounded-2xl bg-accent p-3 text-black disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send to Z">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onPointerDown={(event) => beginDrag(event, { allowInteractive: true })}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          setOpen((value) => !value);
          setShowNudge(false);
        }}
        className={`flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-full bg-accent text-xl font-black text-black shadow-2xl shadow-accent/20 transition-transform hover:scale-105 active:cursor-grabbing sm:h-11 sm:w-11 ${callActive ? 'animate-pulse ring-4 ring-accent/30' : ''}`}
        aria-label={callActive ? 'Z call is live. Open or drag Z assistant.' : 'Open or drag Z assistant'}
        title={callActive ? 'Z call is live. Click to open, drag to reposition.' : 'Click to open. Drag to reposition.'}
      >
        <Image src="/logo.png" alt="Z" width={26} height={26} draggable={false} className="pointer-events-none select-none object-contain brightness-0 sm:h-7 sm:w-7" />
      </button>
    </div>
  );
}
