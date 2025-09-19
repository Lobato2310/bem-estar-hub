import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; 
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // <-- necessário para Capacitor (paths relativos)  
  build: {
    target: "esnext",
    sourcemap: false,
    // Otimizações para mobile
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    // Otimizações de performance
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true
      }
    },
    // Chunk size limite
    chunkSizeWarningLimit: 1000,
  },
}));
