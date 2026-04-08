//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

// "@/"意思是專案根目錄:告訴主任,從專案的大門口 (根目錄) 出發，進入 assets 找 main.css
import "@/assets/main.css";
import { useState ,useEffect} from "react";
import { createRoot } from "react-dom/client";

// 定義選單選項的型別
interface MenuItems {
  id: string;
  label: string;
  color: string;
  activeColor: string;
}

// 定義UI接收的參數的型別
interface PieMenuProps {
  isVisible: boolean;
  position: { top: number; left: number };
  activeIndex: number;
  menuItems: MenuItems[];
}

//選單控制參數
const MENU_CONFIG = {
  radius: 80, // 按鈕離圓心的距離 (像素)
  deadZone: 30,   // 盲區：滑鼠離圓心太近時不觸發任何按鈕
  sensitivity: 120, // 感應範圍：滑鼠離圓心太遠也會失效
};

// --- 定義功能選單物件 ---
const MENU_ITEMS: MenuItems[] = [
  { id: "search", label: "快速查詢", color: "bg-orange-500", activeColor: "bg-orange-600" },
  { id: "copy", label: "複製文字", color: "bg-green-500", activeColor: "bg-green-700" },
  { id: "translate", label: "翻譯", color: "bg-purple-500", activeColor: "bg-purple-700" },
];

// --- Custom Hook：處理所有拖曳邏輯 ---
const useDragMenu = () => {
  //會用到的狀態
  //可見性
  const [isVisible, setIsVisible] = useState(false);
  // 圓心位置
  const [position, setPosition] = useState({ top: 0, left: 0 });
  // 選單狀態
  const [selectedText, setSelectedText] = useState("");
  // 哪個按鈕被選取了 (-1 代表沒選)
  const [activeIndex, setActiveIndex] = useState<number>(-1);
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
    const handleDragEnd = () => {
      //如果有觸發按鈕
      if (activeIndex !== -1) {
        const action = MENU_ITEMS[activeIndex];

        // 💡 執行動作：
        // 查尋
        if (action.id === "search") {
          browser.runtime.sendMessage({
            type: "QUICK_SEARCH",
            payload: selectedText,
          });
        } else if (action.id === "copy") {
          // 複製文字
          navigator.clipboard.writeText(selectedText);
          console.log("📋 文字已複製到剪貼簿");
        } else if (action.id === "translate") {
          // 翻譯
          browser.runtime.sendMessage({
            type: "QUICK_SEARCH", // 暫時先用查詢，之後可以改 translate URL
            payload: `${selectedText} 中文翻譯`,
          });
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

  return { isVisible, position, activeIndex };
};

// --- UI 元件：只負責顯示選單 ---
//從傳入的props中解構出需要的參數,並且指定它的型別
const PieMenu = ({ isVisible, position, activeIndex, menuItems }: PieMenuProps) => {
  //選單UI
  if (!isVisible) return null;
  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ top: position.top, left: position.left }}
    >
      {/* 圓心 */}
      <div
        //碰到 active 就換顏色並放大
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-2 ${
          activeIndex !== -1 ? "border-orange-500 scale-110" : "border-blue-500"
        } rounded-full flex items-center justify-center shadow-lg z-10 transition-all`}
      >
        <span className="text-[10px] font-bold text-gray-700 text-center px-1">
          {/* 有無選到顯示不同字 */}
          {activeIndex !== -1 ? "放開執行" : "請選擇"}
        </span>
      </div>

      {/* 衛星按鈕 */}
      {menuItems.map((item, index) => {
        const angle = (index * (360 / menuItems.length) - 90) * (Math.PI / 180);
        const x = MENU_CONFIG.radius * Math.cos(angle);
        const y = MENU_CONFIG.radius * Math.sin(angle);
        //如果有選到就換顏色並放大
        const isActive = activeIndex === index;

        //要顯示的選單按鈕
        return (
          <div
            key={item.id}
            //碰到 active 就換顏色並放大
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${
              isActive ? item.activeColor + " scale-125 shadow-orange-200" : item.color
            } text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-[10px] font-bold transition-all duration-200`}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

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