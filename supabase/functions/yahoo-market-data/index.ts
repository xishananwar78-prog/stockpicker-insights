import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const validSymbol = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Z0-9&.^=-]{1,32}\.(NS|BO)$/.test(value);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authorization = req.headers.get('Authorization');
    const token = authorization?.replace(/^Bearer\s+/i, '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    if (!supabaseUrl || !publishableKey) {
      console.error('Market data function is missing its authentication configuration', {
        hasUrl: Boolean(supabaseUrl),
        hasClientKey: Boolean(publishableKey),
      });
      return json({ error: 'Market data service is not configured' }, 500);
    }
    if (!token) return json({ error: 'Unauthorized' }, 401);

    if (token !== publishableKey) {
      const authClient = createClient(supabaseUrl, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      const role = claimsData?.claims?.role;
      if (claimsError || role !== 'authenticated' || typeof claimsData?.claims?.sub !== 'string') {
        console.error('Market data rejected an invalid caller token', {
          message: claimsError?.message,
          role,
          tokenMatchesClientKey: token === publishableKey,
        });
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'A valid JSON request is required' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'Invalid request' }, 400);
    }

    const { action } = body as Record<string, unknown>;

    if (action === 'search') {
      const query = (body as Record<string, unknown>).query;
      if (typeof query !== 'string' || query.trim().length < 2 || query.trim().length > 80) {
        return json({ error: 'Enter at least two characters to search' }, 400);
      }

      const url = new URL('https://query1.finance.yahoo.com/v1/finance/search');
      url.searchParams.set('q', query.trim());
      url.searchParams.set('quotesCount', '12');
      url.searchParams.set('newsCount', '0');

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        const details = (await response.text()).slice(0, 300);
        console.error(`Yahoo search failed [${response.status}]: ${details}`);
        return json({ error: 'Yahoo stock search is temporarily unavailable', status: response.status }, 502);
      }

      const payload = await response.json();
      const quotes = Array.isArray(payload?.quotes) ? payload.quotes : [];
      const results = quotes
        .filter((item: Record<string, unknown>) =>
          item.quoteType === 'EQUITY' && validSymbol(item.symbol))
        .map((item: Record<string, unknown>) => ({
          symbol: item.symbol,
          name: typeof item.shortname === 'string' ? item.shortname : item.symbol,
          exchange: typeof item.exchange === 'string' ? item.exchange : '',
          currency: typeof item.currency === 'string' ? item.currency : 'INR',
        }))
        .slice(0, 8);

      return json({ results });
    }

    if (action === 'quotes') {
      const symbols = (body as Record<string, unknown>).symbols;
      if (!Array.isArray(symbols) || symbols.length < 1 || symbols.length > 20 || !symbols.every(validSymbol)) {
        return json({ error: 'Choose between one and twenty valid Indian stock symbols' }, 400);
      }

      const quotes = await Promise.all(symbols.map(async (symbol) => {
        const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
        url.searchParams.set('range', '1d');
        url.searchParams.set('interval', '1m');
        url.searchParams.set('includePrePost', 'false');
        const response = await fetch(url, { headers: { Accept: 'application/json' } });

        if (!response.ok) {
          const details = (await response.text()).slice(0, 300);
          console.error(`Yahoo quote failed [${response.status}] for ${symbol}: ${details}`);
          return { symbol, error: 'Quote temporarily unavailable' };
        }

        const payload = await response.json();
        const result = payload?.chart?.result?.[0];
        const price = Number(result?.meta?.regularMarketPrice);
        if (!Number.isFinite(price) || price <= 0) return { symbol, error: 'No recent quote available' };

        return {
          symbol,
          price,
          asOf: Number.isFinite(Number(result?.meta?.regularMarketTime))
            ? new Date(Number(result.meta.regularMarketTime) * 1000).toISOString()
            : null,
        };
      }));

      return json({ quotes });
    }

    return json({ error: 'Unsupported market-data request' }, 400);
  } catch (error) {
    console.error('Yahoo market-data request failed', error);
    return json({ error: 'Market data is temporarily unavailable' }, 502);
  }
});