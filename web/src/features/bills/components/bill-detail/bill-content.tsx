import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseMarkdown } from "@/lib/utils/markdown";
import type { BillWithContent } from "../../types";

interface BillContentProps {
  bill: BillWithContent;
}

export async function BillContent({ bill }: BillContentProps) {
  // 新しいbill_contentがあればそれを使用、なければ従来のbody_markdownを使用
  const markdownContent = bill.bill_content?.content || bill.body_markdown;

  if (!markdownContent) {
    return null;
  }

  const htmlContent = await parseMarkdown(markdownContent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>議案内容</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="
            markdown-content max-w-none text-base
            [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2
            [&>p]:mb-4 [&>p]:leading-relaxed
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
            [&>li]:mb-1
            [&_a]:!text-blue-600 [&_a]:!no-underline 
            [&_a:hover]:!text-blue-800 [&_a:hover]:!underline 
            [&_a]:transition-colors
            [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 
            [&>blockquote]:pl-4 [&>blockquote]:italic
            [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto
            [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded
          "
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </CardContent>
    </Card>
  );
}
