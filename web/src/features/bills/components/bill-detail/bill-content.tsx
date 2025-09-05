import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseMarkdown } from "@/lib/utils/markdown";
import type { Bill } from "../../types";

interface BillContentProps {
  bill: Bill;
}

export async function BillContent({ bill }: BillContentProps) {
  if (!bill.body_markdown) {
    return null;
  }

  const htmlContent = await parseMarkdown(bill.body_markdown);

  return (
    <Card>
      <CardHeader>
        <CardTitle>議案内容</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="markdown-content max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-1 [&>a]:text-blue-600 [&>a]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded text-sm"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </CardContent>
    </Card>
  );
}
