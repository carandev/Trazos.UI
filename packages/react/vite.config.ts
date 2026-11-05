/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative } from 'node:path';
import type { Plugin } from 'vite';

const external = [/^react($|\/)/, /^react-dom($|\/)/];

// Ships the tokens alone as dist/tokens.css (`@carandev/trazos-ui/tokens.css`)
// for apps that only want the CSS variables. The tokens workspace itself is
// not published, so the file is copied in, unchanged, at build time.
function tokensAsset(): Plugin {
  const source = createRequire(import.meta.url).resolve('@carandev/trazos-tokens/tokens.css');
  return {
    name: 'trazos-tokens-asset',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'tokens.css', source: readFileSync(source, 'utf8') });
    },
  };
}

export default defineConfig({
  plugins: [react(), tokensAsset()],
  css: {
    // Keep the CSS as written: no syntax lowering (Lightning CSS would rewrite
    // `color-scheme` into custom-property hacks) and no minification, so the
    // shipped tokens are byte-for-byte the ones in packages/tokens.
    transformer: 'postcss',
  },
  build: {
    cssMinify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      cssFileName: 'styles',
    },
    sourcemap: true,
    rollupOptions: {
      external,
      output: {
        // One module per source file so bundlers can drop unused components.
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Name each file after its source path; the default [name] gets a numeric
        // suffix (Button2.js) because the extracted Button.css claims the name first.
        entryFileNames: (chunk) =>
          chunk.facadeModuleId
            ? `${relative('src', chunk.facadeModuleId).replace(/\.tsx?$/, '')}.js`
            : '[name].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
