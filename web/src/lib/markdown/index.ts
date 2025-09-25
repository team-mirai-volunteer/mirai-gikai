import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeEmbedYouTube } from "./rehype-embed-youtube";
import { rehypeExternalLinks } from "./rehype-external-links";
import { rehypeWrapSections } from "./rehype-wrap-sections";

// rehypeSanitizeのスキーマをカスタマイズ（target="_blank"とrel属性を許可）
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
  },
};

/**
 * MarkdownをHTMLに変換するプロセッサー
 * 注意: rehypeSanitizeの後にカスタムプラグインを配置することで、
 * sanitizeされた安全なコンテンツに対して変換を適用
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeWrapSections)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeExternalLinks)
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
