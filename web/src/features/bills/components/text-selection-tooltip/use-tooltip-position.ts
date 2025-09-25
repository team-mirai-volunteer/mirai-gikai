import { useEffect, useState } from "react";

interface UseTooltipPositionProps {
  rect: DOMRect | null;
  isVisible: boolean;
  isMobile: boolean;
}

interface Position {
  top: number;
  left: number;
}

// 定数を定義
const TOOLTIP_DIMENSIONS = {
  desktop: { height: 40, width: 104, margin: 4 },
  mobile: { height: 40, width: 180, bottomMargin: 32 },
} as const;

/**
 * Tooltipの位置を計算するカスタムフック
 */
export function useTooltipPosition({
  rect,
  isVisible,
  isMobile,
}: UseTooltipPositionProps): Position {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useEffect(() => {
    if (!rect || !isVisible) return;

    if (isMobile) {
      // モバイルの場合は画面下部に固定
      const { height, width, bottomMargin } = TOOLTIP_DIMENSIONS.mobile;
      const top = window.innerHeight - height - bottomMargin;
      const left = (window.innerWidth - width) / 2;
      setPosition({ top, left });
    } else {
      // デスクトップの場合は選択範囲の上に表示
      const { height, width, margin } = TOOLTIP_DIMENSIONS.desktop;
      const top = rect.top - height - margin;

      // 中央揃えで配置
      let left = rect.left + rect.width / 2 - width / 2;

      // 画面端からはみ出さないよう調整
      const maxLeft = window.innerWidth - width - margin;
      left = Math.max(margin, Math.min(left, maxLeft));

      setPosition({ top, left });
    }
  }, [rect, isVisible, isMobile]);

  return position;
}
