import Image from "next/image";
import type { MiraiStance } from "../../types";
import { STANCE_LABELS } from "../../types";

interface MiraiStanceCardProps {
  stance: MiraiStance;
}

export function MiraiStanceCard({ stance }: MiraiStanceCardProps) {
  // スタンスタイプに応じた背景色とボーダー色を設定
  const getStanceStyles = () => {
    switch (stance.type) {
      case "for":
      case "conditional_for":
        return {
          bg: "bg-primary",
          border: "border-primary-accent",
        };
      case "against":
      case "conditional_against":
        return {
          bg: "bg-[#C9272A]",
          border: "border-red-700",
        };
      default:
        return {
          bg: "bg-[#8F8F8F]",
          border: "border-gray-500",
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
                <span className="text-white text-[28px] font-bold">
                  {STANCE_LABELS[stance.type]}
                </span>
              </div>
            </div>

            {/* コメント部分 */}
            {stance.comment && (
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">主なコメント・理由</h3>
                <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                  {stance.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
