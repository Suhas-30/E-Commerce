import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,     // ✅ fixes live reload issues in WSL/Windows/macOS
      interval: 100,        // You can reduce polling interval for faster refresh
    },
  },
});
