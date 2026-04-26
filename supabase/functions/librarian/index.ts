/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Spell {
  title: string;
  ritual: string;
  incantation: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: { message: string; spells: Spell[]; history: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { message, spells = [], history = [] } = body;

  const spellContext = spells.length > 0
    ? spells.map((s) =>
        `### ${s.title}\n**Ritual:** ${s.ritual || '(none)'}\n**Incantation:** ${s.incantation || '(none)'}`
      ).join('\n\n---\n\n')
    : 'The spellbook is currently empty.';

  const systemPrompt = `You are the Wise Librarian of the Questlog Spellbook — a mystical AI guardian who has memorized every scroll in the tome. You speak in a warm, scholarly tone with a slight mystical flair, but you are always concise and practical.

When a traveler asks a question, search through the spells below to find the relevant information. Reference spells by name and quote the key parts. If no spell covers the topic, say so plainly and offer brief general guidance. Never invent spell content that isn't there.

Always address the user as "traveler."

## The Spellbook — ${spells.length} spell(s) on record:

${spellContext}`;

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history.slice(-10),
        { role: 'user', content: message },
      ],
    }),
  });

  const anthropicData = await anthropicRes.json();

  if (!anthropicRes.ok) {
    return new Response(
      JSON.stringify({ error: 'Anthropic API error', details: anthropicData }),
      { status: anthropicRes.status, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const reply = anthropicData.content?.[0]?.text ?? 'The tomes are silent on this matter, traveler.';

  return new Response(JSON.stringify({ reply }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
