'use client';

import { useEffect, useRef } from 'react';

const WIDGET_BASE = 'https://d2skjte8udjqxw.cloudfront.net/widget/production/2';
const PRIMARY_COLOR =
  process.env.NEXT_PUBLIC_PLANITY_PRIMARY_COLOR ?? '#171717';

/**
 * Module Planity en marque blanche.
 * On utilise `appointmentContainer` pour n'afficher QUE la prise de rendez-vous
 * du salon — sans le compte client ni la recherche d'autres salons/praticiens.
 */
export default function PlanityIntegration() {
  const containerRef = useRef(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PLANITY_API_KEY;
    const container = containerRef.current;
    if (!key || !container) return undefined;

    window.planity = {
      key,
      primaryColor: PRIMARY_COLOR,
      appointmentContainer: container,
    };

    const polyfills = document.createElement('script');
    polyfills.id = 'planity-widget-polyfills';
    polyfills.src = `${WIDGET_BASE}/polyfills.latest.js`;
    polyfills.async = false;

    const app = document.createElement('script');
    app.id = 'planity-widget-app';
    app.src = `${WIDGET_BASE}/app.latest.js`;
    app.async = false;

    polyfills.onload = () => {
      if (polyfills.isConnected) document.body.appendChild(app);
    };
    document.body.appendChild(polyfills);

    return () => {
      polyfills.remove();
      app.remove();
      delete window.planity;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ minHeight: 'min(90vh, 1100px)' }}
    />
  );
}
