import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { rehypeWrapSections } from "./rehype-wrap-sections";

// テスト用のヘルパー関数：HTMLを正規化して比較しやすくする
function normalizeHTML(html: string): string {
  return html
    .replace(/>\s+</g, "><") // タグ間の空白文字を削除
    .replace(/\s+/g, " ") // 連続する空白文字を1つのスペースに変換
    .trim(); // 先頭と末尾の空白を削除
}

// テスト用のプロセッサー
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeWrapSections)
  .use(rehypeStringify);

describe("rehypeWrapSections", () => {
  it("should wrap content after h2 elements in section tags", async () => {
    const input = `# Title

Some introduction text.

## Section 1

Content for section 1.

## Section 2

Content for section 2.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h1>Title</h1>
<p>Some introduction text.</p>
<h2>Section 1</h2>
<section><p>Content for section 1.</p></section>
<h2>Section 2</h2>
<section><p>Content for section 2.</p></section>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("should not create sections for content before first h2", async () => {
    const input = `# Title

Introduction paragraph.

Regular content without h2.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h1>Title</h1>
<p>Introduction paragraph.</p>
<p>Regular content without h2.</p>`;

    expect(output).toBe(expected);
  });

  it("should handle multiple h2 sections correctly", async () => {
    const input = `## First Section

First content.

## Second Section

Second content.

## Third Section

Third content.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h2>First Section</h2>
<section><p>First content.</p></section>
<h2>Second Section</h2>
<section><p>Second content.</p></section>
<h2>Third Section</h2>
<section><p>Third content.</p></section>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("should handle h2 with no following content", async () => {
    const input = `## Empty Section

## Another Section

Some content here.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h2>Empty Section</h2>
<h2>Another Section</h2>
<section><p>Some content here.</p></section>`;

    expect(output).toBe(expected);
  });

  it("should handle mixed heading levels correctly", async () => {
    const input = `# Main Title

Introduction.

## Section A

Content A.

### Subsection A.1

Subsection content.

## Section B

Content B.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h1>Main Title</h1>
<p>Introduction.</p>
<h2>Section A</h2>
<section><p>Content A.</p>
<h3>Subsection A.1</h3>
<p>Subsection content.</p></section>
<h2>Section B</h2>
<section><p>Content B.</p></section>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("should handle lists and other block elements in sections", async () => {
    const input = `## Section with List

Some text.

- Item 1
- Item 2

More text.`;

    const result = await processor.process(input);
    const output = result.toString();

    const expected = `<h2>Section with List</h2>
<section><p>Some text.</p>
<ul>
<li>Item 1</li>
<li>Item 2</li>
</ul>
<p>More text.</p></section>`;

    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });
});
