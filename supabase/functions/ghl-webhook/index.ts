/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';
const GHL_API_VERSION = '2021-07-28';
const MAX_BODY_BYTES = 4_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const GHL_TIMEOUT_MS = 15_000;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const json = (body: unknown, status: number, headers: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

const corsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = allowedOrigins.length === 0
    ? origin || '*'
    : allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

const getJwtSubject = (authHeader: string) => {
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token.split('.')[1];
  if (!payload) return token.slice(0, 32);

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    return typeof decoded.sub === 'string' ? decoded.sub : token.slice(0, 32);
  } catch {
    return token.slice(0, 32);
  }
};

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  current.count += 1;
  return true;
};

const cleanText = (value: unknown, maxChars: number) => {
  if (typeof value !== 'string') return '';
  return [...value]
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('')
    .trim()
    .slice(0, maxChars);
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, cors);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  if (!checkRateLimit(getJwtSubject(authHeader))) {
    return json({ error: 'Too many requests' }, 429, cors);
  }

  const apiKey = Deno.env.get('GHL_API_KEY');
  const locationId = Deno.env.get('GHL_LOCATION_ID');
  if (!apiKey || !locationId) {
    console.error('GHL function is missing required environment configuration.');
    return json({ error: 'Service unavailable' }, 503, cors);
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return json({ error: 'Invalid request body' }, 400, cors);
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413, cors);
  }

  let body: { email?: unknown; first_name?: unknown; last_name?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const email = cleanText(body.email, 254).toLowerCase();
  const firstName = cleanText(body.first_name, 80);
  const lastName = cleanText(body.last_name, 80);
  if (!isValidEmail(email)) {
    return json({ error: 'Valid email is required' }, 400, cors);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GHL_TIMEOUT_MS);

  try {
    const ghlRes = await fetch(GHL_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        tags: ['App_User'],
        locationId,
      }),
    });

    if (!ghlRes.ok) {
      const errorText = await ghlRes.text();
      console.error('GHL API error:', ghlRes.status, errorText.slice(0, 500));
      return json({ error: 'Upstream service unavailable' }, 502, cors);
    }

    return json({ success: true }, 201, cors);
  } catch (err) {
    console.error('GHL request failed:', err instanceof Error ? err.message : String(err));
    return json({ error: 'Upstream service unavailable' }, 502, cors);
  } finally {
    clearTimeout(timeout);
  }
});
