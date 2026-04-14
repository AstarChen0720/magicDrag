import { useEffect, useState, useRef } from "react";
import { useFloating, flip, shift, offset } from "@floating-ui/react";

//規定 PeekWindow 輸入值的型別
interface PeekWindowProps {
  text: string;
  position: { top: number; left: number };
  onClose: () => void;
}

export const PeekWindow = ({ text, position, onClose }: PeekWindowProps) => {
  //會用到的狀態:
  //查詢時顯示的文字
  const [summary, setSummary] = useState<string>("正在為您查詢中...");
  //查詢是否發生錯誤
  const [error, setError] = useState<boolean>(false);

  // 設定 Floating UI
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(10), flip(), shift()],
  });

  // 使用 useRef 儲存虛擬的 Reference 元素，要提供位置給 Floating UI
  const virtualReference = useRef({
    getBoundingClientRect() {
      return {
        top: position.top,
        left: position.left,
        bottom: position.top,
        right: position.left,
        width: 0,
        height: 0,
        x: position.left,
        y: position.top,
      };
    },
  });

  // 每次重繪時告訴 Floating UI 這個虛擬元素的位置,這樣他就會知道要把浮動視窗放在哪裡
  useEffect(() => {
    refs.setReference(virtualReference.current);
  }, [position, refs]);

  // 使用 Tavily API 獲取總結
  useEffect(() => {
    let isMounted = true;
    setSummary("正在為您總結中...");
    setError(false);

    //用Tavily查詢的函數
    const fetchPeekSummary = async (selectedText: string) => {
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key:
              "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", // 暫存測試用
            query: selectedText,
            include_answer: true,
            search_depth: "basic",
            max_results: 3,
          }),
        });

        //根據API回傳的結果，更新 summary 或 error 狀態
        const data = await response.json();
        if (isMounted) {
          if (data.answer) {
            setSummary(data.answer);
          } else {
            setError(true);
            setSummary("抱歉，無法總結這段文字。");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setSummary("發生錯誤，請稍後再試。");
        }
      }
    };

    //啟動查詢,加上判斷避免在 text 是空的時候也去查詢
    if (text) {
      fetchPeekSummary(text);
    }

    return () => {
      isMounted = false;
    };
  }, [text]);

  // 點擊其他地方時關閉 Peek 視窗
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        refs.floating.current &&
        !refs.floating.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs.floating, onClose]);

  //UI
  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        zIndex: 10000,
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm w-80 text-gray-800 pointer-events-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-blue-600">AI 快速預覽</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      <p className={`text-sm leading-relaxed ${error ? "text-red-500" : ""}`}>
        {summary}
      </p>
    </div>
  );
};
