import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/MTB-NT/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map.html'),
        trail: resolve(__dirname, 'trail.html'),
        catalogue: resolve(__dirname, 'catalogue.html'),
        info: resolve(__dirname, 'mer.html')
      }
    }
  },
  server: {
    open: true,
    proxy: {
      '/foo': 'http://localhost:5173/',
    }
  },
  resolve: {
    alias: {},
  },
});
