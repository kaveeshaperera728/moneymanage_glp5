import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The `base` must match the GitHub repository name so that assets resolve
// correctly when the app is served from https://<user>.github.io/<repo>/
export default defineConfig({
  plugins: [react()],
  base: '/moneymanage_glp5/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
