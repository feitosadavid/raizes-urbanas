import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const raiz = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    cssMinify: "esbuild",
    rollupOptions: {
      input: {
        inicio: resolve(raiz, "index.html"),
        projetos: resolve(raiz, "projetos.html"),
        cadastro: resolve(raiz, "cadastro.html"),
        spaDemo: resolve(raiz, "spa-demo.html"),
      },
    },
  },
});
