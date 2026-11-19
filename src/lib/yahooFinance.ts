import { supabase } from '@/integrations/supabase/client';

export interface YahooStockResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

interface YahooQuote {
  symbol: string;
  price?: number;
  asOf?: string | null;
  error?: string;
}

export async function searchYahooStocks(query: string): Promise<YahooStockResult[]> {
  const { data, error } = await supabase.functions.invoke('yahoo-market-data', {
    body: { action: 'search', query },
  });
  if (error) throw new Error('Stock search is temporarily unavailable. Please try again.');
  return Array.isArray(data?.results) ? data.results as YahooStockResult[] : [];
}

export async function fetchYahooQuotes(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  for (let index = 0; index < symbols.length; index += 20) {
    const batch = symbols.slice(index, index + 20);
    const { data, error } = await supabase.functions.invoke('yahoo-market-data', {
      body: { action: 'quotes', symbols: batch },
    });
    if (error) throw new Error('Yahoo prices are temporarily unavailable. Please try again.');

    const quotes: YahooQuote[] = Array.isArray(data?.quotes) ? data.quotes : [];
    for (const quote of quotes) {
      if (typeof quote.price === 'number' && Number.isFinite(quote.price) && quote.price > 0) {
        prices[quote.symbol] = quote.price;
      }
    }
  }
  return prices;
}

export interface PriceRefreshItem {
  currentPrice: number;
  yahooSymbol?: string;
  exitReason?: string | null;
}

export function applyYahooPrices<T extends PriceRefreshItem>(
  items: T[],
  prices: Record<string, number>,
): T[] {
  return items.map((item) => {
    if (item.exitReason || !item.yahooSymbol || !prices[item.yahooSymbol]) return item;
    return { ...item, currentPrice: prices[item.yahooSymbol] };
  });
}