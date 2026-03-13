// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      ".trycloudflare.com"
    ],
    proxy: {
      '/api': {
        target: 'https://staging.odexglobal.com',
        changeOrigin: true,
      },
    }
  },
  define: {
    'process.env': {},
  },
})