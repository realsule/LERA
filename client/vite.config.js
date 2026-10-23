import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for the LERA frontend.
 *
 * `/api/*` is proxied to the Flask backend during development so the browser
 * talks to the same origin and Flask session cookies are sent normally.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
