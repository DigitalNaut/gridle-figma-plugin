import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./ui-src",
  plugins: [react(), viteSingleFile(), tsconfigPaths()],
  resolve: {
    alias: {
      "@components": resolve(__dirname, "ui-src/components"),
      "@hooks": resolve(__dirname, "ui-src/hooks"),
      "@common": resolve(__dirname, "common"),
    },
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    outDir: "../dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
