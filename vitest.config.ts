import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws when imported outside an RSC bundler; stub it so
      // server modules can be unit-tested in Node.
      'server-only': fileURLToPath(new URL('./tests/stubs/empty.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
