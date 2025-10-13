import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeInjectElement } from "./rehype-inject-element";

describe("rehypeInjectElement", () => {
  it("should inject custom element before the specified H2", async () => {
    const markdown = `# Title

## First Section

Content 1

## Second Section

Content 2

## Third Section

Content 3`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 2,
            tagName: "CustomElement",
            props: { id: "custom-1" },
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // CustomElementがSecond Sectionの前に挿入されていることを確認
    expect(html).toContain("<CustomElement");
    expect(html).toContain('id="custom-1"');

    // CustomElementの位置を確認
    const customElementIndex = html.indexOf("<CustomElement");
    const secondSectionIndex = html.indexOf("<h2>Second Section</h2>");
    expect(customElementIndex).toBeLessThan(secondSectionIndex);

    // First Sectionの後にあることを確認
    const firstSectionIndex = html.indexOf("<h2>First Section</h2>");
    expect(customElementIndex).toBeGreaterThan(firstSectionIndex);
  });

  it("should inject element before the first H2 when targetH2Index is 1", async () => {
    const markdown = `# Title

## First Section

Content`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 1,
            tagName: "CustomElement",
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // CustomElementがFirst Sectionの前に挿入されていることを確認
    const customElementIndex = html.indexOf("<CustomElement");
    const firstSectionIndex = html.indexOf("<h2>First Section</h2>");
    expect(customElementIndex).toBeLessThan(firstSectionIndex);
  });

  it("should not inject element if targetH2Index exceeds the number of H2 elements", async () => {
    const markdown = `# Title

## Only Section

Content`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 5,
            tagName: "CustomElement",
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // CustomElementが挿入されていないことを確認
    expect(html).not.toContain("<CustomElement");
  });

  it("should inject element with multiple props", async () => {
    const markdown = `## Section 1

## Section 2`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 2,
            tagName: "ComplexElement",
            props: {
              id: "test-id",
              className: "test-class",
              dataValue: 123,
              enabled: true,
            },
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    expect(html).toContain("<ComplexElement");
    expect(html).toContain('id="test-id"');
    expect(html).toContain('class="test-class"');
    expect(html).toContain('data-value="123"');
    expect(html).toContain("enabled");
  });

  it("should inject only once even if called multiple times on same tree", async () => {
    const markdown = `## Section 1

## Section 2

## Section 3`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 2,
            tagName: "OnceElement",
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // OnceElementが1回だけ挿入されていることを確認
    const matches = html.match(/<OnceElement/g);
    expect(matches).toHaveLength(1);
  });

  it("should handle markdown without H2 elements", async () => {
    const markdown = `# Title

Some content without H2.

### H3 Section

More content.`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 1,
            tagName: "CustomElement",
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // H2がないので挿入されないことを確認
    expect(html).not.toContain("<CustomElement");
  });

  it("should inject multiple elements at different positions", async () => {
    const markdown = `## Section 1

Content 1

## Section 2

Content 2

## Section 3

Content 3`;

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInjectElement, {
        injections: [
          {
            targetH2Index: 2,
            tagName: "FirstElement",
          },
          {
            targetH2Index: -1,
            tagName: "LastElement",
          },
        ],
      })
      .use(rehypeStringify)
      .process(markdown);

    const html = String(result);

    // 両方の要素が挿入されていることを確認
    expect(html).toContain("<FirstElement");
    expect(html).toContain("<LastElement");

    // FirstElementがSection 2の前にあることを確認
    const firstElementIndex = html.indexOf("<FirstElement");
    const section2Index = html.indexOf("<h2>Section 2</h2>");
    expect(firstElementIndex).toBeLessThan(section2Index);

    // LastElementがSection 3の前にあることを確認
    const lastElementIndex = html.indexOf("<LastElement");
    const section3Index = html.indexOf("<h2>Section 3</h2>");
    expect(lastElementIndex).toBeLessThan(section3Index);
  });
});
