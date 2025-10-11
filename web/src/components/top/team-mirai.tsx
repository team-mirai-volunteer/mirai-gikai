import Image from "next/image";
import { Container } from "@/components/layouts/container";

const SNS_LINKS = [
  {
    name: "YouTube",
    url: "https://youtube.com/channel/UC72A_x2FKHkJ8Nc2eIzqj8Q?si=vfLWFp0hyzEqlzTu",
    icon: "/icons/sns/icon_youtube.png",
    hasBorder: false,
  },
  {
    name: "X",
    url: "https://x.com/team_mirai_jp",
    icon: "/icons/sns/icon_x.png",
    hasBorder: false,
  },
  {
    name: "LINE",
    url: "https://lin.ee/aVvgk9jN",
    icon: "/icons/sns/icon_line.png",
    hasBorder: false,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/team_mirai_jp/",
    icon: "/icons/sns/icon_instagram.png",
    hasBorder: true,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/teammirai.official",
    icon: "/icons/sns/icon_facebook.png",
    hasBorder: false,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@annotakahiro2024",
    icon: "/icons/sns/icon_tiktok.png",
    hasBorder: true,
  },
] as const;

export function TeamMirai() {
  return (
    <div className="py-8">
      <Container>
        <div className="flex flex-col gap-6">
          {/* ヘッダー */}
          <div className="flex flex-col gap-4">
            <h2>
              <Image
                src="/icons/team-mirai-typography.svg"
                alt="Team Mirai"
                width={263}
                height={39}
                priority
              />
            </h2>
            <p className="text-sm font-bold text-primary-accent">
              チームみらいについて
            </p>
          </div>

          {/* コンテンツ */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[15px] leading-[28px] text-black">
                参議院議員・AIエンジニアの安野たかひろが立ち上げた政党です。テクノロジーで政治の課題を解決することを目指しています。
              </p>
            </div>

            {/* ボタングループ */}
            <div className="flex flex-col gap-4">
              <a
                href="https://team-mir.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-black rounded-full hover:bg-gray-50 transition-colors w-fit"
              >
                <Image
                  src="/icons/info-icon.svg"
                  alt=""
                  width={23}
                  height={22}
                  className="flex-shrink-0"
                />
                <span className="text-[15px] font-bold leading-[28px]">
                  チームみらいについて詳しく
                </span>
                <Image
                  src="/icons/arrow-right.svg"
                  alt=""
                  width={16}
                  height={15}
                  className="flex-shrink-0"
                />
              </a>

              <a
                href="https://team-mir.ai/#donation"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-black rounded-full hover:bg-gray-50 transition-colors w-fit"
              >
                <Image
                  src="/icons/heart-icon.svg"
                  alt=""
                  width={18}
                  height={17}
                  className="flex-shrink-0"
                />
                <span className="text-[15px] font-bold leading-[28px]">
                  寄附で応援する
                </span>
                <Image
                  src="/icons/arrow-right.svg"
                  alt=""
                  width={16}
                  height={15}
                  className="flex-shrink-0"
                />
              </a>
            </div>

            {/* SNSアイコン */}
            <div className="flex flex-wrap gap-3 items-end">
              {SNS_LINKS.map((sns) => (
                <a
                  key={sns.name}
                  href={sns.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <Image
                    src={sns.icon}
                    alt={sns.name}
                    width={48}
                    height={48}
                    className={
                      sns.hasBorder
                        ? "rounded-full border border-[#B1B1B1]"
                        : ""
                    }
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
