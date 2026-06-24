// Sync the published rule catalog from `verification-layer` into the website as data.
//
// The MCP route (app/mcp/route.ts) imports a local copy of the catalog JSON so the
// serverless function never pulls in the scanner runtime (fs, glob, parser, AI SDK).
// This script copies the canonical catalog out of the installed devDependency and
// refreshes the committed snapshot. It runs before `next build` (see package.json).
//
// `verification-layer` is ESM-only and its package `exports` expose ONLY ".", so we
// cannot deep-import 'verification-layer/dist/rule-catalog.json' nor even
// 'verification-layer/package.json'. Instead we resolve the package's main entry and
// walk up to its root directory, then read dist/rule-catalog.json off the filesystem.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = 'verification-layer';
const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, '..', 'app', 'mcp', 'rule-catalog.json');

function fail(message) {
  console.error(`[sync-rule-catalog] ${message}`);
  process.exit(1);
}

// 1. Resolve the package main entry (only "." is exported) and find its root dir.
let mainUrl;
try {
  mainUrl = import.meta.resolve(PKG);
} catch {
  fail(`Cannot resolve "${PKG}". Install it: npm install --save-dev ${PKG}`);
}

let pkgRoot = null;
for (let cur = dirname(fileURLToPath(mainUrl)); ; ) {
  const pkgJsonPath = join(cur, 'package.json');
  if (existsSync(pkgJsonPath)) {
    try {
      if (JSON.parse(readFileSync(pkgJsonPath, 'utf8')).name === PKG) {
        pkgRoot = cur;
        break;
      }
    } catch {
      // keep walking up
    }
  }
  const parent = dirname(cur);
  if (parent === cur) break;
  cur = parent;
}

if (!pkgRoot) fail(`Could not locate the "${PKG}" package root from its resolved entry.`);

// 2. Read and validate the canonical catalog.
const src = join(pkgRoot, 'dist', 'rule-catalog.json');
if (!existsSync(src)) {
  fail(`Source catalog missing at ${src}. Is the installed "${PKG}" version too old (need >= 0.27.0)?`);
}

let catalog;
try {
  catalog = JSON.parse(readFileSync(src, 'utf8'));
} catch (err) {
  fail(`Source catalog at ${src} is not valid JSON: ${err.message}`);
}

if (!Array.isArray(catalog.rules) || catalog.rules.length === 0) {
  fail('Source catalog has no rules array.');
}
if (typeof catalog.total !== 'number' || catalog.total !== catalog.rules.length) {
  fail(`Source catalog total (${catalog.total}) does not match rules.length (${catalog.rules.length}).`);
}

// 3. Write the snapshot the route imports.
writeFileSync(dest, JSON.stringify(catalog, null, 2) + '\n');

const categories = [...new Set(catalog.rules.map((r) => r.category))];
console.log(
  `[sync-rule-catalog] ${PKG}@${catalog.version}: wrote ${catalog.total} rules across ` +
    `${categories.length} categories -> app/mcp/rule-catalog.json`,
);
