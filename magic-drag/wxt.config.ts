import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'; // 引入最新tailwind v4 插件

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => {
    return {
      plugins: [tailwindcss()], // 告訴 Vite 使用 Tailwind
    };
  },
});
