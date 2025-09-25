import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

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
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "p" && parent && typeof index === "number") {
        // p要素の中のテキストノードをチェック
        for (const child of node.children) {
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
                  parent.children[index] = iframe;
                  return;
                }
              }
            }
          }
        }
      }
    });
  };
}
