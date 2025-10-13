import Link from "next/link";
import { EXTERNAL_LINKS } from "@/config/external-links";

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

const links: FooterLinkItem[] = [
  {
    label: "チームみらいについて",
    href: EXTERNAL_LINKS.TEAM_MIRAI_ABOUT,
    external: true,
  },
  {
    label: "利用規約",
    href: EXTERNAL_LINKS.TERMS,
    external: false,
  },
  {
    label: "プライバシーポリシー",
    href: EXTERNAL_LINKS.PRIVACY,
    external: false,
  },
  {
    label: "よくあるご質問",
    href: EXTERNAL_LINKS.FAQ,
    external: true,
  },
];

/**
 * デスクトップメニュー: フッターリンク（サイドバー内）
 */
export function DesktopMenuLinks() {
  return (
    <div className="flex flex-col gap-1.5">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noreferrer" : undefined}
          className="font-medium text-xs transition-opacity hover:opacity-70"
          style={{
            lineHeight: "1.48em",
          }}
        >
          {link.label}
        </Link>
      ))}
      <p
        className="font-medium text-xs"
        style={{
          lineHeight: "1.48em",
        }}
      >
        © 2025 Team Mirai
      </p>
    </div>
  );
}
