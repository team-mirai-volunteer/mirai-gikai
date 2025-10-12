import { formatDateWithDots } from "@/lib/utils/date";
import type { DietSession } from "../types";

type CurrentDietSessionProps = {
  session: DietSession | null;
};

export function CurrentDietSession({ session }: CurrentDietSessionProps) {
  if (!session) {
    return null;
  }

  return (
    <div className="w-full bg-[#EAE6DD] px-6 py-6">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-xl font-bold text-gray-800 leading-[0.9] flex-1">
            本日の国会
          </h2>
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-[50px] bg-gradient-to-br from-[#BCECD3] to-[#64D8C6] shrink-0">
            <span className="text-base font-bold leading-[1.48]">会期中</span>
          </div>
        </div>
        <div className="text-sm leading-[1.5] shrink-0">
          <div>{session.name}</div>
          <div>{formatDateWithDots(session.start_date)}〜</div>
        </div>
      </div>
    </div>
  );
}
