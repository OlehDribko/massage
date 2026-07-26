import { PLANITY_WIDGET_BASE } from './planityConfig';

function removePlanityScripts() {
  document
    .querySelectorAll('script[data-planity-widget="true"]')
    .forEach((node) => node.remove());
}

/**
 * Charge polyfills → app selon la doc Planity.
 * @param {Record<string, unknown>} planityConfig
 * @param {HTMLElement} container
 * @param {string} variant — id unique
 * @returns {() => void}
 */
export function loadPlanityWidget(planityConfig, container, variant) {
  removePlanityScripts();
  delete window.planity;
  container.replaceChildren();

  window.planity = planityConfig;

  const polyfills = document.createElement('script');
  polyfills.dataset.planityWidget = 'true';
  polyfills.id = `planity-polyfills-${variant}`;
  polyfills.src = `${PLANITY_WIDGET_BASE}/polyfills.latest.js`;
  polyfills.async = false;

  const app = document.createElement('script');
  app.dataset.planityWidget = 'true';
  app.id = `planity-app-${variant}`;
  app.src = `${PLANITY_WIDGET_BASE}/app.latest.js`;
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
}
