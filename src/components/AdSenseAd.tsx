import { useEffect, useRef, useState } from 'react';

/**
 * AdSense ad component - only renders for browser users (not WebView/app).
 * Place this between paragraphs in learning articles.
 */
export function AdSenseAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const [isWebView, setIsWebView] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const webView =
      /wv|WebView/i.test(ua) ||
      /; wv\)/.test(ua) ||
      (ua.includes('Android') && ua.includes('Version/')) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsWebView(webView);
  }, []);

  useEffect(() => {
    if (isWebView) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [isWebView]);

  if (isWebView) return null;

  return (
    <div ref={adRef} className="my-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-lg overflow-hidden bg-muted/30 border border-border/50 p-1">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="auto"
          data-full-width-responsive="true"
          // User must replace with their own ad client & slot
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
        />
      </div>
    </div>
  );
}
