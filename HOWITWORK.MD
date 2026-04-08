最底層的 defineContentScript 要求把某個東西畫出來（root.render(<MagicDragApp />)）。
它去找 <MagicDragApp /> 討畫面，MagicDragApp 說：「我沒有自己畫畫面喔，我只是去 useDragMenu() 拿了三個變數，然後把它們丟給 <PieMenu />，請把 <PieMenu /> 回傳的東西當成我的回傳值」。
接著 <PieMenu /> 收到變數後，把真正的 <div> 標籤（圓盤、按鈕等 UI）畫出來並回傳。
最後，這些 <div> 標籤就透過 MagicDragApp 的轉手，成功交給 defineContentScript 渲染到網頁上了。