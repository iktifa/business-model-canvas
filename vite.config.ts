import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the same build works at https://iktifa.github.io/business-model-canvas/
  // and at the root of a custom domain, with no changes.
  base: './',
})
