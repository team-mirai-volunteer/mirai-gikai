import type { BillWithContent } from "../../types";

interface LongPressSectionProps {
  bill: BillWithContent;
}

export function LongPressSection({ bill }: LongPressSectionProps) {
  // billは将来的に使用する予定
  void bill;

  return (
    <section className="bg-white px-4 py-8 rounded-md mb-9">
      <p className="text-center leading-relaxed">
        わからない言葉を
        <br />
        長押しで選択すると
        <br />
        AIに質問できます
      </p>
    </section>
  );
}
