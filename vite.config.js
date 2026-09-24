import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5001";

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      cssCodeSplit: true,
      reportCompressedSize: false, // speed up build reporting
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // Core React — loaded immediately, must be tiny
            if (
              id.includes("/react/") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom") ||
              id.includes("scheduler")
            ) {
              return "vendor-react";
            }

            // Framer Motion — page transitions
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }

            // GSAP — scroll animations (loaded separately from framer)
            if (id.includes("gsap")) {
              return "vendor-gsap";
            }

            // MUI / Emotion — heavy, split into its own chunk
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-mui";
            }

            // i18n — language loading
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "vendor-i18n";
            }

            // Light UI utilities
            if (
              id.includes("@headlessui") ||
              id.includes("lucide-react") ||
              id.includes("react-hot-toast")
            ) {
              return "vendor-ui";
            }
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

