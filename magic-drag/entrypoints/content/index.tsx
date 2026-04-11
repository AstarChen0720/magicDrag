//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

// "@/"意思是專案根目錄:告訴主任,從專案的大門口 (根目錄) 出發，進入 assets 找 main.css
import "@/assets/main.css";
import { createRoot } from "react-dom/client";
import { MENU_ITEMS } from "../../config/menuConfig";
import { useDragMenu } from "../../hooks/useDragMenu";
import { PieMenu } from "../../components/PieMenu";

// --- 主程式：串接 Hook 與 UI ---
const MagicDragApp = () => {
  //執行自訂 Hook，取得選單要有的狀態
  const { isVisible, position, activeIndex } = useDragMenu();

  //把狀態傳給 UI 元件，讓它根據狀態顯示選單(右邊的參數是傳給 UI 的 props)
  return (
    <PieMenu
      isVisible={isVisible}
      position={position}
      activeIndex={activeIndex}
      menuItems={MENU_ITEMS}
    />
  );
};

// --- WXT插件自動渲染 ---
export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "magic-drag-ui",
      anchor: "body",
      position: "inline",
      append: "last",
      onMount: (container) => {
        const root = createRoot(container);
        root.render(<MagicDragApp />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
