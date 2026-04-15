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
    <div ref={adRef} className="my-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-ad-client="ca-pub-1732434513107221"
          data-ad-slot="XXXXXXXXXX"
        />
      </div>
    </div>
  );
}
