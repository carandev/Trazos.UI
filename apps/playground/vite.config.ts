import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The playground runs against the library SOURCE, so edits in packages/react
// show up instantly. Imports stay the same as in a real app:
//   '@carandev/trazos-ui'            -> packages/react/src/index.ts
//   '@carandev/trazos-ui/styles.css' -> the foundation CSS (tokens + utilities);
//                                       each component module imports its own CSS.
// The explicit styles import matters: the package marks only CSS as having side
// effects, so a production build skips the barrel's own CSS import.
const librarySource = fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url));
const libraryFoundationCss = fileURLToPath(new URL('../../packages/react/src/styles/foundation.css', import.meta.url));

export default defineConfig({
  plugins: [react()],
  css: { transformer: 'postcss' },
  resolve: {
    alias: [
      { find: /^@carandev\/trazos-ui$/, replacement: librarySource },
      { find: /^@carandev\/trazos-ui\/styles\.css$/, replacement: libraryFoundationCss },
    ],
  },
  base: './',
});
