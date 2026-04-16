Optimizing tool selection...

Searched codebase for "所以現在整體運作邏輯變成監聽滑鼠事件->傳給輔助函數做出要給svg的參數->傳給svg標籤,顯示出圖片跟文字?
請你簡單的幫我整理一下", 9 results

沒錯，你的理解完全正確！整個運作邏輯非常清晰，可以簡單總結成這 **三個階段**：

### 1. 邏輯與狀態層 (監聽滑鼠事件)

- **在哪裡發生**：`useDragMenu` (自訂 Hook)
- **做了什麼**：監聽 `drag` 等滑鼠事件，利用數學（勾股定理、`Math.atan2`）算出滑鼠當下的**位置**與**角度**。
- **產出什麼**：決定現在要不要顯示選單 (`isVisible`)、選單圓心在哪 (`position`)、以及現在滑鼠停在第幾個選項 (`activeIndex`)。

### 2. 計算轉換層 (輔助函數產生參數)

- **在哪裡發生**：`PieMenu` 裡面的 `getCoordinatesForAngle` 與 `getSectorPathCode`。
- **做了什麼**：接收前面的狀態還有選單設定（半徑、角度），把它們轉換成 SVG 可以理解的語言。
- **產出什麼**：計算出每一塊披薩切片的確切座標 (X, Y) 以及複雜的 SVG 繪圖指令（例如 `M...A...L...Z` 這種把點連成面的字串）。

### 3. UI 渲染層 (傳給 SVG 標籤顯示)

- **在哪裡發生**：`PieMenu` 裡面的 `return` 區塊 (`<svg>`)。
- **做了什麼**：利用 `map` 把每一個選單項目 (`menuItems`) 跑一次迴圈。
- **產出什麼**：把算好的指令塞進 `<path>` 畫出扇形，並根據 `activeIndex` 決定誰要變色；把算好的座標塞進 `<text>` 寫上文字。最後完美的圓形選單就出現在螢幕上了！

**總結來說：**
你成功地把「繁瑣的數學與事件監聽」和「最後的畫面呈現」拆開來了。資料從 Hook 流向 UI，UI 再靠輔助函數把資料轉成漂漂亮亮的 SVG 圖片。這在 React 開發中是非常棒的架構！

目前結構:

我已經幫你把程式碼拆分成下面這三個主要的資料夾與檔案了！

現在你的專案根目錄下，多出了 `config`、`hooks` 和 `components` 資料夾，檔案各自的權責變得非常明確：

1. ⚙️ **config/menuConfig.ts**
   裡面存放 `MENU_CONFIG` 距離參數、`MENU_ITEMS` 選單選項，以及 TypeScript 型別。
   _(要加選單按紐、調半徑都在這調)_

2. 🧠 **hooks/useDragMenu.ts**
   這裡存放所有拖曳計算的邏輯 (`useDragMenu` Custom Hook)。
   _(所有角度計算、atan2 和滑鼠事件監聽都在這)_

3. 🎨 **components/PieMenu.tsx**
   存放用來畫 SVG 甜甜圈介面的 `<PieMenu>` 元件。
   _(要改選單顏色、字體大小、UI 樣式都在這改)_

4. 🚀 **entrypoints/content/index.tsx** (已更新)
   這支檔案現在變得很乾淨，只負責一件事：把上面的拆分檔案 `import` 進來，組合起來然後掛載到 WXT 擴充功能裡面。

peek視窗的運作
移過去放開>調用api,同時顯示方框並配上"查詢中">傳回後將文字顯示在框框內>點旁邊收起視窗

### Peek 視窗的實際運作流程：

1. **觸發層 (拖曳並放開)**：
   使用者選取文字 -> 拖曳滑鼠 -> `useDragMenu` 計算到滑鼠停在特定選單（如「快速預覽」或「翻譯」） -> **放開滑鼠 (`dragend`)** -> 觸發 `setPeekState` 讓 `isVisible` 變成 `true`，並傳入對應的 `text` 與 `mode` (模式，例如 `summary` 或 `translate`)。
2. **初始化與載入層 (判斷模式與顯示)**：
   `index.tsx` 發現 `isVisible` 為 `true`，渲染 `<PeekWindow>` -> 內部的 `useEffect` 根據傳入的 `mode` 決定行為：
   - 若為 `summary` (AI總結)：顯示「正在為您總結中...」並自動呼叫 Tavily API。
   - 若為 `translate` (翻譯) 或 `display`：直接顯示傳入的文字內容（利用 React props 更新畫面，不觸發總結 API）。
3. **資料回傳與更新層 (顯示最終結果)**：
   - **若是 AI 總結**：Tavily API 取得結果後，觸發元件內部的 `setSummary` 替換畫面文字。
   - **若是 翻譯功能**：Background 腳本拿到翻譯結果後，更新 `useDragMenu` 中的 `peekState.text`，React 自動將新的翻譯字串同步給 PeekWindow 顯示。
4. **清理層 (點旁邊收起)**：
   使用者點擊 `PeekWindow` 以外的空白處 -> 觸發 `handleClickOutside` 監聽器 -> 呼叫從外面傳進來的 `onClose()` 函式 -> `peekState` 變回 `false`，視窗完全從畫面上消失。

### 快速翻譯運作流程:

1. **觸發層 (選取並放開)**：使用者拖曳到「翻譯」選項放開滑鼠 (`handleDragEnd` 觸發)。
2. **初步顯示 (Loading 狀態)**：`useDragMenu` 呼叫 `setPeekState`，將 `mode` 設為 `"translate"`，並傳入 `"翻譯中..."` 作為文字，讓 `<PeekWindow>` 馬上跳出來顯示等待狀態。
3. **背景通訊 (請求翻譯)**：同時，利用 `browser.runtime.sendMessage` 將選取的文字寄給 Background Script (背景腳本)，請求型別為 `"TRANSLATE"`。
4. **外部 API 調用 (Google API)**：`background/index.ts` 收到請求，呼叫我們抽離出來的 `utils/translate.ts` 工具，這隻工具會透過 `fetch` 打 Google Translate Web API (gtx) 取得中文翻譯。
5. **回傳與更新層 (顯示結果)**：API 吐回結果後，Background Script 將結果回傳給 Content Script。`useDragMenu` 收到後，再次呼叫 `setPeekState`，只不過這次把 `text` 替換成真正的「翻譯結果」。因為 React 的響應式特性，畫面上的「翻譯中...」就會瞬間被置換成中文！