import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: 'client',
    envDir: process.cwd(),
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      proxy: { '/api': { target: `http://127.0.0.1:${env.PORT || 3001}`, changeOrigin: true } },
    },
    preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: { output: { manualChunks: { three: ['three'] } } },
    },
    resolve: { alias: { '@': path.resolve(process.cwd(), 'client/src') } },
  };
});
