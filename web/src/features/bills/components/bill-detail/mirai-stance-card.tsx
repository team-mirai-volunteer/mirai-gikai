import Image from "next/image";
import type { BillStatusEnum, MiraiStance } from "../../types";
import { STANCE_LABELS } from "../../types";

interface MiraiStanceCardProps {
  stance: MiraiStance;
  billStatus?: BillStatusEnum;
}

export function MiraiStanceCard({ stance, billStatus }: MiraiStanceCardProps) {
  // 法案提出前の場合は専用のスタイルを使用
  const isPreparing = billStatus === "preparing";

  // スタンスタイプに応じた背景色とボーダー色を設定
  const getStanceStyles = () => {
    if (isPreparing) {
      return {
        bg: "bg-[#E8E8E8]",
        border: "border-gray-400",
        textColor: "text-black",
        label: "法案提出前",
      };
    }

    switch (stance.type) {
      case "for":
      case "conditional_for":
        return {
          bg: "bg-primary",
          border: "border-primary-accent",
          textColor: "text-white",
          label: STANCE_LABELS[stance.type],
        };
      case "against":
      case "conditional_against":
        return {
          bg: "bg-[#C9272A]",
          border: "border-red-700",
          textColor: "text-white",
          label: STANCE_LABELS[stance.type],
        };
      default:
        return {
          bg: "bg-[#8F8F8F]",
          border: "border-gray-500",
          textColor: "text-white",
          label: STANCE_LABELS[stance.type],
        };
    }
  };

  const styles = getStanceStyles();

  return (
    <>
      <h2 className="text-[22px] font-bold mb-4">🗳️チームみらいの賛否</h2>
      <div className="relative p-1 rounded-lg bg-gradient-to-br from-[#64D8C6] to-[#BCECB3]">
        <div className="bg-white rounded-lg px-6 py-8">
          <div className="flex flex-col gap-8">
            {/* ヘッダー部分：ロゴとスタンスバッジ */}
            <div className="flex flex-col items-center gap-8">
              {/* チームみらいロゴ */}
              <div className="relative w-37 h-31">
                <Image
                  src="/img/logo.svg"
                  alt="チームみらい"
                  fill
                  className="object-contain"
                />
              </div>

              {/* スタンスバッジ */}
              <div
                className={`w-full py-4 ${styles.bg} border ${styles.border} rounded-lg flex justify-center items-center`}
              >
                <span className={`${styles.textColor} text-[28px] font-bold`}>
                  {styles.label}
                </span>
              </div>
            </div>

            {/* コメント部分 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">コメント・理由</h3>
              <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                {isPreparing
                  ? "法案提出後に賛否を表明します。"
                  : stance.comment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
