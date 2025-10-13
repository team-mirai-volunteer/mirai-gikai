import { DesktopMenuDifficultyToggle } from "./difficulty-toggle";
import { DesktopMenuLogo } from "./logo";
import { DesktopMenuRubyToggle } from "./ruby-toggle";
import { DesktopMenuSidebar } from "./sidebar";

/**
 * デスクトップメニュー (画面幅1400px以上で表示)
 *
 * 構成:
 * - ロゴ: 画面左上
 * - 難易度切り替え: 画面右上
 * - ルビ切り替え: 画面右上 (難易度切り替えの下)
 * - サイドバー: 画面左下
 */
export async function DesktopMenu() {
  return (
    <div className="hidden pcl:block">
      <DesktopMenuLogo />
      <DesktopMenuDifficultyToggle />
      <DesktopMenuRubyToggle />
      <DesktopMenuSidebar />
    </div>
  );
}
