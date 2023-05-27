import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/ui",
  plugins: [react(), viteSingleFile(), tsconfigPaths()],
  resolve: {
    alias: {
      "~components": resolve(__dirname, "src/ui/components"),
      "~hooks": resolve(__dirname, "src/ui/hooks"),
      "@common": resolve(__dirname, "src/common"),
      "~": resolve(__dirname, "src/ui"),
    },
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    outDir: "../../dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
