import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  optimizeDeps: {
  include: ["y-monaco", "y-websocket", "yjs"],
},
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://meetup-backend-dwvk.onrender.com',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'https://meetup-backend-dwvk.onrender.com',
        changeOrigin: true
      }
    },
  }
})
