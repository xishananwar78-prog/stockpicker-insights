import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpstoxBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl p-4 border border-primary/30">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-foreground">
            🚀 Open a Demat Account with Upstox & Join Our Premium Telegram Channel!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Get exclusive intraday tips and priority recommendations
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand shrink-0"
        >
          <a
            href="https://upstox.com/open-demat-account?f=0VQ4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Account
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
