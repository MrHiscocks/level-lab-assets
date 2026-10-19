import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const external = process.argv.includes('--external');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['run', external ? 'build:external' : 'build'], {
  cwd: resolve(root, 'game-forge'), stdio: 'inherit', env: process.env,
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, 'index.html'), resolve(output, 'index.html'));
await cp(resolve(root, 'game-forge/dist'), resolve(output, 'game-forge'), { recursive: true });
await cp(resolve(root, 'prototype-chamber'), resolve(output, 'prototype-chamber'), {
  recursive: true,
  filter: path => !path.endsWith('.zip'),
});
const packs = spawnSync('python3', [resolve(root, 'scripts/build-prototype-packs.py'), resolve(output, 'prototype-chamber/downloads')], { stdio: 'inherit' });
if (packs.error) throw packs.error;
if (packs.status !== 0) process.exit(packs.status ?? 1);
await writeFile(resolve(output, '.nojekyll'), '');
console.log('Built Level Lab menu, /game-forge/ and /prototype-chamber/.');
