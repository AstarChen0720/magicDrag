/**
 * 快速翻譯 API 模組 (MVP 版本)
 * 使用 Google Translate Web API (gtx) 
 * 之後如果要更換為正式 API (例如 OpenAI、DeepL 等)，只需要在這裡替換邏輯即可，外層調用不變。
 */
export async function translateText(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`;
    // 直接使用 fetch 發送 GET 請求到 Google Translate API
    const response = await fetch(url);
    
    //錯誤處理：如果 HTTP 回應狀態不是 200，則拋出錯誤
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 將回傳結果解析為 JSON 格式
    const data = await response.json();
    
    // API 回傳的是一個多層陣列，第一項包含了翻譯結果的各個片段，需要合併起來
    const translatedText = data[0].map((item: any) => item[0]).join('');
    
    return translatedText;
  } catch (error) {
    console.error("翻譯 API 請求失敗:", error);
    return "翻譯失敗，請稍後再試。";
  }
}
