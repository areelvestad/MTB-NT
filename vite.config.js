import { defineConfig } from 'vite';

// Vite configuration for TypeScript projects without React
export default defineConfig({
  build: {
    outDir: 'dist', // or another directory where you want the output to go
  },
  server: {
    open: true, // Opens the app in the browser automatically
  },
  resolve: {
    alias: {
      // Add any aliases you need here, like '@' to point to 'src'
    },
  },
});
