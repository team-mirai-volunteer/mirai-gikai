import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeEmbedYouTube } from "./rehype-embed-youtube";
import { rehypeWrapSections } from "./rehype-wrap-sections";

/**
 * MarkdownをHTMLに変換するプロセッサー
 * 注意: rehypeSanitizeの後にrehypeEmbedYouTubeを配置することで、
 * sanitizeされた安全なコンテンツに対してYouTube埋め込みを追加
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeWrapSections)
  .use(rehypeSanitize)
  .use(rehypeEmbedYouTube)
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
