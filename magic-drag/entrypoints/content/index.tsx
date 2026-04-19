//?嗅祕?臭誑?湔?見??entrypoints/content.tsx
//雿?銝???冗隞亙?隞????嗡?瑼?瘥?銝?鈭?嚗???刻??冗銝嚗??芣?霈?怠? index ??獢?
//隞?瘙?閬???摰寥?曉 defineContentScript 鋆⊿嚗雿omponent 靘?

// "@/"?撠??寧???迄銝颱遙,敺?獢?憭折???(?寧?? ?箇嚗脣 assets ??main.css
import "@/assets/main.css";
import { createRoot } from "react-dom/client";
import { MENU_ITEMS } from "../../config/menuConfig";
import { useDragMenu } from "../../hooks/useDragMenu";
import { PieMenu } from "../../components/PieMenu";
import { PeekWindow } from "../../components/PeekWindow";

// --- 銝餌?撘?銝脫 Hook ??UI ---
const MagicDragApp = () => {
  //?瑁??芾? Hook嚗?敺?株??????
  const { isVisible, position, activeIndex, peekState, closePeek, activeMenuItems } = useDragMenu();

  //???蝯?UI ?辣嚗?摰???＊蝷粹???喲????豢?喟策 UI ??props)
  return (
    <>
      <PieMenu
        isVisible={isVisible}
        position={position}
        activeIndex={activeIndex}
        menuItems={activeMenuItems}
      />
      {peekState.isVisible && (
        <PeekWindow
          text={peekState.text}
          position={peekState.position}
          onClose={closePeek}
          mode={peekState.mode}
        />
      )}
    </>
  );
};

// --- WXT?辣?芸?皜脫? ---
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
