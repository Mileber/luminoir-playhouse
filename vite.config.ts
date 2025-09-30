import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs' // Import filesystem module
import path from 'path' // Import path module


// --- Read homepage from package.json and set base ---
let base = '/';
try {
  const pkgPath = path.resolve(__dirname, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkgJson.homepage) {
    // Extract the pathname part (e.g., /repo-name/) from the full URL
    const urlObj = new URL(pkgJson.homepage);
    base = urlObj.pathname;
    // Ensure leading slash and trailing slash for subpaths
    if (!base.startsWith('/')) {
      base = '/' + base;
    }
    if (!base.endsWith('/')) {
      base += '/';
    }
  }
} catch (error) {
  console.warn('Could not read homepage from package.json for base config:', error);
}
console.log(`Setting Vite base to: '${base}'`); // Log the base for debugging
// ----------------------------------------------------


// https://vitejs.dev/config/
export default defineConfig({

  base: base, // <-- Use the dynamically determined base

  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,xml}'] // Added json/xml for manifest etc.
      },
      devOptions: {
        enabled: false
      },
      manifest: {
        name: 'My Awesome PWA Game Hub',
        short_name: '秘制小游戏',
        description: 'A collection of fun mini-games built with Vue 3!',
        theme_color: '#ffffff',
        // Make sure icon path is relative to the 'public' directory or correctly resolved
        icons: [
          {
            src: 'logo.png', // This path is relative to index.html *after* base is applied
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Optional: for debugging, ensure source maps are generated
  build: {
    sourcemap: true 
  }
})
