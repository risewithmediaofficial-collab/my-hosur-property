import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5001";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
                return "vendor-react";
              }
              if (id.includes("framer-motion") || id.includes("gsap")) {
                return "vendor-motion";
              }
              if (id.includes("@mui") || id.includes("@emotion")) {
                return "vendor-mui";
              }
              if (id.includes("i18next") || id.includes("react-i18next")) {
                return "vendor-i18n";
              }
              if (id.includes("@headlessui") || id.includes("lucide-react") || id.includes("react-hot-toast")) {
                return "vendor-ui";
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
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
