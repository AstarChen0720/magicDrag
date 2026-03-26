//其實可以直接這樣放 entrypoints/content.tsx
//但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案
//他要求你要把所有內容都放在 defineContentScript 裡面，當作component 來讀

export default defineContentScript({
  matches: ["<all_urls>"], //適用於哪些網站，這裡先設定為全部網站
  //主要程式區
  main() {
    console.log("Hello content.");

    // 簡單測試：點擊網頁任何地方，印出訊息
    window.addEventListener("click", () => {
      console.log("🖱️ 施工員偵測到點擊，工地運作正常！");
    });
  },
});
