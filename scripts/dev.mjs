#!/usr/bin/env node
/**
 * Cross-platform development runner.
 *
 * - Windows: uses backend/.venv/Scripts/python.exe and npm.cmd.
 * - Native Linux/macOS: uses backend/.venv/bin/python (or python3) and npm.
 * - WSL with a Windows-installed venv/node_modules: launches the Windows
 *   processes through cmd.exe interop, because native Windows binaries cannot
 *   run inside Linux.
 *
 * Usage:
 *   node scripts/dev.mjs              # API + Vite
 *   node scripts/dev.mjs --backend    # API only
 *   node scripts/dev.mjs --frontend   # Vite only
 *   node scripts/dev.mjs --print      # show the resolved commands
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');
const clientDir = path.join(root, 'client');
const args = new Set(process.argv.slice(2));
const only = args.has('--backend')
  ? 'backend'
  : args.has('--frontend')
    ? 'frontend'
    : null;

const isWindows = process.platform === 'win32';
const isWsl =
  process.platform === 'linux' &&
  (Boolean(process.env.WSL_DISTRO_NAME) ||
    (existsSync('/proc/version') &&
      readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')));

const winPython = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
const linuxPython = path.join(backendDir, '.venv', 'bin', 'python');
const linuxAltPython = path.join(backendDir, '.venv-linux', 'bin', 'python');

function toWindowsPath(value) {
  return value
    .replace(/^\/mnt\/([a-z])\//, (_, drive) => `${drive.toUpperCase()}:\\`)
    .replace(/\//g, '\\');
}

function nativeBackendSpec() {
  const python = isWindows
    ? existsSync(winPython)
      ? winPython
      : 'python'
    : existsSync(linuxPython)
      ? linuxPython
      : existsSync(linuxAltPython)
        ? linuxAltPython
        : 'python3';

  return {
    name: 'api',
    file: python,
    args: ['server/app.py'],
    cwd: backendDir,
    display: `"${python}" server/app.py`,
  };
}

function nativeFrontendSpec() {
  if (isWindows) {
    return {
      name: 'web',
      file: process.env.ComSpec || 'cmd.exe',
      args: ['/d', '/s', '/c', 'npm.cmd run dev'],
      cwd: clientDir,
      display: 'npm.cmd run dev',
    };
  }
  return {
    name: 'web',
    file: 'npm',
    args: ['run', 'dev'],
    cwd: clientDir,
    display: 'npm run dev',
  };
}

// A Windows venv cannot be executed by Linux. If WSL can see the Windows
// Python, run both development processes through Windows interop instead of
// failing with "Cannot find module @rollup/rollup-linux-x64-gnu" or
// "python: not found".
const useWindowsInterop = isWsl && existsSync(winPython);

function windowsInteropSpec(name, windowsDirectory, command) {
  return {
    name,
    file: 'cmd.exe',
    args: ['/c', `cd /d ${toWindowsPath(windowsDirectory)} && ${command}`],
    display: `cmd.exe /c "cd /d ${toWindowsPath(windowsDirectory)} && ${command}"`,
  };
}

let specs;
if (useWindowsInterop) {
  specs = [
    windowsInteropSpec(
      'api',
      backendDir,
      '.venv\\Scripts\\python.exe server\\app.py'
    ),
    windowsInteropSpec('web', clientDir, 'npm.cmd run dev'),
  ];
} else {
  specs = [nativeBackendSpec(), nativeFrontendSpec()];
}

if (only === 'backend') specs = [specs[0]];
if (only === 'frontend') specs = [specs[1]];

if (useWindowsInterop) {
  console.log(
    'WSL detected with a Windows-installed backend/node_modules; using Windows interop.'
  );
  console.log(
    'For a fully native Linux setup, create backend/.venv and run npm install inside WSL.'
  );
}

if (args.has('--print')) {
  specs.forEach((spec) => console.log(`${spec.name}: ${spec.display}`));
  process.exit(0);
}

const children = new Set();
let shuttingDown = false;

function stop(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  // Give children a moment to exit before the parent does.
  setTimeout(() => process.exit(exitCode), 250);
}

for (const spec of specs) {
  const child = spawn(spec.file, spec.args, {
    cwd: spec.cwd,
    stdio: 'inherit',
    windowsHide: true,
  });
  children.add(child);

  child.on('error', (error) => {
    console.error(`[${spec.name}] ${error.message}`);
    stop(1);
  });

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${spec.name}] stopped with ${reason}`);
    stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
