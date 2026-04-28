import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api-admin': {
                target: 'https://rwanda-administrative-structure-api.onrender.com/api',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api-admin/, '')
            }
        }
    }
});
