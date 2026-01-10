import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/",
  envDir: "./",
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    assetsDir: "assets",
    emptyOutDir: true,
    copyPublicDir: true,
    manifest: true,
    assetsInlineLimit: 4096, // kB
    chunkSizeWarningLimit: 1000, // kB
    rollupOptions:{
      output:{
        manualChunks:{
          vendor:['react', 'react-dom']
        }
      }
    }
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/mixins" as *; 
          @use "@/styles/variables" as *;
          `,
        includePaths: [path.resolve(__dirname, "src")],
      },
    },
  },
});
