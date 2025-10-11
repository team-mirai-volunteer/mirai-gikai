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
  const sections: Section[] = [];
  let currentSection: Section = {
    type: "root",
    children: [],
  };

  for (const node of nodes) {
    const mdNode = node as MarkdownNode;
    if (mdNode.type === "heading" && mdNode.depth === 2) {
      // 既存のセクションを保存（空でない場合）
      if (currentSection.children.length > 0) {
        sections.push(currentSection);
      }
      // 新しいセクションを開始（h2を含む）
      currentSection = { type: "root", children: [node] };
    } else {
      // 現在のセクションにノードを追加
      currentSection.children.push(node);
    }
  }

  // 最後のセクションを追加（空でない場合）
  if (currentSection.children.length > 0) {
    sections.push(currentSection);
  }

  return sections;
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
