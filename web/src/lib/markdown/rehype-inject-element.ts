import type { Element, Root } from "hast";
import type { Plugin } from "unified";

export interface RehypeInjectElementOptions {
  /** 挿入対象となるH2のインデックス（1-indexed） */
  targetH2Index: number;
  /** 挿入するカスタムタグ名 */
  tagName: string;
  /** タグに渡すprops */
  props?: Record<string, string | number | boolean | undefined>;
}

/**
 * 指定したn番目のH2要素の直前にカスタム要素を挿入するrehypeプラグイン
 */
export const rehypeInjectElement: Plugin<[RehypeInjectElementOptions], Root> = (
  options
) => {
  const { targetH2Index, tagName, props = {} } = options;

  return (tree: Root) => {
    let h2Count = 0;
    let injected = false;

    // ツリーの子要素を走査
    const newChildren = [];
    for (const child of tree.children) {
      // H2要素を検出
      if (child.type === "element" && child.tagName === "h2") {
        h2Count++;

        // 目標のH2に到達したら、その直前に要素を挿入
        if (h2Count === targetH2Index && !injected) {
          const injectedElement: Element = {
            type: "element",
            tagName,
            properties: props,
            children: [],
          };
          newChildren.push(injectedElement);
          injected = true;
        }
      }

      newChildren.push(child);
    }

    tree.children = newChildren;
  };
};
