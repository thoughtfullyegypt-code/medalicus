import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: './', // Relative base for seamless proxy & subpath hosting (Colab, Vercel, Local)
  server: {
    port: 3000,
    host: true,
    cors: true,
    allowedHosts: true // Allow Google Colab, Cloudflare tunnels, and external host proxies
  },
  preview: {
    port: 3000,
    host: true,
    cors: true,
    allowedHosts: true
  }
});
