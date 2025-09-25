import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { rehypeExternalLinks } from "./rehype-external-links";

// テスト用のヘルパー関数：HTMLを正規化して比較しやすくする
function normalizeHTML(html: string): string {
  return html
    .replace(/>\s+</g, "><") // タグ間の空白文字を削除
    .replace(/\s+/g, " ") // 連続する空白文字を1つのスペースに変換
    .trim(); // 先頭と末尾の空白を削除
}

// 外部リンク処理用のテストプロセッサー
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeExternalLinks)
  .use(rehypeStringify);

describe("rehypeExternalLinks", () => {
  it("外部リンクにtarget='_blank'とrel='noopener noreferrer'を追加する", async () => {
    const input = `[External Link](https://example.com)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">External Link</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("httpで始まるリンクも外部リンクとして処理する", async () => {
    const input = `[HTTP Link](http://example.com)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<p><a href="http://example.com" target="_blank" rel="noopener noreferrer">HTTP Link</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("相対パスのリンクは変更しない", async () => {
    const input = `[Internal Link](/about)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<p><a href="/about">Internal Link</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("mailtoリンクは変更しない", async () => {
    const input = `[Email](mailto:test@example.com)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<p><a href="mailto:test@example.com">Email</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("複数のリンクを含むドキュメントを正しく処理する", async () => {
    const input = `[Google](https://google.com) and [Internal](/internal) and [Example](http://example.com)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<p><a href="https://google.com" target="_blank" rel="noopener noreferrer">Google</a> and <a href="/internal">Internal</a> and <a href="http://example.com" target="_blank" rel="noopener noreferrer">Example</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("ネストした要素内のリンクも処理する", async () => {
    const input = `## Section

[Nested Link](https://nested.com)`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h2>Section</h2>
<p><a href="https://nested.com" target="_blank" rel="noopener noreferrer">Nested Link</a></p>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });
});
