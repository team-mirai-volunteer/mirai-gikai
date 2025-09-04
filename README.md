# みらい議会

## セットアップ

```bash
# Supabaseの起動
npx supabase start

# SupabaseのDB初期化
npx supabase db reset

# パッケージインストール
pnpm install

# サーバー起動
pnpm -r dev

# サーバー起動時に stream オプションを付けると、各workspaceのログが混ざって表示されます
pnpm -r --stream run dev
```
