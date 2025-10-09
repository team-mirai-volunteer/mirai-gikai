export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterSocialLink = {
  name: "X" | "Facebook" | "YouTube" | "Instagram" | "LINE" | "note" | "TikTok";
  href: string;
  iconId:
    | "x"
    | "facebook"
    | "youtube"
    | "instagram"
    | "line"
    | "note"
    | "tiktok";
};

export type FooterPolicyLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const primaryLinks: FooterLink[] = [
  {
    label: "TOP",
    href: "/",
  },
  {
    label: "みらい議会とは",
    href: "/about",
  },
  {
    label: "チームみらいについて",
    href: "https://team-mir.ai/about",
    external: true,
  },
  {
    label: "寄附で応援する",
    href: "https://team-mir.ai/support/donation",
    external: true,
  },
];

export const socialLinks: FooterSocialLink[] = [
  {
    name: "note",
    href: "https://note.com/team_mirai",
    iconId: "note",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@team_mirai",
    iconId: "youtube",
  },
  {
    name: "LINE",
    href: "https://line.me/R/ti/p/@team_mirai",
    iconId: "line",
  },
  {
    name: "X",
    href: "https://x.com/team_mirai_jp",
    iconId: "x",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/team_mirai/",
    iconId: "instagram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/teammirai",
    iconId: "facebook",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@team_mirai",
    iconId: "tiktok",
  },
];

export const policyLinks: FooterPolicyLink[] = [
  {
    label: "よくある質問",
    href: "https://team-mir.ai/faq",
    external: true,
  },
  {
    label: "利用規約",
    href: "https://team-mir.ai/terms",
    external: true,
  },
  {
    label: "プライバシーポリシー",
    href: "https://team-mir.ai/privacy",
    external: true,
  },
];
