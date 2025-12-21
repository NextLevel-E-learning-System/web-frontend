import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(), 
    tsconfigPaths(), 
    basicSsl()
  ],
  base: '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true 
    }
  }
})
