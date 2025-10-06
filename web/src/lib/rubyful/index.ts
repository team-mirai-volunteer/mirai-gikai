/**
 * Rubyful V2 Client
 * ふりがな表示を管理するクライアントユーティリティ
 */

class RubyfulClient {
  private isEnabled = false;

  /**
   * Rubyfulを初期化
   */
  init() {
    if (typeof window === "undefined") return;

    // LocalStorageから設定を復元
    const stored = localStorage.getItem("rubyful-enabled");
    this.isEnabled = stored === "true";

    // 初期状態を適用
    if (this.isEnabled) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * ルビを表示
   */
  show() {
    this.isEnabled = true;
    localStorage.setItem("rubyful-enabled", "true");

    // 全てのルビを表示
    document.querySelectorAll(".rubyful-rt").forEach((element) => {
      element.classList.remove("hidden");
    });
  }

  /**
   * ルビを非表示
   */
  hide() {
    this.isEnabled = false;
    localStorage.setItem("rubyful-enabled", "false");

    // 全てのルビを非表示
    document.querySelectorAll(".rubyful-rt").forEach((element) => {
      element.classList.add("hidden");
    });
  }

  /**
   * ルビの表示状態を切り替え
   */
  toggle() {
    if (this.isEnabled) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 現在の表示状態を取得
   */
  getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * LocalStorageから表示状態を取得
   */
  getIsEnabledFromStorage(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("rubyful-enabled");
    return stored === "true";
  }

  /**
   * DOM変更を監視してルビの表示状態を維持
   */
  observeChanges() {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver(() => {
      // 新しく追加されたルビに対して表示状態を適用
      if (this.isEnabled) {
        document
          .querySelectorAll(".rubyful-rt:not(.rubyful-processed)")
          .forEach((element) => {
            element.classList.remove("hidden");
            element.classList.add("rubyful-processed");
          });
      } else {
        document
          .querySelectorAll(".rubyful-rt:not(.rubyful-processed)")
          .forEach((element) => {
            element.classList.add("hidden");
            element.classList.add("rubyful-processed");
          });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// シングルトンインスタンスをexport
export const rubyfulClient = new RubyfulClient();

// 関連コンポーネントもexport
export { RubyfulInitializer } from "./initializer";
export { RubyToggle } from "./ruby-toggle";
