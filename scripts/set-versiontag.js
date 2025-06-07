// scripts/set-versiontag.js
// This script writes the current git commit SHA to .env file for Vite to use as VITE_GIT_COMMIT_SHA
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  const sha = execSync('git rev-parse --short HEAD').toString().trim();
  writeFileSync('.env', `VITE_GIT_COMMIT_SHA=${sha}\n`);
  console.log('Set VITE_GIT_COMMIT_SHA to', sha);
} catch (e) {
  console.error('Failed to set VITE_GIT_COMMIT_SHA:', e);
  process.exit(1);
}
