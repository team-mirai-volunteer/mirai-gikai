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
pnpm -r dev

# サーバー起動時に stream オプションを付けると、各workspaceのログが混ざって表示されます
pnpm -r --stream run dev
```
