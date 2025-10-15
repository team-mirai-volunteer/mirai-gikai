import { Card, CardContent } from "../ui/card";

export function ComingSoonSection() {
  return (
    <section className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-bold text-black leading-[1.48]">
          法案は今後追加されていきます
        </h2>
        <p className="text-xs  text-[#404040]">
          国会に提出され次第、順次更新されます
        </p>
      </div>

      {/* Coming soonエリア */}
      {/* <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-32"> */}
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <p className="text-2xl font-bold text-gray-300">Coming soon</p>
        </CardContent>
      </Card>
      {/* </div> */}
    </section>
  );
}
