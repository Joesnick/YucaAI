import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite servir el build desde cualquier subcarpeta o servidor estático.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
