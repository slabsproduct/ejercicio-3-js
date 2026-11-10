// vite.config.js
// Configuración base de Vite con el plugin oficial de React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto local para pruebas con QR desde el celular (misma red Wi-Fi)
    host: true, // Expone el servidor en la red local => los invitados pueden escanear el QR
  },
  build: {
    outDir: 'dist',          // Carpeta de salida que Firebase Hosting publicará
    sourcemap: false,        // No incluir sourcemaps en producción (build más liviano)
    chunkSizeWarningLimit: 1000,
  },
});
