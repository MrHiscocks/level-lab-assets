import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const output = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const failures = [];
let size = 0, files = 0, links = 0;
function checkLink(page, value) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return;
  if (value.startsWith('/')) {
    failures.push(`${relative(output, page)}: root-absolute URL ${value}`);
    return;
  }
  const path = resolve(dirname(page), decodeURIComponent(value.split(/[?#]/)[0].replaceAll('&amp;', '&')));
  if ((path !== output && !path.startsWith(output + '/')) || !existsSync(path)) failures.push(`${relative(output, page)}: missing ${value}`);
  links++;
}
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error(`Symlink in published site: ${path}`);
    if (entry.isDirectory()) { walk(path); continue; }
    files++; size += statSync(path).size;
    if (path.endsWith('.html')) {
      for (const match of readFileSync(path, 'utf8').matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) checkLink(path, match[1]);
    }
    if (path.endsWith('.css')) {
      for (const match of readFileSync(path, 'utf8').matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) checkLink(path, match[1]);
    }
  }
}
for (const page of ['index.html', 'game-forge/index.html', 'prototype-chamber/index.html', 'unfold/index.html', 'pulse/index.html']) assert(existsSync(resolve(output, page)), `Missing ${page}`);
walk(output);
const catalogue = JSON.parse(readFileSync(resolve(output, 'game-forge/catalogue.json'), 'utf8'));
const generatedCatalogue = JSON.parse(readFileSync(resolve(output, '../game-forge/public/catalogue.json'), 'utf8'));
assert.deepEqual(catalogue, generatedCatalogue, 'Published catalogue differs from the freshly generated catalogue');
assert(catalogue.assets.length > 0, 'Game Forge catalogue is empty');
for (const asset of catalogue.assets) for (const file of asset.files) {
  checkLink(resolve(output, 'game-forge/index.html'), file.url);
  if (file.thumbnail) checkLink(resolve(output, 'game-forge/index.html'), file.thumbnail);
  if (catalogue.hosting === 'external') assert(file.url.includes('/game-forge/assets/'), 'External URL points to the old asset folder');
}
const context = { window: {} };
runInNewContext(readFileSync(resolve(output, 'prototype-chamber/js/manifest.js'), 'utf8'), context);
assert(context.window.PACKS?.length === 10, 'Expected all ten Prototype Chamber themes');
for (const pack of context.window.PACKS) for (const asset of pack.assets) checkLink(resolve(output, 'prototype-chamber/index.html'), asset.url);
assert(size < 950_000_000, 'Published site is too close to the GitHub Pages 1 GB limit');
if (failures.length) throw Error(failures.join('\n'));
console.log(`Verified ${files} published files, ${links} local references, ${catalogue.assets.length} Game Forge assets and 10 Prototype Chamber themes. ${(size / 1_000_000).toFixed(1)} MB total.`);
