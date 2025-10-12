import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeEmbedYouTube } from "./rehype-embed-youtube";
import { rehypeExternalLinks } from "./rehype-external-links";
import { rehypeWrapSections } from "./rehype-wrap-sections";

// ============================================================================
// Public API
// ============================================================================

/**
 * マークダウンをh2セクションごとに分割してHTML配列として返す
 * @param markdown - Markdown形式のテキスト
 * @returns HTML文字列の配列（各h2セクションごと）
 */
export async function parseMarkdownSections(
  markdown: string
): Promise<string[]> {
  // remarkでMarkdown ASTに変換
  const mdast = unified().use(remarkParse).parse(markdown);

  // h2で分割してセクションごとのASTを作成
  const sections = splitByH2(mdast.children);

  // 各セクションをHTMLに変換
  const htmlSections = await Promise.all(sections.map(sectionToHtml));

  return htmlSections;
}

/**
 * Markdown ASTをh2見出しで分割してセクション配列を作成
 * @param nodes - Markdown ASTのノード配列
 * @returns セクション配列
 */
export function splitByH2(nodes: unknown[]): Section[] {
  // h2のインデックスを収集
  const h2Indices = nodes
    .map((node, index) => {
      const mdNode = node as MarkdownNode;
      return mdNode.type === "heading" && mdNode.depth === 2 ? index : -1;
    })
    .filter((index) => index !== -1);

  // h2が存在しない場合は全体を1つのセクションとして返す
  if (h2Indices.length === 0) {
    return nodes.length > 0 ? [{ type: "root", children: nodes }] : [];
  }

  // インデックス範囲の配列を構築
  const ranges: Array<{ start: number; end: number | undefined }> = [
    // 最初のh2より前のコンテンツ（存在する場合）
    ...(h2Indices[0] > 0 ? [{ start: 0, end: h2Indices[0] }] : []),
    // 各h2セクション
    ...h2Indices.map((start, i) => ({
      start,
      end: h2Indices[i + 1],
    })),
  ];

  // 範囲に基づいてセクションを生成
  return ranges.map((range) => ({
    type: "root" as const,
    children: nodes.slice(range.start, range.end),
  }));
}

// ============================================================================
// Internal Implementation
// ============================================================================

type MarkdownNode = {
  type: string;
  depth?: number;
  [key: string]: unknown;
};

type Section = { type: "root"; children: Array<unknown> };

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
  .use(remarkBreaks) // 改行を<br>タグに変換
  .use(remarkRehype)
  .use(rehypeWrapSections)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeExternalLinks)
  .use(rehypeEmbedYouTube)
  .use(rehypeStringify);

/**
 * セクション（Markdown AST）をHTMLに変換
 * @param section - Markdown ASTのセクション
 * @returns HTML文字列
 */
async function sectionToHtml(section: Section): Promise<string> {
  // biome-ignore lint/suspicious/noExplicitAny: unifiedの型定義の制約上、anyが必要
  const result = await processor.run(section as any);
  const html = unified().use(rehypeStringify).stringify(result);
  return html;
}
