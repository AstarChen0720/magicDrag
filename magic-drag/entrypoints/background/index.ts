import { translateText } from "../../utils/translate";

//內容全都要放在 defineContentScript 裡面，當作component 來讀
//其實可以直接這樣放 entrypoints/content.tsx，但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案

export default defineBackground(() => {
  // 監聽來自現場（Content Script）的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "QUICK_SEARCH": {
        const text = message.payload;
        // 開新分頁進行 Google 查詢
        const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
        browser.tabs.create({ url });
        console.log("✅ 經理已處理查詢：", text);
        break;
      }

      //複製
      case "COPY_TEXT": {
        // 這裡可以處理更複雜的複製邏輯，或是紀錄 log
        console.log("✅ 收到複製請求：", message.payload);
        break;
      }

      //快速翻譯
      case "TRANSLATE": {
        // 非同步調用翻譯 API,然後將結果回傳給 Content Script
        translateText(message.payload).then((translatedText) => {
          sendResponse({ translatedText });
        });

        // 遇到非同步 sendResponse，需要回傳 true，告訴瀏覽器不要立刻關閉 Port
        return true;
      }

      default:
        console.log("⚠️ 未知的處理動作：", message.type);
        break;
    }
  });
});
