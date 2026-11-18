import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built app can run from GitHub Pages, a subpath,
// or a local static server without rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react()],
})