/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { relative } from 'node:path';

const external = [/^react($|\/)/, /^react-dom($|\/)/];

export default defineConfig({
  plugins: [react()],
  css: {
    // Keep the CSS as written: no syntax lowering (Lightning CSS would rewrite
    // `color-scheme` into custom-property hacks) and no minification, so the
    // shipped tokens are byte-for-byte the ones in @carandev/trazos-tokens.
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
