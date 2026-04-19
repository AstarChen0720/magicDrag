import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'; // 導入 Tailwind v4 樣式

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    // 告訴 WXT 需要向瀏覽器請求 'storage' 權限
    // 沒有這行就無法讀寫 chrome.storage (擴充功能儲存空間)，會導致存取時發生錯誤
    permissions: ['storage'],
  },
  vite: () => {
    return {
      plugins: [tailwindcss()], // 讓 Vite 使用 Tailwind
    };
  },
});
