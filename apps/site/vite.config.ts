import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^uplus-icon$/, replacement: fileURLToPath(new URL('../../packages/icons/src/index.ts', import.meta.url)) },
      { find: /^uplus-icon\/dynamic$/, replacement: fileURLToPath(new URL('../../packages/icons/src/dynamic.ts', import.meta.url)) },
      { find: /^uplus-icon\/metadata$/, replacement: fileURLToPath(new URL('../../packages/icons/src/metadata.ts', import.meta.url)) },
    ],
  },
})
