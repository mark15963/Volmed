import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
    assetsInlineLimit: 4096,
  },
});
