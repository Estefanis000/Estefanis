import { defineConfig } from 'vite'

export default defineConfig({
  root: 'portfolio',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
