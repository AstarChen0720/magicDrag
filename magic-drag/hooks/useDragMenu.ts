// --- Custom Hook：處理所有有關拖曳的邏輯 ---

import { useState, useEffect } from "react";
import { MENU_CONFIG, MENU_ITEMS } from "../config/menuConfig";

// --- Custom Hook：處理所有拖曳邏輯 ---
export const useDragMenu = () => {
  //會用到的狀態
  //可見性
  const [isVisible, setIsVisible] = useState(false);
  // 圓心位置
  const [position, setPosition] = useState({ top: 0, left: 0 });
  // 選單狀態
  const [selectedText, setSelectedText] = useState("");
  // 哪個按鈕被選取了 (-1 代表沒選)
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  // Peek 視窗狀態
  const [peekState, setPeekState] = useState<{
    isVisible: boolean;
    text: string;
    position: { top: number; left: number };
    mode?: "summary" | "display" | "translate";
  }>({
    isVisible: false,
    text: "",
    position: { top: 0, left: 0 },
    mode: "summary",
  });
  // #endregion

  //主邏輯：監聽拖曳事件，計算選單狀態
  useEffect(() => {
    // 計算滑鼠位置與圓心的關係,來判斷選單顯示和選取狀態
    const handleDrag = (e: DragEvent) => {
      if (!isVisible) return;

      // 1. 計算滑鼠相對於圓心的偏移量
      const dx = e.clientX - position.left;
      const dy = e.clientY - position.top;

      // 2. 勾股定理算距離： d = sqrt(dx² + dy²)
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 3. 判斷是否在「感應區」內
      if (
        distance > MENU_CONFIG.deadZone &&
        distance < MENU_CONFIG.sensitivity
      ) {
        // 4. 使用 atan2 算角度，並轉成 0~360 度
        // atan2:傳入平面座標(y,x),回傳角度,但是是弳度,所以我們要乘以 (180 / Math.PI) 轉成角度後，修正 -90 度的偏移
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // 讓 0 度落在正上方,原生算出來右邊零度,故+90讓上面零度,原生算出來是 -180~180 度,加上 360 再取餘數，轉成 0~360 度
        angle = (angle + 90 + 360) % 360;

        // 5. 根據角度判斷屬於哪一個「披薩切片」
        // 每個選項占 360 / MENU_ITEMS.length(選單項目數量) 度
        const sectionAngle = 360 / MENU_ITEMS.length;
        const index =
          // 把角度加上半個切片的角度，這樣就能讓切片的邊界變成兩個切片的中間,(第一個選項變正上開始)
          //最後再對選項數量取餘數，確保 index 到2後會回到0,不會越來越大
          Math.floor((angle + sectionAngle / 2) / sectionAngle) %
          MENU_ITEMS.length;

        setActiveIndex(index);
      } else {
        setActiveIndex(-1); // 在盲區或太遠，不選取
      }
    };

    // 開始拖曳的時候，顯示選單並記錄選取的文字和圓心位置
    const handleDragStart = (e: DragEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        setSelectedText(selection);
        setIsVisible(true);
        setPosition({ top: e.clientY, left: e.clientX });
      }
    };

    // 根據位置觸發的動作的選項內容
    const handleDragEnd = async () => {
      //如果有觸發按鈕
      if (activeIndex !== -1) {
        const action = MENU_ITEMS[activeIndex];

        // 💡 執行動作：
        switch (action.id) {
          case "search":
            browser.runtime.sendMessage({
              type: "QUICK_SEARCH",
              payload: selectedText,
            });
            break;

          case "copy":
            // 複製文字
            navigator.clipboard.writeText(selectedText);
            console.log("📋 文字已複製到剪貼簿");
            break;

          case "translate":
            // 翻譯：先顯示 Loading 狀態的 PeekWindow
            setPeekState({
              isVisible: true,
              text: "翻譯中...",
              position: { top: position.top, left: position.left },
              mode: "translate",
            });

            // 傳送給後端(Background)進行翻譯
            try {
              const response = await browser.runtime.sendMessage({
                type: "TRANSLATE",
                payload: selectedText,
              });

              if (response && response.translatedText) {
                // 將翻譯結果更新到 PeekWindow 上
                setPeekState({
                  isVisible: true,
                  text: response.translatedText,
                  position: { top: position.top, left: position.left },
                  mode: "translate",
                });
              } else {
                setPeekState({
                  isVisible: true,
                  text: "翻譯失敗",
                  position: { top: position.top, left: position.left },
                  mode: "translate",
                });
              }
            } catch (err) {
              console.error("發送翻譯請求失敗:", err);
              setPeekState({
                isVisible: true,
                text: "發生錯誤: 翻譯請求失敗",
                position: { top: position.top, left: position.left },
                mode: "translate",
              });
            }
            break;

          case "peek":
            // 快速預覽 (顯示 PeekWindow)，預設使用 summary 模式 (Tavily API)
            setPeekState({
              isVisible: true,
              text: selectedText,
              position: { top: position.top, left: position.left },
              mode: "summary",
            });
            break;

          default:
            console.log("未知的操作:", action.id);
            break;
        }
      }
      setIsVisible(false);
      setActiveIndex(-1);
    };

    // 安裝事件監視器,來追蹤拖曳行為
    document.addEventListener("drag", handleDrag);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("mousedown", () => setIsVisible(false));

    // 清理事件監聽器，避免記憶體洩漏
    return () => {
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [isVisible, position, activeIndex, selectedText]);

  // 關閉 Peek 視窗的函式,要傳出去給 PeekWindow 使用
  const closePeek = () =>
    setPeekState((prev) => ({ ...prev, isVisible: false }));

  return { isVisible, position, activeIndex, peekState, closePeek };
};
