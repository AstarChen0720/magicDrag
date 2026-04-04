//內容全都要放在 defineContentScript 裡面，當作component 來讀
//其實可以直接這樣放 entrypoints/content.tsx，但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案


export default defineBackground(() => {
  // 監聽來自現場（Content Script）的消息
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "QUICK_SEARCH") {
      const text = message.payload;
      // 經理拿出權限：開新分頁進行 Google 查詢
      const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;

      browser.tabs.create({ url });
      console.log("✅ 經理已處理查詢：", text);
    }

    if (message.type === "COPY_TEXT") {
      // 這裡可以處理更複雜的複製邏輯，或是紀錄 log
      console.log("✅ 收到複製請求：", message.payload);
    }
  });
});
