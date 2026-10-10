import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the build works from any sub-path (GitHub Pages, S3 folder, etc.)
  base: "./",
  plugins: [react()],
})
