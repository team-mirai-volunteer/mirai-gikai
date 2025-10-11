# LongPressSection 実装設計

## 概要

議案詳細ページ（BillContent）のマークダウンコンテンツ内に、長押しでAIに質問できることを説明するインタラクティブなセクション（LongPressSection）を挿入する機能を実装する。

## 要件

### 挿入位置
- 3番目のh2セクションの**直前**に挿入
- 例: h2が4つある場合
  ```
  ## セクション1
  [内容]
  ## セクション2
  [内容]
  ← ここに LongPressSection を挿入
  ## セクション3
  [内容]
  ## セクション4
  [内容]
  ```

### 機能
- 長押しでAIに質問できることをユーザーに説明するUI
- インタラクティブな要素（onClickなどのイベントハンドラー）を持つReactコンポーネント
- billの情報を受け取って表示

### データフロー
- BillContentコンポーネントが持つ`bill`データをLongPressSectionに渡す
- LongPressSectionはbillの情報を使って適切なUI/説明を表示

## 技術的アプローチ

### 現状の課題
現在のBillContentは以下のような実装：

```tsx
export async function BillContent({ bill }: BillContentProps) {
  const htmlContent = await parseMarkdown(markdownContent);

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
```

この方法では：
- ❌ Reactコンポーネントを途中に挟めない
- ❌ イベントハンドラーを追加できない
- ❌ billデータをコンポーネントに渡せない

### 解決策: マークダウンをセクション配列に分割

remarkを使ってマークダウンをh2ごとに分割し、HTML配列として返す機能を実装する。

## 実装ステップ

### 1. remarkでマークダウンをセクションごとに分割する関数を追加

**ファイル**: `web/src/lib/markdown/index.ts`

以下の関数を追加：

```typescript
/**
 * マークダウンをh2セクションごとに分割してHTML配列として返す
 * @param markdown - Markdown形式のテキスト
 * @returns HTML文字列の配列（各h2セクションごと）
 */
export async function parseMarkdownSections(markdown: string): Promise<string[]>
```

#### 処理フロー

1. **remarkParse**: Markdown文字列をMDAST（Markdown AST）に変換
2. **ASTをh2で分割**: heading(depth=2)を検出してセクションごとに分ける
3. **各セクションを処理**: 既存のrehype/remarkパイプラインを通してHTMLに変換
4. **HTML配列を返す**: 各セクションのHTMLを配列として返す

#### 実装のポイント

- remarkの段階で分割することで、コードブロック内の`##`などを誤検出しない
- 既存の`processor`（rehypeプラグイン群）を再利用する
- h2とその後続コンテンツを1つのセクションとして扱う

### 2. BillContentコンポーネントを書き換え

**ファイル**: `web/src/features/bills/components/bill-detail/bill-content.tsx`

#### 変更前（現在）
```tsx
export async function BillContent({ bill }: BillContentProps) {
  const htmlContent = await parseMarkdown(markdownContent);

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
```

#### 変更後
```tsx
import { parseMarkdownSections } from "@/lib/markdown";
import { LongPressSection } from "./long-press-section";

export async function BillContent({ bill }: BillContentProps) {
  const htmlSections = await parseMarkdownSections(markdownContent);

  const beforeSections = htmlSections.slice(0, 2);
  const afterSections = htmlSections.slice(2);

  return (
    <div className="markdown-content ...">
      {beforeSections.map((html, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
      ))}

      <LongPressSection bill={bill} />

      {afterSections.map((html, index) => (
        <div key={index + 2} dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </div>
  );
}
```

### 3. LongPressSectionコンポーネントを作成

**ファイル**: `web/src/features/bills/components/bill-detail/long-press-section.tsx`

```tsx
"use client";

import type { BillWithContent } from "../../types";

interface LongPressSectionProps {
  bill: BillWithContent;
}

export function LongPressSection({ bill }: LongPressSectionProps) {
  const handleLongPress = () => {
    // 長押し時の処理
  };

  return (
    <div
      className="bg-blue-100 p-6 rounded-md mb-9"
      onMouseDown={handleLongPress}
    >
      {/* 長押しでAIに質問できることを説明するUI */}
      <p>議案「{bill.title}」について、長押しでAIに質問できます</p>
    </div>
  );
}
```

## 技術的メリット

### 1. 安全性
- ✅ remarkのASTレベルで分割するため、コードブロックや引用内の`##`を誤検出しない
- ✅ 既存のrehypeSanitizeなどのセキュリティ処理がそのまま適用される

### 2. 保守性
- ✅ 既存のrehypeプラグイン（rehypeWrapSections, rehypeEmbedYouTubeなど）をそのまま使える
- ✅ マークダウン処理ロジックが一箇所に集約される

### 3. 柔軟性
- ✅ 任意の位置にReactコンポーネントを挿入可能
- ✅ イベントハンドラーやClient Component機能が使える
- ✅ billデータをコンポーネントに渡せる

### 4. パフォーマンス
- ✅ BillContentはServer Componentのまま（LongPressSectionのみClient Component）
- ✅ 分割処理はサーバー側で一度だけ実行される

## 既存機能への影響

### rehype-insert-dividers.ts
現在実装されている赤いセクション挿入機能は、LongPressSection実装後は不要になるため削除する。

### rehype-wrap-sections.ts
各セクションが個別に処理されるため、`<section>`ラッピングの挙動が変わる可能性がある。
テストを実行して既存のスタイリングが維持されることを確認する。

## テスト計画

### 1. ユニットテスト
- `parseMarkdownSections`が正しくh2で分割できることを確認
- コードブロック内の`##`で分割されないことを確認
- 空のセクションや、h2がない場合の挙動を確認

### 2. 統合テスト
- LongPressSectionが正しい位置（3番目のh2の前）に表示されることを確認
- billデータが正しく渡されることを確認
- 既存のマークダウンスタイリング（白いセクション、YouTube埋め込みなど）が維持されることを確認

### 3. E2Eテスト
- ブラウザで議案詳細ページを開いてLongPressSectionが表示されることを確認
- 長押しインタラクションが動作することを確認

## 実装順序

1. ✅ `parseMarkdownSections`関数の実装とテスト
2. ✅ `BillContent`コンポーネントの書き換え
3. ✅ `LongPressSection`コンポーネントの作成（モックUI）
4. ✅ 既存テストの修正・追加
5. ✅ ブラウザでの動作確認
6. ✅ `rehype-insert-dividers`の削除
7. ✅ LongPressSectionの本実装（UI/UX詳細）

## 注意点

- h2が3つ未満の議案の場合、LongPressSectionが表示されない（`index === 2`の条件に該当しない）
  - 必要であれば、最小セクション数のチェックやフォールバック処理を追加
- 分割処理により、既存のCSSセレクター（`[&_section]:...`）の挙動が変わる可能性
  - スタイリングのテストを十分に行う
