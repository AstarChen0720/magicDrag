//內容全都要放在 defineContentScript 裡面，當作component 來讀
//其實可以直接這樣放 entrypoints/content.tsx，但是我創一個資料夾以後他如果有其他檔案比較不會亂掉，如果放在資料夾下面，他只會讀叫做 index 的檔案


export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
});
