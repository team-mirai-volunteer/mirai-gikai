import { useEffect, useState } from "react";

/**
 * visualViewportの高さを監視するカスタムフック
 * スマホのキーボード表示時などに viewport の高さが変わることを検知する
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const handleResize = () => {
      if (!window.visualViewport) return;
      setViewportHeight(window.visualViewport.height);
    };

    // 初期値を設定
    handleResize();

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  return viewportHeight;
}
