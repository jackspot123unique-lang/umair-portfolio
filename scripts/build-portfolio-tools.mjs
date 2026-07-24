import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });
await build({
  entryPoints: ['client-portfolio-tools.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020'],
  outfile: 'public/portfolio-tools.js',
  minify: true,
  legalComments: 'none',
});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs', 'public/pdf.worker.mjs');
