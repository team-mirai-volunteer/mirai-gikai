/**
 * Rubyful V2 Client
 * ふりがな表示を管理するクライアントユーティリティ
 */

import { getRubyEnabledFromStorage, setRubyEnabledToStorage } from "./storage";

// DOM操作用の定数
const SELECTORS = {
  RUBYFUL_RT: ".rubyful-rt",
  RUBYFUL_RT_UNPROCESSED: ".rubyful-rt:not(.rubyful-processed)",
} as const;

const CLASSES = {
  HIDDEN: "hidden",
  RUBYFUL_PROCESSED: "rubyful-processed",
} as const;

class RubyfulClient {
  private isEnabled = false;

  /**
   * ルビ要素の表示状態を更新
   */
  private updateRubyVisibility(visible: boolean): void {
    const action = visible ? "remove" : "add";

    // Rubyful V2で自動生成されたルビ
    document.querySelectorAll(SELECTORS.RUBYFUL_RT).forEach((element) => {
      element.classList[action](CLASSES.HIDDEN);
    });
  }

  /**
   * 新しく追加されたルビ要素を処理
   */
  private processNewRubyElements(): void {
    const action = this.isEnabled ? "remove" : "add";

    document
      .querySelectorAll(SELECTORS.RUBYFUL_RT_UNPROCESSED)
      .forEach((element) => {
        element.classList[action](CLASSES.HIDDEN);
        element.classList.add(CLASSES.RUBYFUL_PROCESSED);
      });
  }

  /**
   * Rubyfulを初期化
   */
  init() {
    if (typeof window === "undefined") return;

    // LocalStorageから設定を復元
    this.isEnabled = getRubyEnabledFromStorage();

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
    setRubyEnabledToStorage(true);
    this.updateRubyVisibility(true);
  }

  /**
   * ルビを非表示
   */
  hide() {
    this.isEnabled = false;
    setRubyEnabledToStorage(false);
    this.updateRubyVisibility(false);
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
    return getRubyEnabledFromStorage();
  }

  /**
   * DOM変更を監視してルビの表示状態を維持
   */
  observeChanges() {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver(() => {
      this.processNewRubyElements();
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
