#!/usr/bin/env node
/*
 * Compares the backend's OpenAPI with the snapshot this site was checked
 * against (contracts/openapi-subset.json): the components of the four
 * boundaries the site relies on (catalogue, availability, profile,
 * booking) and the Error body.
 *
 *   npm run contract:check -- ../../Massage-backend/docs/openapi.json
 *   npm run contract:check -- <file> --write --commit <backend sha>
 *
 * Exit 1 with the differing components when they changed; `--write`
 * replaces the snapshot (then run `npm test`: tests/api/contract.test.mjs
 * says whether the site's runtime checks still hold).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SNAPSHOT = path.join(ROOT, 'contracts/openapi-subset.json');
export const COMPONENTS = [
  'Service',
  'Availability',
  'ProfileView',
  'SyncResponse',
  'Booking',
  'Error',
];

/** Inlines `#/components/schemas/*` refs so each component stands alone. */
function resolve(node, schemas, seen = []) {
  if (Array.isArray(node))
    return node.map((item) => resolve(item, schemas, seen));
  if (!node || typeof node !== 'object') return node;
  if (typeof node.$ref === 'string') {
    const name = node.$ref.replace('#/components/schemas/', '');
    if (seen.includes(name)) return { $ref: node.$ref };
    return resolve(schemas[name], schemas, [...seen, name]);
  }
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      resolve(value, schemas, seen),
    ])
  );
}

export function subsetOf(openapi) {
  const schemas = openapi.components?.schemas ?? {};
  return Object.fromEntries(
    COMPONENTS.map((name) => [name, resolve(schemas[name] ?? null, schemas)])
  );
}

function backendCommit(file) {
  try {
    return execFileSync(
      'git',
      ['-C', path.dirname(file), 'rev-parse', 'HEAD'],
      {
        encoding: 'utf8',
      }
    ).trim();
  } catch {
    return null;
  }
}

function main(argv) {
  const file = argv.find((arg) => !arg.startsWith('--'));
  if (!file) {
    console.error(
      'Usage: npm run contract:check -- <backend docs/openapi.json> [--write] [--commit <sha>]'
    );
    return 2;
  }
  const commitIndex = argv.indexOf('--commit');
  const openapi = JSON.parse(readFileSync(file, 'utf8'));
  const current = subsetOf(openapi);
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));

  if (argv.includes('--write')) {
    const next = {
      source: {
        repository: 'OlehDribko/Massage-backend',
        file: 'docs/openapi.json',
        commit:
          commitIndex >= 0
            ? argv[commitIndex + 1]
            : backendCommit(path.resolve(file)),
        apiVersion: openapi.info?.version ?? null,
      },
      components: current,
    };
    writeFileSync(SNAPSHOT, `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `Snapshot written from ${file} (${next.source.commit ?? 'unknown commit'}).`
    );
    return 0;
  }

  const changed = COMPONENTS.filter(
    (name) =>
      JSON.stringify(current[name]) !==
      JSON.stringify(snapshot.components[name])
  );
  if (changed.length) {
    console.error(
      `OpenAPI differs from the snapshot (${snapshot.source.commit}) in: ${changed.join(', ')}.`
    );
    console.error(
      'Review the change, then refresh with --write and run npm test.'
    );
    return 1;
  }
  console.log(
    `OpenAPI matches the snapshot (${snapshot.source.commit}) for ${COMPONENTS.join(', ')}.`
  );
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
