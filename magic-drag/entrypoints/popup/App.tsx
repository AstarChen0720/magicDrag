import { useState, useEffect } from "react";
import { menuSettingsStorage, MenuSettings } from "../../utils/storage";
import { MENU_ITEMS } from "../../config/menuConfig";

function App() {
  // 將設定的狀態存放在 React Component 裡
  const [settings, setSettings] = useState<MenuSettings | null>(null);

  //監聽設定變化：當 menuSettingsStorage 的值改變時，這裡會收到通知並更新 settings 狀態，進而觸發畫面重繪
  useEffect(() => {
    // 首次載入時讀取一次目前的設定值
    menuSettingsStorage.getValue().then((val) => {
      setSettings(val || { activeMenuIds: MENU_ITEMS.map((i) => i.id) });
    });

    // 設定監聽器，如果背景設定被變更會馬上觸發這裡去更新 popup 的畫面
    const unwatch = menuSettingsStorage.watch((newVal) => {
      setSettings(newVal || { activeMenuIds: MENU_ITEMS.map((i) => i.id) });
    });
    // 元件銷毀時取消監聽，避免 memory leak
    return unwatch;
  }, []);

  if (!settings) return <div className="p-4 w-[300px]">載入中...</div>;

  // 定義出有在顯示清單中的項目 ID
  const activeIds = settings.activeMenuIds || MENU_ITEMS.map((i) => i.id);

  // 控制選項是否出現在版面上
  const toggleVisibility = (id: string, isVisible: boolean) => {
    let newIds = [...activeIds];
    if (isVisible) {
      if (!newIds.includes(id)) newIds.push(id);
    } else {
      // 若不想顯示，就把 id 從顯示陣列中濾除
      newIds = newIds.filter((activeId) => activeId !== id);
    }
    // 寫入儲存空間，因為剛剛有寫 useEffect 監聽，所以寫入成功後畫面會自動重繪
    menuSettingsStorage.setValue({ activeMenuIds: newIds });
  };

  // 排序位移函式
  const moveItem = (index: number, direction: "up" | "down") => {
    const newIds = [...activeIds];
    // 如果排在最前面還往上按，或是排在最後面還往下按，就不做處理
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === newIds.length - 1)
    )
      return;

    // 交換相鄰的元素達成排序
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];

    //一樣更新儲存空間裡的設定，觸發畫面重繪
    menuSettingsStorage.setValue({ activeMenuIds: newIds });
  };

  return (
    <div
      className="w-[300px] p-4 text-gray-800 bg-white"
      style={{ fontFamily: "sans-serif" }}
    >
      <h2 className="text-xl font-bold mb-2 pb-2 border-b">選單設定</h2>
      <p className="text-xs text-gray-500 mb-4">
        拖曳排序與開關功能，改變立刻生效。
      </p>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-2 text-gray-700">
          顯示中的選項
        </h3>
        {activeIds.length === 0 && (
          <div className="text-sm text-gray-400">目前沒有開啟的選項</div>
        )}
        <div className="flex flex-col gap-2">
          {activeIds.map((id, index) => {
            const item = MENU_ITEMS.find((mi) => mi.id === id);
            if (!item) return null;
            return (
              <div
                key={id}
                className="flex justify-between items-center p-2 border rounded shadow-sm bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="text-xs text-gray-400 hover:text-black disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === activeIds.length - 1}
                      className="text-xs text-gray-400 hover:text-black disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    onClick={() => toggleVisibility(id, false)}
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    關閉
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {MENU_ITEMS.length > activeIds.length && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-sm mb-2 text-gray-700">
            已關閉的選項
          </h3>
          <div className="flex flex-col gap-2">
            {MENU_ITEMS.filter((item) => !activeIds.includes(item.id)).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 border rounded bg-white shadow-sm opacity-70"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                  <button
                    onClick={() => toggleVisibility(item.id, true)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    開啟
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
