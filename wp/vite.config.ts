import { fileURLToPath } from "node:url";
import { viteImageOptimizer } from "@hilosiva/vite-plugin-image-optimizer";
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";
import { defineConfig } from "vite";
import vaultcss from "vite-plugin-vaultcss";
import { viteStaticCopy } from "vite-plugin-static-copy";

const dir = {
  src: "src",
  publicDir: "public",
  outDir: "dist",
};

export default defineConfig({
  root: dir.src,
  base: "./",
  publicDir: `../${dir.publicDir}`,
  plugins: [
    vaultcss(), 
    vitePhpLoader({
      useWpEnv: true,
    }),
    viteImageOptimizer({
      generate: {
        preserveExt: true,
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: ["./style.css", "./*.txt", "./screenshot.png"],
          dest: "./",
        },
      ],
      watch: {
        reloadPageOnChange: true,
      },
    }),
  ],
  build: {
    outDir: `../${dir.outDir}`,
    rollupOptions: {
      output: {
        entryFileNames: "scripts/[name]-[hash].js",
        chunkFileNames: "scripts/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          if (/\.(gif|jpeg|jpg|png|svg|webp)$/.test(names[0] ?? "")) {
            return "images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(names[0] ?? "")) {
            return "styles/[name]-[hash][extname]";
          }
          return "[name]-[hash][extname]";
        },
      },
    },
    assetsInlineLimit: 0,
    write: true,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    open: "http://localhost:8080",
    host: true,
  },

  css: {
    devSourcemap: true,
  },
});
