// --- UI 元件：Peek 小視窗，在頁面上浮動顯示查詢結果 ---

const PEEK_WINDOW_WIDTH = 480;
const PEEK_WINDOW_HEIGHT = 340;
const PEEK_WINDOW_OFFSET = 20; // 相對於滑鼠的偏移距離
const PEEK_VIEWPORT_PADDING = 16; // 視窗邊界留白
const PEEK_Z_INDEX = 10000;

export interface PeekWindowProps {
  isVisible: boolean;
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
}

export const PeekWindow = ({
  isVisible,
  position,
  query,
  onClose,
}: PeekWindowProps) => {
  if (!isVisible || !query) return null;

  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&kae=d&k1=-1`;

  // 計算視窗位置，讓它出現在滑鼠右下方，並防止超出視窗邊界
  const windowWidth = PEEK_WINDOW_WIDTH;
  const windowHeight = PEEK_WINDOW_HEIGHT;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = position.left + PEEK_WINDOW_OFFSET;
  let top = position.top + PEEK_WINDOW_OFFSET;

  if (left + windowWidth > viewportWidth - PEEK_VIEWPORT_PADDING) {
    left = position.left - windowWidth - PEEK_WINDOW_OFFSET;
  }
  if (top + windowHeight > viewportHeight - PEEK_VIEWPORT_PADDING) {
    top = position.top - windowHeight - PEEK_WINDOW_OFFSET;
  }

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        width: windowWidth,
        height: windowHeight,
        zIndex: PEEK_Z_INDEX,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #3b82f6",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 標題列 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "#3b82f6",
          color: "#fff",
          fontSize: "13px",
          fontFamily: "system-ui, sans-serif",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "380px",
          }}
          title={query}
        >
          🔍 Peek：{query}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            lineHeight: 1,
            cursor: "pointer",
            padding: "0 4px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
          title="關閉"
        >
          ✕
        </button>
      </div>

      {/* 搜尋結果 iframe */}
      <iframe
        src={searchUrl}
        style={{
          flex: 1,
          border: "none",
          width: "100%",
          display: "block",
        }}
        title="Peek 查詢結果"
        sandbox="allow-scripts allow-forms allow-popups"
      />
    </div>
  );
};
