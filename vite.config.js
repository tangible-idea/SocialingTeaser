import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/poe': {
        target: 'https://api.poe.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/poe/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // API 키를 헤더에 추가
            const apiKey = process.env.VITE_POE_API_KEY || 'oqblhi8pIB7QFd1aNeRYHh7xQfdEHGW9yu3G6EHLiQE';
            proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
          });
        }
      }
    }
  }
})
