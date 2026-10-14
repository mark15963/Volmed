/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof import.meta.dirname !== "undefined"
    ? import.meta.dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@custom-types": path.resolve(import.meta.dirname, "./src/custom-types"),
      "@interfaces": path.resolve(import.meta.dirname, "./src/interfaces"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
    },
  },
  base: "/",
  envDir: "./",
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        target: "https://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://localhost:5000",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
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
    assetsInlineLimit: 4096,
    // kB
    chunkSizeWarningLimit: 1000,
    // kB
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            },
            {
              name: "antd",
              test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            },
          ],
        },
      },
    },
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
        includePaths: [path.resolve(import.meta.dirname, "src")],
      },
    },
  },
  optimizeDeps: {
    include: ["prop-types", "react", "react-dom"],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
