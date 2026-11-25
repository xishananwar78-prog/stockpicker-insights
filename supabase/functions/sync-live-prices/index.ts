import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { authenticateCronRequest } from '../_shared/cron-auth.ts';
import { isIntradaySquareOffTime, resolveAutomaticIntradayExit } from './intraday-trade-rules.ts';

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
  const authFailure = authenticateCronRequest(req);
  if (authFailure) {
    return new Response(await authFailure.text(), {
      status: authFailure.status,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }

  let force = false;
  try { force = (await req.json())?.force === true; } catch { /* no body */ }
  if (!force && !isMarketOpen()) return json({ skipped: 'market closed' });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const prices: Record<string, number | null> = {};
  const exits: Array<{ id: string; reason: string }> = [];

  const { data: swingRows, error: swingError } = await admin
    .from('swing_recommendations')
    .select('id, stock_name, yahoo_symbol')
    .is('exit_reason', null)
    .is('exit_price', null);
  if (swingError) return json({ error: swingError.message }, 500);

  for (const row of swingRows ?? []) {
    const symbol = (row.yahoo_symbol || `${String(row.stock_name).trim().toUpperCase()}.NS`).trim();
    const price = prices[symbol] !== undefined ? prices[symbol] : await fetchPrice(symbol);
    prices[symbol] = price;
    if (price !== null) {
      const { error } = await admin.from('swing_recommendations').update({ current_price: price }).eq('id', row.id);
      if (error) console.error(`Could not update Swing price for ${row.id}:`, error.message);
    }
  }

  const { data: intradayRows, error: intradayError } = await admin
    .from('intraday_recommendations')
    .select('id, stock_name, yahoo_symbol, current_price, trade_side, recommended_price, target1, target2, target3, stoploss, entry_triggered')
    .is('exit_reason', null)
    .is('exit_price', null);
  if (intradayError) return json({ error: intradayError.message }, 500);

  for (const row of intradayRows ?? []) {
    const symbol = (row.yahoo_symbol || `${String(row.stock_name).trim().toUpperCase()}.NS`).trim();
    const fetchedPrice = prices[symbol] !== undefined ? prices[symbol] : await fetchPrice(symbol);
    prices[symbol] = fetchedPrice;
    const now = new Date();
    const squareOffTime = isIntradaySquareOffTime(now);
    const cachedPrice = Number(row.current_price);
    const price = fetchedPrice ?? (squareOffTime && cachedPrice > 0 ? cachedPrice : null);
    if (price === null) continue;

    const automaticExit = resolveAutomaticIntradayExit({
      tradeSide: row.trade_side,
      recommendedPrice: Number(row.recommended_price),
      target1: Number(row.target1),
      target2: Number(row.target2),
      target3: Number(row.target3),
      stoploss: Number(row.stoploss),
      entryTriggered: row.entry_triggered,
    }, price, now);

    const update: Record<string, unknown> = { current_price: price };
    if (automaticExit) {
      update.exit_reason = automaticExit.reason;
      update.exit_price = automaticExit.exitPrice;
      update.exited_at = now.toISOString();
      exits.push({ id: row.id, reason: automaticExit.reason });
    }

    const { error } = await admin
      .from('intraday_recommendations')
      .update(update)
      .eq('id', row.id)
      .is('exit_reason', null);
    if (error) {
      console.error(`Could not update Intraday trade ${row.id}:`, error.message);
      if (automaticExit) exits.pop();
    }
  }

  return json({ updated: prices, exits });
});
