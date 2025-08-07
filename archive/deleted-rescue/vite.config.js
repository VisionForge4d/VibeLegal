// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist'
  },
  // 👇 this is the key line
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // 👇 this line helps React Router
  optimizeDeps: {
    include: ['react-router-dom'],
  }
})
