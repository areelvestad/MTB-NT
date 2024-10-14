import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/BikePageVite/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map.html'), // Add additional HTML files if needed
      }
    }
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {},
  },
});
