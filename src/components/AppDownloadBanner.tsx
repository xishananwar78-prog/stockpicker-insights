import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=stock.picker';
const DISMISS_KEY = 'app-download-banner-dismissed';

export const AppDownloadBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    // Detect WebView (appcreator24, or any Android/iOS WebView wrapper)
    const ua = navigator.userAgent || '';
    const isWebView =
      /wv|WebView/i.test(ua) ||
      /; wv\)/.test(ua) ||
      (ua.includes('Android') && ua.includes('Version/')) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Only show in regular mobile browsers (not WebView, not desktop)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    if (isMobile && !isWebView) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom animate-in slide-in-from-bottom duration-300">
      <div className="mx-2 mb-2 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-lg p-3 shadow-lg shadow-primary/10">
        <div className="flex items-center gap-3">
          {/* App icon placeholder */}
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary-foreground">sP</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">stockPICKER App</p>
            <p className="text-xs text-muted-foreground truncate">
              Get daily Intraday & Swing picks
            </p>
          </div>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </a>

          <button
            onClick={dismiss}
            className="shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
