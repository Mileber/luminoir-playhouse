import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// 导入 PWA 插件
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 添加 PWA 插件配置
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // 开发环境下也启用 PWA 功能进行调试
      },
      manifest: {
        name: 'My Multi-Game PWA',
        short_name: 'GamesPWA',
        description: 'A collection of mini-games in a Progressive Web App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'src/assets/logo.svg', // 确保你有一个图标文件在此路径
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
        
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,wasm,png,jpg,jpeg,svg}'] // 缓存静态资源
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})