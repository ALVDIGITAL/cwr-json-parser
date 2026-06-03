'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', 'test');

function findTestFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

const tests = findTestFiles(testDir);
if (tests.length === 0) {
  console.error('No test files found under test/');
  process.exit(1);
}

const args = ['tsx', '--test', ...tests].map((a) => JSON.stringify(a)).join(' ');
execSync(args, { stdio: 'inherit', cwd: path.join(__dirname, '..'), shell: true });
