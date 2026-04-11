// --- UI 元件：只負責顯示選單 ---

import { MENU_CONFIG } from "../config/menuConfig";
import type { MenuItems } from "../config/menuConfig";

// 定義UI接收的參數的型別
export interface PieMenuProps {
  isVisible: boolean;
  position: { top: number; left: number };
  activeIndex: number;
  menuItems: MenuItems[];
}

// --- UI 元件：只負責顯示選單 ---
//從傳入的props中解構出需要的參數,並且指定它的型別
export const PieMenu = ({
  isVisible,
  position,
  activeIndex,
  menuItems,
}: PieMenuProps) => {
  //選單UI
  if (!isVisible) return null;

  // 定義甜甜圈（環形）的內外圈半徑
  const radiusOut = MENU_CONFIG.sensitivity; // 外圈直接對齊感應範圍
  const radiusIn = MENU_CONFIG.deadZone; // 內圈切齊盲區中心
  const size = radiusOut * 2; // SVG 的寬高需要是外圈半徑的兩倍,才裝得進去整個圓
  const center = radiusOut;

  // 輔助函式：給定角度（度數）與半徑，算出在 SVG 上的 X, Y 座標
  //你告訴它「右上方 45 度，距離圓心 5 公分」，它就會回傳「(X=120, Y=80)」讓svg知道要在哪落筆。
  const getCoordinatesForAngle = (angle: number, radius: number) => {
    // 減 90 度讓 0 度落在正上方
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad), //加上center是因為我們的SVG座標是從左上角開始算的，而不是從圓心，所以要把計算出來的偏移量加上圓心的座標，才能得到正確的位置
      //都加上正的center,是因為svg的座標系統是以左上角為原點，向右和向下是正方向
      y: center + radius * Math.sin(rad),
    };
  };

  // 輔助函式：得到畫扇形需要的 SVG Path 參數
  //要畫出一個扇形，我們需要知道它的起始角度和結束角度，然後計算出外圈和內圈的起點和終點座標，最後組合成 SVG Path 的指令。
  const getSectorPathCode = (startAngle: number, endAngle: number) => {
    const startOut = getCoordinatesForAngle(startAngle, radiusOut);
    const endOut = getCoordinatesForAngle(endAngle, radiusOut);
    const startIn = getCoordinatesForAngle(startAngle, radiusIn);
    const endIn = getCoordinatesForAngle(endAngle, radiusIn);

    // 如果角度大於 180，要用 large-arc-flag (扇形佔超過一半的圓)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    //輸出svg path的指令，來畫出扇形
    return [
      `M ${startOut.x} ${startOut.y}`, // 移動到外圈起點
      `A ${radiusOut} ${radiusOut} 0 ${largeArcFlag} 1 ${endOut.x} ${endOut.y}`, // 畫外圈弧線到終點
      `L ${endIn.x} ${endIn.y}`, // 畫直線連到內圈終點
      `A ${radiusIn} ${radiusIn} 0 ${largeArcFlag} 0 ${startIn.x} ${startIn.y}`, // 畫內圈弧線回到內圈起點
      "Z", // 閉合形狀
    ].join(" ");
  };

  //輸出扇形選單UI
  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      // 讓選單中心可以對齊滑鼠位置
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
      }}
    >
      {/* svg畫圖 */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 根據 menuItems的數量創建對應扇形 */}
        {menuItems.map((item, index) => {
          const sectionAngle = 360 / menuItems.length;
          // 每個選項的中心角度 ( index = 0 是 0度 正上方 )
          const itemCenterAngle = index * sectionAngle;
          const startAngle = itemCenterAngle - sectionAngle / 2;
          const endAngle = itemCenterAngle + sectionAngle / 2;

          // 判斷是否被選取
          const isActive = activeIndex === index;

          // 計算文字的中心位置：內外徑的正中間
          const textPos = getCoordinatesForAngle(
            itemCenterAngle,
            (radiusOut + radiusIn) / 2,
          );

          return (
            //g是沒有意義的盒子
            <g key={item.id} className="transition-all duration-200">
              {/* 扇形本體 */}
              <path
                //複雜的SVG Path指令，來畫出扇形
                d={getSectorPathCode(startAngle, endAngle)}
                // 這裡模擬你的附圖 (灰色系環形菜單)
                // 當滑鼠碰到時，變成深灰色；平時為淺灰
                fill={isActive ? "#6b7280" : "#9ca3af"}
                stroke="#4b5563" // 扇形的分割線顏色
                strokeWidth="1.5"
                className="transition-colors duration-200"
              />
              {/* 中間的文字 */}
              <text
                x={textPos.x}
                y={textPos.y}
                fill="white"
                fontSize="12"
                fontWeight="normal"
                textAnchor="middle"
                dominantBaseline="central"
                // 讓文字不要阻擋事件 (雖然外層已經有 pointer-events-none 了)
                className="pointer-events-none drop-shadow-md transition-all duration-200"
                style={{
                  transform: `scale(${isActive ? 1.1 : 1})`,
                  transformOrigin: `${textPos.x}px ${textPos.y}px`,
                }}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
