import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const docsDir = path.join(projectRoot, 'docs');
const noJekyllPath = path.join(docsDir, '.nojekyll');

await mkdir(docsDir, { recursive: true });
await writeFile(noJekyllPath, '');

console.log('✅ ensured docs/.nojekyll exists');
