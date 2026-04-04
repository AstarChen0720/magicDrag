//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

// "@/"意思是專案根目錄:告訴主任,從專案的大門口 (根目錄) 出發，進入 assets 找 main.css
import "@/assets/main.css";
import { useState ,useEffect} from "react";
import { createRoot } from "react-dom/client";

// 定義選單選項的型別
interface MenuItem {
  id: string;
  label: string;
  color: string;
}

const RADIUS = 80; // 按鈕離圓心的距離 (像素)
const DEAD_ZONE = 30;   // 盲區：滑鼠離圓心太近時不觸發任何按鈕
const SENSITIVITY = 120; // 感應範圍：滑鼠離圓心太遠也會失效

// --- 常數定義 ---
const MENU_ITEMS = [
  { id: "search", label: "快速查詢", color: "bg-orange-500", activeColor: "bg-orange-600" },
  { id: "copy", label: "複製文字", color: "bg-green-500", activeColor: "bg-green-700" },
  { id: "translate", label: "翻譯", color: "bg-purple-500", activeColor: "bg-purple-700" },
];



// 1️⃣ 建立一個 React 元件 
const MagicDragApp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  // 3️⃣ 新增：記錄當前被選中的按鈕索引 (-1 代表沒選中)
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    // 核心邏輯：計算滑鼠位置與圓心的關係
    const handleDrag = (e: DragEvent) => {
      if (!isVisible) return;

      // 1. 計算滑鼠相對於圓心的偏移量
      const dx = e.clientX - position.left;
      const dy = e.clientY - position.top;

      // 2. 勾股定理算距離： d = sqrt(dx² + dy²)
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 3. 判斷是否在「感應區」內
      if (distance > DEAD_ZONE && distance < SENSITIVITY) {
        // 4. 使用 atan2 算角度，並轉成 0~360 度
        // atan2 回傳的是弧度，我們轉成角度後，修正 -90 度的偏移
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = (angle + 90 + 360) % 360; // 讓 0 度落在正上方

        // 5. 根據角度判斷屬於哪一個「披薩切片」
        const sectionAngle = 360 / MENU_ITEMS.length;
        const index =
          Math.floor((angle + sectionAngle / 2) / sectionAngle) %
          MENU_ITEMS.length;

        setActiveIndex(index);
      } else {
        setActiveIndex(-1); // 在盲區或太遠，不選取
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        setSelectedText(selection);
        setIsVisible(true);
        setPosition({ top: e.clientY, left: e.clientX });
      }
    };

    const handleDragEnd = () => {
      // 這裡就是觸發動作的地方！
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

    // 監聽 drag 事件來持續追蹤滑鼠位置
    document.addEventListener("drag", handleDrag);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("mousedown", () => setIsVisible(false));

    return () => {
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [isVisible, position, activeIndex, selectedText]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ top: position.top, left: position.left }}
    >
      {/* 圓心 */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-2 ${activeIndex !== -1 ? "border-orange-500 scale-110" : "border-blue-500"} rounded-full flex items-center justify-center shadow-lg z-10 transition-all`}
      >
        <span className="text-[10px] font-bold text-gray-700 text-center px-1">
          {activeIndex !== -1 ? "放開執行" : "請選擇"}
        </span>
      </div>

      {/* 衛星按鈕 */}
      {MENU_ITEMS.map((item, index) => {
        const angle =
          (index * (360 / MENU_ITEMS.length) - 90) * (Math.PI / 180);
        const x = RADIUS * Math.cos(angle);
        const y = RADIUS * Math.sin(angle);
        const isActive = activeIndex === index;

        return (
          <div
            key={item.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${isActive ? item.activeColor + " scale-125 shadow-orange-200" : item.color} text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-[10px] font-bold transition-all duration-200`}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

// --- 3. WXT 主任的計畫書 ---
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