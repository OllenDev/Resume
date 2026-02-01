import { readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const indexPath = path.join(distDir, 'index.html');

const ensureFile = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
  } catch (error) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

await ensureFile(indexPath);

const indexContents = await readFile(indexPath, 'utf8');

assert(
  !indexContents.includes('/src/main.tsx') && !indexContents.includes('src/main.tsx'),
  'dist/index.html still references src/main.tsx; ensure deployment uses build output.',
);

assert(
  indexContents.includes('/assets/') || indexContents.includes('assets/'),
  'dist/index.html does not reference built assets; build output may be missing.',
);

console.log('✅ Deployment verification passed.');
