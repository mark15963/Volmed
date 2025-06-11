import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  preview:{
    port: 4173,
  },
  define: {
    'process.env': process.env
  }
});
