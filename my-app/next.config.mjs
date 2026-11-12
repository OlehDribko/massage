import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: Next.js was inferring /Users/olegdribko/ as root (extra lockfile
  // outside the project), which made dev compile scan huge trees → RAM freeze.
  turbopack: {
    root: __dirname,
  },
  // Motion (test): React <ViewTransition> on route changes (app/layout.js).
  // Photos that must stay sharp (portrait, Endosphères) use quality 90.
  images: {
    qualities: [75, 90],
  },
  experimental: {
    viewTransition: true,
  },
  // The catalogue briefly lived at /prestations; /reserver is the single
  // booking entry now.
  async redirects() {
    return [
      { source: '/prestations', destination: '/reserver', permanent: true },
      {
        source: '/prestations/:serviceId',
        destination: '/reserver/:serviceId',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
