import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server: {
  host: '0.0.0.0',
  port: 5173,
  origin: 'https://trainee.bigstream.cloud',
//    hmr: {
//     protocol: 'wss',
//         clientPort: 443,
//     host: "trainee.bigstream.cloud",
//         path: "/soket.io",
//   },
  allowedHosts: ['trainee.bigstream.cloud']
}
})
