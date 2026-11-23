import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Indian market hours: Mon-Fri, 9:15 - 15:30 IST
function isMarketOpen(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60000);
  const day = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 555 && mins <= 930;
}

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const p = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return typeof p === 'number' && p > 0 ? Math.round(p * 100) / 100 : null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  let force = false;
  try { force = !!(await req.json())?.force; } catch { /* no body */ }
  if (!force && !isMarketOpen()) return json({ skipped: 'market closed' });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const results: Record<string, number | null> = {};
  for (const table of ['swing_recommendations', 'intraday_recommendations']) {
    const { data, error } = await admin.from(table).select('id, stock_name, yahoo_symbol').is('exit_reason', null).is('exit_price', null);
    if (error) return json({ error: error.message }, 500);
    for (const row of data ?? []) {
      const sym = (row.yahoo_symbol || `${String(row.stock_name).trim().toUpperCase()}.NS`).trim();
      const price = results[sym] !== undefined ? results[sym] : await fetchPrice(sym);
      results[sym] = price;
      if (price) await admin.from(table).update({ current_price: price }).eq('id', row.id);
    }
  }
  return json({ updated: results });
});
