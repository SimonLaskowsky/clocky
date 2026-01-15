import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Skip compression report (saves time)
    reportCompressedSize: false,
    // Separate huge Spline chunks
    rollupOptions: {
      output: {
        manualChunks: {
          spline: ["@splinetool/runtime", "vue3-spline"],
        },
      },
    },
  },
  // Pre-bundle Spline to avoid re-processing
  optimizeDeps: {
    include: ["@splinetool/runtime", "vue3-spline"],
  },
});
