import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@uplus-icon\/react$/, replacement: fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)) },
      { find: /^@uplus-icon\/react\/dynamic$/, replacement: fileURLToPath(new URL('../../packages/react/src/dynamic.ts', import.meta.url)) },
      { find: /^@uplus-icon\/motion$/, replacement: fileURLToPath(new URL('../../packages/motion/src/index.ts', import.meta.url)) },
      { find: /^@uplus-icon\/core$/, replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)) },
      { find: /^@uplus-icon\/core\/dynamic$/, replacement: fileURLToPath(new URL('../../packages/core/src/dynamic.ts', import.meta.url)) },
      { find: /^@uplus-icon\/core\/metadata$/, replacement: fileURLToPath(new URL('../../packages/core/src/metadata.ts', import.meta.url)) },
    ],
  },
})
