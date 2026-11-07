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
