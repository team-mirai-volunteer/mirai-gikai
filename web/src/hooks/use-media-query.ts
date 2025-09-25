import { useEffect, useState } from "react";

/**
 * メディアクエリの状態を監視するカスタムフック
 * @param query - メディアクエリ文字列
 * @returns メディアクエリがマッチするかどうかの真偽値
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // 初期値を設定
    setMatches(media.matches);

    // イベントリスナーを設定
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
