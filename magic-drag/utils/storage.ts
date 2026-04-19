import { storage } from 'wxt/utils/storage';
import { MENU_ITEMS } from '../config/menuConfig';

// 定義我們的設定資料型別
export interface MenuSettings {
  // 紀錄目前被啟用的選單項目 ID 陣列，同時此陣列的順序即代表畫面上顯示的順序
  activeMenuIds: string[];
}

// 預設設定：將所有在設定檔中定義的選單項目 ID 初始為全部顯示，順序為預設順序
export const defaultSettings: MenuSettings = {
  activeMenuIds: MENU_ITEMS.map(item => item.id),
};

/**
 * 建立一個 WXT 自動同步的儲存項目（Storage Item）
 * - 'local:...' 代表存在擴充功能的 chrome.storage.local（僅存於本機不跨裝置同步，速度最快）,key值為 menuSettings
 * - fallback: 當儲存空間尚未有這筆資料時，預設回傳 defaultSettings，避免 null 引發錯誤
 */
export const menuSettingsStorage = storage.defineItem<MenuSettings>(
  'local:menuSettings',
  {
    fallback: defaultSettings,
  }
);