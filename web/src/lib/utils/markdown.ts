import type { Element, ElementContent, Root } from "hast";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * h2要素とその後続要素をsectionで囲むrehypeプラグイン
 */
function rehypeWrapSections() {
  return (tree: Root) => {
    let currentSection: Element | null = null;

    // 既存の子要素を一時的に保存
    const originalChildren = [...tree.children];
    tree.children = [];

    for (const child of originalChildren) {
      if (child.type === "element" && child.tagName === "h2") {
        // 既存のsectionを完了
        if (currentSection && currentSection.children.length > 0) {
          tree.children.push(currentSection);
        }

        // h2をそのまま追加
        tree.children.push(child);

        // 新しい空のsectionを開始
        currentSection = {
          type: "element",
          tagName: "section",
          properties: {},
          children: [],
        };
      } else if (currentSection && child.type === "element") {
        // 現在のsectionに追加（element型のみ）
        currentSection.children.push(child as ElementContent);
      } else {
        // h2より前の要素はそのまま追加
        tree.children.push(child);
      }
    }

    // 最後のsectionを追加（中身がある場合のみ）
    if (currentSection && currentSection.children.length > 0) {
      tree.children.push(currentSection);
    }
  };
}

/**
 * MarkdownをHTMLに変換するプロセッサー
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeWrapSections)
  .use(rehypeSanitize)
  .use(rehypeStringify);

/**
 * MarkdownテキストをHTMLに変換
 * @param markdown - Markdown形式のテキスト
 * @returns HTML文字列
 */
export async function parseMarkdown(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return result.toString();
}
