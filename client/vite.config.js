import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Frontend calls `/api/...` (see `src/services/api.js`).
      // During development Vite proxies that to your backend server.
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        // Strip the `/api` prefix before sending to backend.
        // Example: GET /api/events -> GET http://localhost:5555/events
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})