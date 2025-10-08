import Link from "next/link";

const LINKS = [
  { href: "https://team-mirai.jp", label: "チームみらいについて" },
  { href: "https://team-mirai.jp/terms", label: "利用規約" },
  { href: "https://team-mirai.jp/privacy", label: "プライバシーポリシー" },
  { href: "https://team-mirai.jp/faq", label: "よくあるご質問" },
];

export function Footer() {
  return (
    <div className="hidden 2xl:flex fixed bottom-6 left-6 z-30 max-w-[260px] flex-col gap-4 text-sm text-gray-800">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Team Mirai
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          テクノロジーで政治の課題を解決することを目指すチームみらいが運営しています。
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="text-xs text-gray-500">© 2025 Team Mirai</p>
    </div>
  );
}
