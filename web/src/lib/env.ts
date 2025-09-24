/**
 * 環境変数の設定
 * アプリケーション全体で使用する環境変数を一元管理
 */

export const env = {
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
  revalidateSecret: process.env.REVALIDATE_SECRET,
} as const;

// 型定義
export type Env = typeof env;
