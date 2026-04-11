//負責定義選單的參數與選項內容，讓其他模組可以統一引用

// 定義選單選項的型別
export interface MenuItems {
  id: string;
  label: string;
  color: string;
  activeColor: string;
}

//選單控制參數
export const MENU_CONFIG = {
  radius: 80, // 按鈕離圓心的距離 (像素)
  deadZone: 30, // 盲區：滑鼠離圓心太近時不觸發任何按鈕
  sensitivity: 120, // 感應範圍：滑鼠離圓心太遠也會失效
};

// --- 定義功能選單物件 ---
export const MENU_ITEMS: MenuItems[] = [
  {
    id: "search",
    label: "快速查詢",
    color: "bg-orange-500",
    activeColor: "bg-orange-600",
  },
  {
    id: "copy",
    label: "複製文字",
    color: "bg-green-500",
    activeColor: "bg-green-700",
  },
  {
    id: "translate",
    label: "翻譯",
    color: "bg-purple-500",
    activeColor: "bg-purple-700",
  },
];
