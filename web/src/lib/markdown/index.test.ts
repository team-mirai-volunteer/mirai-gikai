import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { parseMarkdown } from "./index";

describe("parseMarkdown", () => {
  it("should properly embed YouTube videos after sanitization", async () => {
    const markdown = `# Test Video

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Some text after the video.`;

    const result = await parseMarkdown(markdown);
    const html = renderToStaticMarkup(result);

    // YouTube URLがiframeに変換されていることを確認
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain('class="youtube-embed"');
  });

  it("should handle sections and YouTube videos together", async () => {
    const markdown = `# Title

## Section 1

https://www.youtube.com/watch?v=test123

## Section 2

Some content here.`;

    const result = await parseMarkdown(markdown);
    const html = renderToStaticMarkup(result);

    // セクションとYouTube埋め込みの両方が機能することを確認
    expect(html).toContain("<section>");
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.youtube.com/embed/test123"');
  });

  it("should not allow malicious iframe elements", async () => {
    const markdown = `<iframe src="https://malicious.com/evil" onload="alert('XSS')"></iframe>

https://www.youtube.com/watch?v=safe123`;

    const result = await parseMarkdown(markdown);
    const html = renderToStaticMarkup(result);

    // 悪意のあるiframeは削除され、YouTube埋め込みだけが残ることを確認
    expect(html).not.toContain("malicious.com");
    expect(html).not.toContain("onload");
    expect(html).toContain('src="https://www.youtube.com/embed/safe123"');
  });
});
