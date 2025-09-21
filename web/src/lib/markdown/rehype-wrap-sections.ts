import type { Element, ElementContent, Root } from "hast";

/**
 * h2要素とその後続要素をsectionで囲むrehypeプラグイン
 */
export function rehypeWrapSections() {
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