import Image from "next/image";
import { Container } from "@/components/layouts/container";

export function About() {
  return (
    <div className="py-8">
      <Container>
        <div className="flex flex-col gap-4">
          {/* ヘッダー */}
          <div className="flex flex-col gap-4">
            <h2>
              <Image
                src="/icons/about-typography.svg"
                alt="About"
                width={143}
                height={36}
                priority
              />
            </h2>
            <p className="text-sm font-bold text-primary-accent">
              みらい議会とは
            </p>
          </div>

          {/* コンテンツ */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold leading-[43.2px]">
                国会での議論を
                <br />
                できる限りわかりやすく
              </h3>
              <p className="text-[15px] leading-[28px] text-black">
                みらい議会は、国会で今どんな法案が検討されているか、わかりやすく伝えるプラットフォームです。国民の意見を政治に届けることを目指して、継続的にアップデートしていきます。
              </p>
            </div>

            {/* もっと詳しく知るボタン */}
            <a
              href="https://note.com/interests/%E3%83%81%E3%83%BC%E3%83%A0%E3%81%BF%E3%82%89%E3%81%84"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-black rounded-full hover:bg-gray-50 transition-colors w-fit"
            >
              <Image
                src="/icons/note-icon.png"
                alt="note"
                width={25}
                height={25}
                className="flex-shrink-0"
              />
              <span className="text-[15px] font-bold">みらい議会とは</span>
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
