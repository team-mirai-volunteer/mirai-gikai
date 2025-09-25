import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * 外部リンクにtarget="_blank"とrel="noopener noreferrer"を追加するrehypeプラグイン
 */
export function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && node.properties?.href) {
        const href = String(node.properties.href);

        // 外部リンクの判定（httpまたはhttpsで始まる）
        if (href.startsWith("http://") || href.startsWith("https://")) {
          // target="_blank"を追加
          node.properties.target = "_blank";

          // セキュリティのためrel属性を追加
          node.properties.rel = "noopener noreferrer";
        }
      }
    });
  };
}
