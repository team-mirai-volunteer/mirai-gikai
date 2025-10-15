# Gemini 

## 要件定義、実装計画のルール

要件定義や実装計画を依頼された場合は、最初に論点を洗い出して、ユーザーに質問をしながら論点をクリアにしてください。
論点がクリアになったら、マークダウンでドキュメントを作成すること。

## ドキュメント管理ルール

設計作業などのドキュメント作成を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## Next.js アーキテクチャ

Next.js では Bulletproof React の feature ベースアーキテクチャを採用しています。

### 基本原則

- feature ベースのディレクトリ構成
- barrel export は禁止（export 用の index.ts を作らない）
- Server Components を優先して使用
- 必要な場合のみ Client Components を使用

### features ディレクトリ構造

各 feature は以下の構造に従います：

```
src/features/{feature-name}/
├── components/           # コンポーネント
│   └── {component-name}.tsx
├── actions/             # Server Actions
│   └── {action-name}.ts
├── api/                 # データ取得関数（Server Components用）
│   └── {api-name}.ts
└── types/              # 型定義
    └── index.ts
```

### 命名規則

- ファイル名：ケバブケース（`bill-list.tsx`）
- コンポーネント名：パスカルケース（`BillList`）
- 関数名：キャメルケース（`getBills`）

### コンポーネント分類

- **Server Components**: デフォルト（async 可能、データ取得可能）
- **Client Components**: `"use client"` ディレクティブ付き（インタラクション、状態管理）
