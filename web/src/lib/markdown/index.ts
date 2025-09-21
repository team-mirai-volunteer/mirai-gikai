import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeWrapSections } from "./rehype-plugins";

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
