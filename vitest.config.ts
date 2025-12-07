
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom', // Changed from jsdom to happy-dom
    globals: true,
    setupFiles: [], 
  },
});
