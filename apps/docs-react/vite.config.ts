/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Builds the live React demos that the Blazor docs site (docs/Trazos.UI.Docs)
// loads when a reader picks React. Like the playground, it runs against the
// library SOURCE, so the docs always show the current packages/react code.
// The output is a generated static asset of the docs site (gitignored).
const librarySource = fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url));
const libraryFoundationCss = fileURLToPath(new URL('../../packages/react/src/styles/foundation.css', import.meta.url));
const docsOutput = fileURLToPath(new URL('../../docs/Trazos.UI.Docs/wwwroot/react', import.meta.url));

export default defineConfig({
  plugins: [react()],
  css: { transformer: 'postcss' },
  resolve: {
    alias: [
      { find: /^@carandev\/trazos-ui$/, replacement: librarySource },
      { find: /^@carandev\/trazos-ui\/styles\.css$/, replacement: libraryFoundationCss },
    ],
  },
  // Chunks and CSS load relative to the entry module, wherever the site is hosted.
  base: './',
  build: {
    outDir: docsOutput,
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL('src/main.tsx', import.meta.url)),
      // Blazor imports the entry as an ES module and calls its exports.
      preserveEntrySignatures: 'exports-only',
      output: {
        entryFileNames: 'trazos-react-demos.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
