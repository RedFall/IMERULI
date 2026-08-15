import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      input: ['index.html', 'privacy.html', 'cookies.html'],
    },
  },
})
