import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Classic workers (IIFE) support importScripts — needed to load the Stockfish IIFE bundle.
  worker: {
    format: 'iife',
  },
  optimizeDeps: {
    // Stockfish is a CJS/Emscripten bundle; exclude from Vite's pre-bundling.
    // See setup note in stockfish.worker.ts about copying WASM files to public/.
    exclude: ['stockfish'],
  },
});
