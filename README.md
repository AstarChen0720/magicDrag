# magicDrag

＃ 建置環境（初始化）
預計要使用的環境跟工具：react+ts+tailwind+wxt(vite的extension特化版)

目前用wxt的快速建置工具，把react wxt引入專案了（專案管理器用npm），
且已經創好content,background的資料夾，並且成功有偵測到程式

下一步引入tailwind再試一下，環境就建置完了

成功引入tailwind,環境建置(初始化)完成,可以來寫程式了



照著gemini的指示新增了選單需要的四個狀態,遇到兩問題
wxt的contentScript的語法?
ts用了一萬年了但還是不會用

260331
先把ts複習了一遍,是看這影片的,作為複習非常好用
https://www.bilibili.com/video/BV1gX4y177Kf?spm_id_from=333.788.videopod.sections&vd_source=262d90e8bd293dbcdd49540ae0db521c

260401初步了解了 wxt的contentScript中對於shadow root的寫法
  遇到了一些問題:
  1. 我對於其他基本工具例如react,vite中的方法不了解,導致理解起來卡卡
     1. 不知道是正常的,但是我應該如何學習?(在要學未知的東西時,如何知道哪裡不理解,且把不理解的補起來):目前想到可以畫關係圖

  2. wxt的文檔是否有缺東西?因為我想翻文檔都找不到對應的,不然就是幾乎沒有解釋東西,還是我不會看而已?:我是不是應該要換一個工具?
     1. wxt是高效率硬核工具,這次已經用了就算了,有問題問ai,以後可以換CRXJS(推薦)或Plasmo 或 Extension.js(文檔齊全新手友善)

目前就是先繼續用,如果真的太卡那就直接寫react的語法就好不要用他提供的方法

目前已經用好三個基本功能1快速查詢2複製3翻譯(目前是用快速查尋做的,因為要自己用popup,先不做)