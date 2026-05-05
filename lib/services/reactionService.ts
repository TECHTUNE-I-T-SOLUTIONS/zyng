import saveReaction from '@/app/actions/reactions';

export async function react(payload: { post_id?: string; reply_id?: string; type: string }, userId?: string) {
  // try server action first
  try {
    const data = await saveReaction(payload as any);
    return data;
  } catch (err: any) {
    // If unauthenticated, attempt to mint cookie then retry
    const msg = err?.message || String(err);
    if ((msg && msg.includes('Not authenticated')) && userId) {
      try {
        await fetch('/api/auth/token', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      } catch (e) { /* ignore */ }
      try {
        const data = await saveReaction(payload as any);
        return data;
      } catch (e2: any) {
        enqueueFailed(payload, userId);
        throw e2;
      }
    }

    // other failures: enqueue and throw
    enqueueFailed(payload, userId);
    throw err;
  }
}

export default { react };

// --- simple local retry queue (stores entries in localStorage)
type QueueItem = { payload: { post_id?: string; reply_id?: string; type: string }; userId?: string; attempts?: number };

const QUEUE_KEY = 'zyng_reaction_queue';
let processing = false;

function readQueue(): QueueItem[] {
  try { const raw = localStorage.getItem(QUEUE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function writeQueue(q: QueueItem[]) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) { console.warn('writeQueue failed', e); } }

export function enqueueFailed(payload: QueueItem['payload'], userId?: string) {
  const q = readQueue();
  q.push({ payload, userId, attempts: 0 });
  writeQueue(q);
  processQueue();
}

export async function processQueue() {
  if (processing) return;
  processing = true;
  try {
    let q = readQueue();
    if (!q.length) return;
    const remaining: QueueItem[] = [];
    for (const item of q) {
      try {
        const res = await react(item.payload, item.userId);
        // success - continue
      } catch (err) {
        item.attempts = (item.attempts || 0) + 1;
        if (item.attempts < 5) remaining.push(item);
      }
    }
    writeQueue(remaining);
  } catch (e) {
    console.error('processQueue error', e);
  } finally { processing = false; }
}

// attempt queue processing regularly
if (typeof window !== 'undefined') {
  setInterval(() => { processQueue(); }, 30_000);
  // process at load
  setTimeout(() => processQueue(), 2000);
}
