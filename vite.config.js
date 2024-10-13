import { defineConfig } from 'vite';

export default defineConfig({
  base: '/BikePageVite/', // Ensures asset paths are correctly prefixed for GitHub Pages
  build: {
    outDir: 'dist', // Specifies the output directory (optional since 'dist' is default)
  },
  server: {
    open: true, // Opens the local server in the browser automatically when running dev mode
  },
  resolve: {
    alias: {
      // Example: '@': '/src' - You can set up aliases if needed
    },
  },
});
