import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: undefined,
      tsDecorators: false,
    }),
  ],

  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,

    open: false,

    hmr: {
      overlay: true,
    },
  },

  build: {
    target: "es2020",
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
  },

  esbuild: {
    legalComments: "none",
  },

  clearScreen: false,
});

