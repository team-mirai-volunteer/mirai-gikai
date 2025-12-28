/**
 * ページレイアウトに関するユーティリティ
 *
 * TOPページと法案詳細ページは「メインページ」として扱い、
 * - DifficultySelectorを表示
 * - チャットサイドバー用のオフセットレイアウトを使用
 */

/** メインページ（TOP、法案詳細）かどうかを判定 */
export function isMainPage(pathname: string): boolean {
  // トップページ
  if (pathname === "/") return true;
  // 法案詳細ページ（/bills/[id]）- サブパスは除外
  if (/^\/bills\/[^/]+$/.test(pathname)) return true;
  return false;
}
