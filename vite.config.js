import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/MTB-NT/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index'),
        map: resolve(__dirname, 'map'),
        trail: resolve(__dirname, 'trail'),
        catalogue: resolve(__dirname, 'catalogue'),
        info: resolve(__dirname, 'mer')
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
