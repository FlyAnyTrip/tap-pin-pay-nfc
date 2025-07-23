import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          qr: ["qr-scanner"],
          pdf: ["jspdf", "html2canvas"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    // Removed proxy since we're using deployed backend
  },
})
