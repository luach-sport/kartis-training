// Vite bundles the many small source files into one web app (dist/) that Capacitor packs into the APK.
// "mock" mode swaps the Firebase services for in-memory fakes, so every screen can be tried in a
// browser without a Firebase project (used for local testing and screenshots).
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) => ({
  base: './',
  resolve: {
    alias: {
      '@services': here(mode === 'mock' ? './tests/mock-services' : './src/services')
    }
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900
  },
  server: { host: '127.0.0.1', port: 5173 }
}));
