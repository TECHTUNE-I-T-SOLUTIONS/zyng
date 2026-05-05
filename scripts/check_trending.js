const dotenv = require('dotenv');
// Try loading Next.js env files in order of precedence
const tried = [];
function loadEnv() {
  const candidates = ['.env.local', '.env.development.local', '.env.development', '.env'];
  for (const c of candidates) {
    const res = dotenv.config({ path: c });
    tried.push({ path: c, parsed: !!res.parsed });
    if (res.parsed) {
      console.log('Loaded env from', c);
      return;
    }
  }
}
loadEnv();
const fetch = global.fetch || require('node-fetch');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing SUPABASE_URL or ANON_KEY environment variables. Checked files:', tried);
  console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are set in .env.local');
  process.exit(1);
}

async function run() {
  console.log('Using SUPABASE_URL:', SUPABASE_URL);

  try {
    console.log('\n1) GET /rest/v1/trending_hashtags');
    const viewRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/trending_hashtags?select=*&limit=10`, {
      method: 'GET',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    console.log('Status:', viewRes.status);
    const viewText = await viewRes.text();
    try { console.log('Body:', JSON.stringify(JSON.parse(viewText), null, 2)); } catch { console.log('Body (raw):', viewText); }

    console.log('\n2) POST /rest/v1/rpc/get_trending_hashtags');
    const rpcRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/get_trending_hashtags`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_limit: 10 }),
    });
    console.log('Status:', rpcRes.status);
    const rpcText = await rpcRes.text();
    try { console.log('Body:', JSON.stringify(JSON.parse(rpcText), null, 2)); } catch { console.log('Body (raw):', rpcText); }

  } catch (err) {
    console.error('Request error', err);
  }
}

run();
