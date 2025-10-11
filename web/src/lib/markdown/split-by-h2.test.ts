import { describe, expect, it } from "vitest";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { splitByH2 } from "./index";

describe("splitByH2", () => {
  it("h2見出しでノード配列を分割する", () => {
    const markdown = `
## セクション1

内容1

## セクション2

内容2
`;
    const mdast = unified().use(remarkParse).parse(markdown);
    const sections = splitByH2(mdast.children);

    expect(sections).toHaveLength(2);
    expect(sections[0].children).toHaveLength(2); // h2 + paragraph
    expect(sections[1].children).toHaveLength(2); // h2 + paragraph
  });

  it("h2より前のコンテンツは最初のセクションに含める", () => {
    const markdown = `
前書き

## セクション1

内容1
`;
    const mdast = unified().use(remarkParse).parse(markdown);
    const sections = splitByH2(mdast.children);

    expect(sections).toHaveLength(2);
    expect(sections[0].children).toHaveLength(1); // paragraph (前書き)
    expect(sections[1].children).toHaveLength(2); // h2 + paragraph
  });

  it("h2がない場合は1つのセクションとして返す", () => {
    const markdown = `
ただのテキスト

別の段落
`;
    const mdast = unified().use(remarkParse).parse(markdown);
    const sections = splitByH2(mdast.children);

    expect(sections).toHaveLength(1);
    expect(sections[0].children).toHaveLength(2); // 2 paragraphs
  });

  it("空のノード配列の場合は空配列を返す", () => {
    const sections = splitByH2([]);

    expect(sections).toHaveLength(0);
  });

  it("h3やh1は分割しない", () => {
    const markdown = `
# h1見出し

## h2見出し1

### h3見出し

## h2見出し2
`;
    const mdast = unified().use(remarkParse).parse(markdown);
    const sections = splitByH2(mdast.children);

    expect(sections).toHaveLength(3);
    expect(sections[0].children).toHaveLength(1); // h1のみ
    expect(sections[1].children).toHaveLength(2); // h2 + h3
    expect(sections[2].children).toHaveLength(1); // h2のみ
  });
});
