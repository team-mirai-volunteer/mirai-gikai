import { describe, expect, it } from "vitest";
import { parseMarkdownSections } from "./index";

describe("parseMarkdownSections", () => {
  describe("セクション分割", () => {
    it("h2セクションごとに分割してHTML配列を返す", async () => {
      const markdown = `
## セクション1

内容1

## セクション2

内容2

## セクション3

内容3
`;

      const htmlSections = await parseMarkdownSections(markdown);

      expect(htmlSections).toHaveLength(3);
      expect(htmlSections[0]).toContain("<h2>セクション1</h2>");
      expect(htmlSections[0]).toContain("内容1");
      expect(htmlSections[1]).toContain("<h2>セクション2</h2>");
      expect(htmlSections[1]).toContain("内容2");
      expect(htmlSections[2]).toContain("<h2>セクション3</h2>");
      expect(htmlSections[2]).toContain("内容3");
    });

    it("コードブロック内の##は分割しない", async () => {
      const markdown = `
## セクション1

\`\`\`
## これはコード
\`\`\`

## セクション2
`;

      const htmlSections = await parseMarkdownSections(markdown);

      expect(htmlSections).toHaveLength(2);
      expect(htmlSections[0]).toContain("<h2>セクション1</h2>");
      expect(htmlSections[0]).toContain("## これはコード");
      expect(htmlSections[1]).toContain("<h2>セクション2</h2>");
    });

    it("h2より前のコンテンツも含める", async () => {
      const markdown = `
前書き

## セクション1

内容1
`;

      const htmlSections = await parseMarkdownSections(markdown);

      expect(htmlSections).toHaveLength(2);
      expect(htmlSections[0]).toContain("前書き");
      expect(htmlSections[1]).toContain("<h2>セクション1</h2>");
    });
  });

  describe("rehypeプラグイン統合", () => {
    it("section wrappingが適用される", async () => {
      const markdown = `
## セクション1

### サブセクション

内容
`;

      const htmlSections = await parseMarkdownSections(markdown);

      expect(htmlSections[0]).toContain("<section>");
      expect(htmlSections[0]).toContain("<h3>サブセクション</h3>");
    });

    it("YouTube動画が埋め込まれる", async () => {
      const markdown = `
## Test Video

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Some text after the video.
`;

      const htmlSections = await parseMarkdownSections(markdown);
      const result = htmlSections.join("");

      // YouTube URLがiframeに変換されていることを確認
      expect(result).toContain("<iframe");
      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"'
      );
      expect(result).toContain('class="youtube-embed"');
    });

    it("セクションとYouTube動画が両方機能する", async () => {
      const markdown = `
## Section 1

https://www.youtube.com/watch?v=test123

## Section 2

Some content here.
`;

      const htmlSections = await parseMarkdownSections(markdown);

      // セクション分割の確認
      expect(htmlSections).toHaveLength(2);

      // 各セクションにsectionタグとYouTube埋め込みが含まれることを確認
      expect(htmlSections[0]).toContain("<section>");
      expect(htmlSections[0]).toContain("<iframe");
      expect(htmlSections[0]).toContain(
        'src="https://www.youtube.com/embed/test123"'
      );
      expect(htmlSections[1]).toContain("<section>");
    });
  });

  describe("セキュリティ", () => {
    it("悪意のあるiframe要素を除去する", async () => {
      const markdown = `
## Safe Section

<iframe src="https://malicious.com/evil" onload="alert('XSS')"></iframe>

https://www.youtube.com/watch?v=safe123
`;

      const htmlSections = await parseMarkdownSections(markdown);
      const result = htmlSections.join("");

      // 悪意のあるiframeは削除され、YouTube埋め込みだけが残ることを確認
      expect(result).not.toContain("malicious.com");
      expect(result).not.toContain("onload");
      expect(result).toContain('src="https://www.youtube.com/embed/safe123"');
    });
  });
});
