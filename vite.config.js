import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tra2.0/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
