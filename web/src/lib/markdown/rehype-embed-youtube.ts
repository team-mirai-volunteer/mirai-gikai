import type { Element, Root } from "hast";

/**
 * YouTube URLからビデオIDを抽出する
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube URLをiframeに変換するrehypeプラグイン
 */
export function rehypeEmbedYouTube() {
  return (tree: Root) => {
    function visit(node: Element, parent?: Element | Root) {
      if (node.type === "element" && node.tagName === "p") {
        // p要素の中のテキストノードをチェック
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.type === "text") {
            const text = child.value;
            const lines = text.split("\n");

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith("https://")) {
                const youtubeId = extractYouTubeId(trimmedLine);
                if (youtubeId) {
                  // YouTube URLを見つけた場合、iframe要素に置き換え
                  const iframe: Element = {
                    type: "element",
                    tagName: "iframe",
                    properties: {
                      src: `https://www.youtube.com/embed/${youtubeId}`,
                      frameborder: "0",
                      allow:
                        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                      allowfullscreen: true,
                      className: ["youtube-embed"],
                    },
                    children: [],
                  };

                  // p要素をiframe要素に置き換え
                  if (parent?.children) {
                    const index = parent.children.indexOf(node);
                    if (index >= 0) {
                      parent.children[index] = iframe;
                    }
                  }
                  return;
                }
              }
            }
          }
        }
      }

      // 子要素を再帰的に処理
      if (node.children) {
        for (const child of node.children) {
          if (child.type === "element") {
            visit(child, node);
          }
        }
      }
    }

    // ルート要素の子要素を処理
    for (const child of tree.children) {
      if (child.type === "element") {
        visit(child, tree);
      }
    }
  };
}
