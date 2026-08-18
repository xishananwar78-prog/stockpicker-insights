import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpstoxBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl p-2.5 border border-primary/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-tight">
            🚀 Open a Demat Account with Upstox & Join Our Premium Channel!
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand shrink-0 h-8 text-xs px-3"
        >
          <a
            href="https://upstox.com/open-demat-account?f=0VQ4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}
