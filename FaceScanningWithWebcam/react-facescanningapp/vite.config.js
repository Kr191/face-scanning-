import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server: {
  host: '0.0.0.0',
  port: 5173,
  origin: 'https://trainee.bigstream.cloud',
  hmr: {
    protocol: 'ws',
    host: 'trainee.bigstream.cloud',
    port: 443,     // required, browser uses HTTPS to Cloudflare
    path: '/'
  },
  allowedHosts: ['trainee.bigstream.cloud']
}
})
