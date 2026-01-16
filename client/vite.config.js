import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * 
 * Development server configuration for the LERA frontend application.
 * Sets up React plugin, development server port, and API proxy.
 * 
 * Key Features:
 * - React 19 support with @vitejs/plugin-react
 * - Fixed development server port (5173) for consistency
 * - API proxy to backend server for development
 * - CORS handling through proxy configuration
 * 
 * API Proxy Configuration:
 * - Routes /api/* requests to backend server
 * - Removes /api prefix before forwarding
 * - Handles CORS automatically
 * - Enables seamless frontend-backend communication
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Fixed port for Netlify dev server compatibility
    proxy: {
      // API proxy configuration for development
      // Frontend makes requests to /api/... (see src/services/api.js)
      // Vite proxies these requests to the backend server during development
      '/api': {
        target: 'http://localhost:5000', // Local backend for development
        changeOrigin: true, // Required for virtual hosted sites
        secure: false, // Required for localhost
        // Keep the /api prefix when forwarding to backend
        // Backend routes are registered with /api prefix (see backend/server/app.py)
        // Example: GET /api/events -> GET http://localhost:5000/api/events
      },
    },
  },
})
