//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

// "@/"意思是專案根目錄:告訴主任,從專案的大門口 (根目錄) 出發，進入 assets 找 main.css
import "@/assets/main.css";
import { createRoot } from "react-dom/client";
import { useState } from "react";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui", // 2. 告訴主任：CSS 要注入到我的 UI 裡，不要弄亂網頁

  const[isVsible, setIsVisible] = useState(false);
  const[Postion, setPosition] = useState({ top: 0, left: 0 });
  const[selectedText, setSelectedText] = useState("");
  const[activeIndex, setActiveIndex] = useState(0);


  async main(ctx) {
    // 3. 建立一個隔離的施工區 (Shadow DOM)
    const ui = await createShadowRootUi(ctx, {
      name: "magic-drag-ui",
      position: "inline",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        // 4. 在隔離區裡叫 React 工頭出來畫畫
        const root = createRoot(container);
        root.render(
          <div className="fixed top-10 right-10 z-[9999]">
            <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer border-4 border-white">
              👷 Tailwind v4 測試成功！
            </div>
          </div>,
        );
      },
    });

    ui.mount();
  },
});
