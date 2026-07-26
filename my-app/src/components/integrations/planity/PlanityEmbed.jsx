'use client';

import { useEffect, useRef } from 'react';

import { loadPlanityWidget } from './loadPlanityWidget';

/**
 * Coquille DOM pour le widget white-label Planity.
 */
export default function PlanityEmbed({ variant, buildConfig }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PLANITY_API_KEY;
    const container = containerRef.current;
    if (!key || !container) return undefined;

    const config = buildConfig(key, container);
    if (!config) return undefined;

    return loadPlanityWidget(config, container, variant);
  }, [variant, buildConfig]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ minHeight: 'min(90vh, 1100px)' }}
    />
  );
}
