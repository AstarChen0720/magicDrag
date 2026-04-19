import { useState, useEffect, useMemo } from "react";
import { MENU_CONFIG, MENU_ITEMS } from "../config/menuConfig";
import { menuSettingsStorage, MenuSettings } from "../utils/storage";


export const useDragMenu = () => {
  // 控制圓形選單目前的顯示狀態（開/關）
  const [isVisible, setIsVisible] = useState(false);
  // 記錄選單顯示的中心位置，這也是滑鼠剛開始拖曳的起始點座標
  const [position, setPosition] = useState({ top: 0, left: 0 });
  // 存放使用者選取的文字片段
  const [selectedText, setSelectedText] = useState("");
  // 記錄目前滑鼠「停留」在哪一個選單選項的 Index 上（-1 代表沒有選到東西）
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // 記錄並管理彈出的「預覽工具視窗（翻譯、摘要）」狀態
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

  // ====== 追蹤 Popup 的用戶設定 (Storage) ======
  // 從 WXT Local Storage 中讀取的設定狀態
  const [settings, setSettings] = useState<MenuSettings | null>(null);

  // 第一個 Effect：負責取得設定並保持連動同步
  useEffect(() => {
    // 第一次抓取當前設定資料
    menuSettingsStorage.getValue().then(setSettings);
    // 建立監聽器：一旦在 Popup 修改了選項，這邊就會即時更新這支 Hook 的設定值
    const unwatch = menuSettingsStorage.watch((newVal) => {
      if (newVal) setSettings(newVal);
    });
    return unwatch; // 記得在元件卸載時取消監聽，避免漏水
  }, []);

  // 第二個Effect：將儲存空間的設定轉化成「要出現在圓盤上的實際陣列」
  // 利用 useMemo 來確保只在 settings 改變時才重新計算以節省效能
  const activeMenuItems = useMemo(() => {
    // 預設防呆條件，若資料還沒進來、顯示原始全部選項
    if (!settings) return MENU_ITEMS;

    // 將儲存的 ID 陣列（含有你排好的順序）映射轉換回「完整的選項物件」陣列
    const items = settings.activeMenuIds
      .map((id) => MENU_ITEMS.find((item) => item.id === id))
      // 把不小心對不到的 undefined 物件濾掉
      .filter((item) => item !== undefined) as typeof MENU_ITEMS;

    // 防呆：如果你把全部功能都關了導致長度為空，就自動回傳預設項目避免選單消失
    return items.length > 0 ? items : MENU_ITEMS;
  }, [settings]);


  // ====== 核心事件與圓盤角度計算區塊 ======
  useEffect(() => {
    // 【事件 1：拖曳處理】滑鼠移動時，計算目前指標該點亮哪一個選單「切片」
    const handleDrag = (e: DragEvent) => {
      // 想省效能：如果圓盤不在顯示狀態，我們就無需作任何運算
      if (!isVisible) return;

      // 計算滑鼠「相對於你開始拖曳時（圓心）」的水平＆垂直距離 (dx, dy)
      const dx = e.clientX - position.left;
      const dy = e.clientY - position.top;

      // 使用勾股定理（畢氏定理 A²+B²=C²）算出滑鼠離圓心實際有多遠的絕對距離
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 這裡是用來判定是否為「有效點擊範圍」
      // 大於 deadZone (盲區) = 防止你不小心移動一點點觸發
      // 小於 sensitivity (最大區) = 不能拖得太遠不然就不算了
      if (
        distance > MENU_CONFIG.deadZone &&
        distance < MENU_CONFIG.sensitivity
      ) {
        // 算出對應角度（將直角座標轉換出偏向角徑度、再乘 180 / π 轉成 1..360 角度）
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // 上面算出來的會有負角，透過 (x + 360) % 360 等方式強迫轉為正角度，且以 12 點方向作為起點
        angle = (angle + 90 + 360) % 360;

        // 【動態扇形角度】依據現有選單要啟用的個數來算出每一塊切片佔幾度
        // 例如如果有 4 個顯示，切片就是 360/4 = 90度一塊
        const sectionAngle = 360 / activeMenuItems.length;

        // 數學重點：靠角度來確定他歸屬於哪個切片 Index
        // 角度偏移一半切片是為了讓正上方對齊第一格，最後 % 長度避免超過最後一格
        const index =
          Math.floor((angle + sectionAngle / 2) / sectionAngle) %
          activeMenuItems.length;

        setActiveIndex(index); // 將算出來的索引位置儲存起來
      } else {
        // 如果不在有效範圍內（太近或太遠），就把 Hover 狀態歸零
        setActiveIndex(-1);
      }
    };
    // 【事件 2：點擊拖曳起點】判斷是否選取到反白文字，開啟選單
    const handleDragStart = (e: DragEvent) => {
      // 抓住目前劃取到的內容文字、並且去掉前後的空白 (trim)
      const selection = window.getSelection()?.toString().trim();
      // 有選到東西才執行動作喔，避免拖一堆廢圖或是在空白的地方作業
      if (selection) {
        setSelectedText(selection); // 儲存該選取文字以備後用
        setIsVisible(true); // 把「呼叫選單」這個狀態開啟
        setPosition({ top: e.clientY, left: e.clientX }); // 設定選單展開的中心點
      }
    };

    // 【事件 3：放開拖曳結果】根據你游標最終停在哪一個切片執行任務
    const handleDragEnd = async () => {
      // 只要 index 不是預設的 -1 並且選項在這個當下真實存在
      if (activeIndex !== -1 && activeMenuItems[activeIndex]) {
        // 從算出來的動態選項名單拿出這個動作
        const action = activeMenuItems[activeIndex];
        switch (action.id) {
          case "search":
            // 【傳遞搜尋】丟給 Background 去負責開新分頁 Google
            browser.runtime.sendMessage({
              type: "QUICK_SEARCH",
              payload: selectedText,
            });
            break;
          case "copy":
            // 【系統剪貼簿】
            navigator.clipboard.writeText(selectedText);
            console.log("已複製內容！");
            break;
          case "translate":
            // 【發送翻譯】因為牽涉到 API，先假裝顯示 loading 浮窗

            setPeekState({
              isVisible: true,
              text: "翻譯中..",
              position: { top: position.top, left: position.left },
              mode: "translate",
            });
            try {
              const response = await browser.runtime.sendMessage({
                type: "TRANSLATE",
                payload: selectedText,
              });
              if (response && response.translatedText) {
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
              console.error("發送翻譯請求失敗", err);
              setPeekState({
                isVisible: true,
                text: "錯誤: 翻譯請求失敗",
                position: { top: position.top, left: position.left },
                mode: "translate",
              });
            }
            break;
          case "peek":
            setPeekState({
              isVisible: true,
              text: selectedText,
              position: { top: position.top, left: position.left },
              mode: "summary",
            });
            break;
          default:
            console.log("Copied to clipboard");
            break;
        }
      }
      setIsVisible(false);
      setActiveIndex(-1);
    };
    document.addEventListener("drag", handleDrag);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("mousedown", () => setIsVisible(false));
    return () => {
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("mousedown", () => setIsVisible(false));
    };
  }, [isVisible, position, activeIndex, selectedText, activeMenuItems]);
  const closePeek = () =>
    setPeekState((prev) => ({ ...prev, isVisible: false }));
  return {
    isVisible,
    position,
    activeIndex,
    peekState,
    closePeek,
    activeMenuItems,
  };
};
