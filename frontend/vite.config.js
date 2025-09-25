import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exponer en la red local (usa tu IP para acceder desde otros dispositivos)
    port: 5173,       // Puerto del servidor de desarrollo
    strictPort: true, // Falla si el puerto está ocupado en lugar de elegir otro
    open: true,       // Abre el navegador automáticamente
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: '0.0.0.0', // Exponer en la red local para vite preview
    port: 4173,       // Puerto de vista previa
    strictPort: true
  }
})
