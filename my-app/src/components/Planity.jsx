'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function Planity() {
  const apiKey = process.env.NEXT_PUBLIC_PLANITY_API_KEY;
  const [polyfillsLoaded, setPolyfillsLoaded] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    const onError = (event) => {
      const text = String(event?.message || '');
      if (text.toLowerCase().includes('planity')) {
        setMessage(`runtime error: ${text}`);
      }
    };

    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, [apiKey]);

  useEffect(() => {
    if (!appLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) {
        setMessage('container not found after script load');
        return;
      }

      if (container.childElementCount === 0) {
        setMessage(
          'widget script loaded but container is empty (usually invalid API key or domain not allowed in Planity settings)'
        );
      } else {
        setMessage('widget rendered');
      }
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [appLoaded]);

  if (!apiKey) {
    return <p>Planity API key is missing. Check NEXT_PUBLIC_PLANITY_API_KEY.</p>;
  }

  return (
    <>
      <p>
        Planity status: polyfills={polyfillsLoaded ? 'loaded' : 'pending'}, app=
        {appLoaded ? 'loaded' : 'pending'}
        {message ? `, ${message}` : ''}
      </p>
      <div
        ref={containerRef}
        id="planity"
        style={{
          minHeight: '1200px',
          width: '100%',
        }}
      />
      <Script
        id="planity-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.planity = {
              key: ${JSON.stringify(apiKey)},
              primaryColor: '#ff0000',
              servicesNotCollapsed: true
            };
          `,
        }}
      />
      <Script
        id="planity-polyfills"
        strategy="afterInteractive"
        src="https://d2skjte8udjqxw.cloudfront.net/widget/production/2/polyfills.latest.js"
        onLoad={() => setPolyfillsLoaded(true)}
        onError={() => setMessage('failed to load Planity polyfills')}
      />
      {polyfillsLoaded ? (
        <Script
          id="planity-app"
          strategy="afterInteractive"
          src="https://d2skjte8udjqxw.cloudfront.net/widget/production/2/app.latest.js"
          onLoad={() => setAppLoaded(true)}
          onError={() => setMessage('failed to load Planity app script')}
        />
      ) : null}
    </>
  );
}
