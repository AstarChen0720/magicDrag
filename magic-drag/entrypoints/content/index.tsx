//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

// "@/"意思是專案根目錄:告訴主任,從專案的大門口 (根目錄) 出發，進入 assets 找 main.css
import "@/assets/main.css";
import { createRoot } from "react-dom/client";
import { useState } from "react";

// 1️⃣ 建立一個 React 元件 
const MagicDragApp = () => {
  // 2️⃣ 這裡才是放 useState 的正確位置，並且這樣加上型別：
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <div className="fixed top-10 right-10 z-[9999]">
      <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer border-4 border-white">
        👷 Tailwind v4 測試成功！
      </div>
    </div>
  );
};


export default defineContentScript({
  matches: ["<all_urls>"], // 1. 告訴主任：這個內容腳本要在所有網頁上運行
  cssInjectionMode: "ui", // 2. 告訴主任：CSS 要注入到我的 UI 裡，不要弄亂網頁
  //為何要加上ctx?因為ctx是自動叫回員工的收工裝置,一定要傳入他,這樣你裡面如果寫ctx.XXX的東西時他才會正確運作,下面createShadowRootUi同理,第一個參數一定要是ctx,這是wxt的規定
  async main(ctx) {
    // 3. 建立一個隔離的施工區 (Shadow DOM)
    const ui = await createShadowRootUi(ctx, {
      name: "magic-drag-ui", // 這個名字會變成 Shadow DOM 的 id，方便我們在開發工具裡找到它
      anchor: "body", //錨點：把 UI 掛在 body 上
      position: "inline", //顯示方式：內嵌在網頁裡，跟網頁內容一樣上下滾動,或是浮在網頁上面，固定在某個位置(用'overlay')
      append: "last", //把 UI 加在錨點的最後面，還有 "first"、"replace"、"before"、"after" 等選項
      onMount: (container) => {
        // 當 UI 被掛載到網頁上時，主任會呼叫這個函式，並傳入一個 container 元素，
        // 這個 container 就是我們的施工區，我們可以在裡面建造我們的 UI。

        const root = createRoot(container); //告訴react:這個叫container的元素是我們的根,這部分就交給你來管理了
        root.render(
          //告訴react:在這個根裡面，幫我渲染下面這段 JSX，也就是我們的 UI,他是方便的react語法糖，實際上會被轉換成 createElement 的形式
          <MagicDragApp />,
        );
      },
    });

    ui.mount(); //執行把 UI 掛載到網頁上的動作，這樣我們的 UI 就會出現了
  },
});
