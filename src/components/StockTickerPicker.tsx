import { useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchYahooStocks, YahooStockResult } from '@/lib/yahooFinance';

interface StockTickerPickerProps {
  stockName: string;
  value?: string;
  price?: number;
  error?: string;
  onSelect: (stock: YahooStockResult) => void;
}

export function StockTickerPicker({ stockName, value, price, error, onSelect }: StockTickerPickerProps) {
  const [query, setQuery] = useState(stockName);
  const [results, setResults] = useState<YahooStockResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const searchStocks = async () => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchError('Enter at least two characters to search.');
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    try {
      setResults(await searchYahooStocks(term));
      if (!results.length) setSearchError('No Indian exchange matches found. Try another name.');
    } catch (requestError) {
      setSearchError(requestError instanceof Error ? requestError.message : 'Search is unavailable.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Yahoo stock listing</span>
        {value && (
          <span className="inline-flex items-center gap-1 text-xs text-profit">
            <Check className="h-3.5 w-3.5" /> {value}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void searchStocks();
            }
          }}
          placeholder="Search stock name or ticker"
          className="bg-input border-border"
          aria-label="Search Yahoo stock listings"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => void searchStocks()} disabled={isSearching} aria-label="Search stocks">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto border border-border bg-card">
          {results.map((stock) => (
            <Button
              key={stock.symbol}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start rounded-none px-3 py-2.5 text-left"
              onClick={() => {
                onSelect(stock);
                setResults([]);
                setSearchError('');
              }}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{stock.name}</span>
                <span className="block text-xs text-muted-foreground">{stock.symbol} · {stock.exchange}</span>
              </span>
            </Button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-loss">{error}</p>}
      {searchError && <p className="text-xs text-muted-foreground">{searchError}</p>}
      {value && typeof price === 'number' && (
        <p className="text-xs text-muted-foreground">Yahoo quote loaded: ₹{price.toFixed(2)}. Prices may be delayed.</p>
      )}
    </div>
  );
}