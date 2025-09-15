# みらい議会

## セットアップ

```bash
# Supabaseの起動
npx supabase start

# SupabaseのDB初期化
npx supabase db reset

# 環境変数の設定（必要に応じて.envの内容を変更してください）
cp .env.example .env

# パッケージインストール
pnpm install

# 開発用シードデータのセットアップ
pnpm seed

# サーバー起動
pnpm dev
```

## マイグレーション

```bash
# マイグレーションファイル生成
npx supabase migration new マイグレーション名

# マイグレーション実行 & 型ファイル更新
pnpm supabase:migration
```
