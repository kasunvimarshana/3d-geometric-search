import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./src/core"),
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: ["occt-import-js"],
  },
});
