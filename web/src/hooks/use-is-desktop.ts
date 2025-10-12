import { useEffect, useState } from "react";

/**
 * デスクトップ環境かどうかを判定するカスタムフック
 * タッチデバイスではないかつ画面幅が768px以上の場合をデスクトップとみなす
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      // タッチデバイスでないかをチェック
      const hasNoTouch =
        !("ontouchstart" in window) && !navigator.maxTouchPoints;

      // 画面幅が768px以上（md breakpoint）をチェック
      const isWideScreen = window.matchMedia("(min-width: 768px)").matches;

      setIsDesktop(hasNoTouch && isWideScreen);
    };

    // 初回チェック
    checkIsDesktop();

    // リサイズ時に再チェック
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => checkIsDesktop();

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDesktop;
}
