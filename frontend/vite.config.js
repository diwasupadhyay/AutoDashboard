import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['recharts', 'react-is'],
  },
  server: {
    proxy: {
      '/upload': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
      '/insights': 'http://localhost:8000',
    },
  },
})
