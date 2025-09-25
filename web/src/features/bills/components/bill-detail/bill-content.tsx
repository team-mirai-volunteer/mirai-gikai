import { parseMarkdown } from "@/lib/markdown";
import type { BillWithContent } from "../../types";

interface BillContentProps {
  bill: BillWithContent;
}

export async function BillContent({ bill }: BillContentProps) {
  const markdownContent = bill.bill_content?.content;

  if (!markdownContent) {
    return null;
  }

  const htmlContent = await parseMarkdown(markdownContent);

  return (
    <div
      className="
            markdown-content max-w-none text-base
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-4
            [&_a]:!text-blue-600 [&_a]:!no-underline
            [&_a:hover]:!text-blue-800 [&_a:hover]:!underline
            [&_a]:transition-colors
            [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300
            [&_blockquote]:pl-4 [&_blockquote]:italic
            [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
            [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded
            [&_section]:bg-white [&_section]:px-4 [&_section]:py-8 [&_section]:rounded-md [&_section]:mb-8
            [&_section]:break-all
            [&_section>*:last-child]:mb-0
            [&_iframe.youtube-embed]:w-full [&_iframe.youtube-embed]:aspect-video [&_iframe.youtube-embed]:mb-4
            [&_iframe.youtube-embed]:rounded-lg [&_iframe.youtube-embed]:shadow-md
          "
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
