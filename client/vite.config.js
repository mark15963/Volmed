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
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["volmed-o4s0.onrender.com", "localhost", /\.onrender\.com$/],
    cors: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["volmed-o4s0.onrender.com", "localhost", /\.onrender\.com$/],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    manifest: true,
    assetsInlineLimit: 4096, // kB
    chunkSizeWarningLimit: 1000, // kB
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
