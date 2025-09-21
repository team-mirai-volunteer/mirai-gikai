import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./index";

describe("parseMarkdown", () => {
  it("should properly embed YouTube videos after sanitization", async () => {
    const markdown = `# Test Video

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Some text after the video.`;

    const result = await parseMarkdown(markdown);

    // YouTube URLがiframeに変換されていることを確認
    expect(result).toContain("<iframe");
    expect(result).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    expect(result).toContain('class="youtube-embed"');
  });

  it("should handle sections and YouTube videos together", async () => {
    const markdown = `# Title

## Section 1

https://www.youtube.com/watch?v=test123

## Section 2

Some content here.`;

    const result = await parseMarkdown(markdown);

    // セクションとYouTube埋め込みの両方が機能することを確認
    expect(result).toContain("<section>");
    expect(result).toContain("<iframe");
    expect(result).toContain('src="https://www.youtube.com/embed/test123"');
  });

  it("should not allow malicious iframe elements", async () => {
    const markdown = `<iframe src="https://malicious.com/evil" onload="alert('XSS')"></iframe>

https://www.youtube.com/watch?v=safe123`;

    const result = await parseMarkdown(markdown);

    // 悪意のあるiframeは削除され、YouTube埋め込みだけが残ることを確認
    expect(result).not.toContain("malicious.com");
    expect(result).not.toContain("onload");
    expect(result).toContain('src="https://www.youtube.com/embed/safe123"');
  });
});
