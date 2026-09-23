import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// All API calls go to our own backend (server/) — it holds the secrets
// (IndianAPI key, Anthropic key) and talks to upstream sources itself, so
// nothing sensitive is ever sent to or bundled into the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    // Without this, Vite/Node on Windows can end up bound only to the
    // IPv6 loopback (::1) — curl and some tools resolve "localhost" to
    // ::1 and connect fine, but Chrome often tries 127.0.0.1 (IPv4)
    // first and gets ERR_CONNECTION_REFUSED. Binding explicitly avoids
    // the ambiguity.
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.BACKEND_PORT || 5174}`,
        changeOrigin: true,
      },
    },
  },
})
