/**
 * Rubyful LocalStorage utilities
 * ルビ表示設定の永続化を管理
 */

const STORAGE_KEY = "rubyful-enabled";

/**
 * LocalStorageからルビ表示設定を取得
 */
export function getRubyEnabledFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "true";
}

/**
 * LocalStorageにルビ表示設定を保存
 */
export function setRubyEnabledToStorage(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, enabled.toString());
}
