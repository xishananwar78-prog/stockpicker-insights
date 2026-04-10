import { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=stock.picker';
const DISMISS_KEY = 'app-download-banner-dismissed';

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
  </svg>
);

const AppLogo = () => (
  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 via-primary to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-primary/30 relative overflow-hidden">
    {/* Mini chart lines */}
    <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full opacity-20">
      <polyline points="4,30 12,22 18,26 26,14 36,10" fill="none" stroke="white" strokeWidth="2" />
    </svg>
    <TrendingUp className="h-5 w-5 text-white relative z-10" strokeWidth={2.5} />
  </div>
);

export const AppDownloadBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const ua = navigator.userAgent || '';
    const isWebView =
      /wv|WebView/i.test(ua) ||
      /; wv\)/.test(ua) ||
      (ua.includes('Android') && ua.includes('Version/')) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isWebView) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-[4.5rem] md:bottom-4 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-xl p-3 shadow-2xl shadow-black/20">
        <button
          onClick={dismiss}
          className="absolute -top-2 -right-1 p-1 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-3">
          <AppLogo />

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground leading-tight">stockPICKER</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-yellow-500">★★★★★</span>
              <span className="text-[10px] text-muted-foreground">4.5</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Daily Intraday & Swing picks
            </p>
          </div>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-md shadow-emerald-900/30"
          >
            <GooglePlayIcon />
            GET
          </a>
        </div>
      </div>
    </div>
  );
};
