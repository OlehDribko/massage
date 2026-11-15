/*
 * Ports and ids of the isolated browser-test stack (e2e/stack.mjs). Shared by
 * the stack, the Playwright config and the fixtures.
 */
const port = (name, fallback) => Number(process.env[name] ?? fallback);

const sitePort = port('E2E_SITE_PORT', 3100);
const apiPort = port('E2E_API_PORT', 3101);
const authPort = port('E2E_AUTH_PORT', 9099);

export const E2E = {
  sitePort,
  apiPort,
  authPort,
  pgPort: port('E2E_PG_PORT', 55432),
  siteUrl: `http://localhost:${sitePort}`,
  siteOrigins: [`http://localhost:${sitePort}`, `http://127.0.0.1:${sitePort}`],
  apiUrl: `http://127.0.0.1:${apiPort}`,
  authUrl: `http://127.0.0.1:${authPort}`,
  // `demo-` projects never reach real Firebase (emulator only).
  firebaseProject: 'demo-massage-it',
  firebaseApiKey: 'demo-api-key',
};
