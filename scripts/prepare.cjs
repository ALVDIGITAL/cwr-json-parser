'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distEntry = path.join(__dirname, '..', 'dist', 'index.cjs');

if (fs.existsSync(distEntry)) {
  process.exit(0);
}

try {
  require.resolve('typescript');
} catch {
  console.warn(
    '@alvdigital/cwr-json-parser: dist/ is missing and TypeScript is not installed; skipping build.',
  );
  process.exit(0);
}

execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
