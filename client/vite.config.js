import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: {
    host: "0.0.0.0", // Accessible on all network interfaces
    port: 4173, // Preview server port
    strictPort: true, // Disable auto-fallback port
    allowedHosts: ["volmed-o4s0.onrender.com", "localhost"],
  },
  envDir: "./", // Path to .env files
  server: {
    host: true, // Allow external access (e.g., LAN)
    port: 5173, // Dev server port
    strictPort: true, // Disable auto-fallback port
  },
});
