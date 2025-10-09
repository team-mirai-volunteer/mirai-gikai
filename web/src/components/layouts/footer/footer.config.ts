export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterSocialLink = {
  name: "X" | "Facebook" | "YouTube" | "Instagram";
  href: string;
  iconId: "x" | "facebook" | "youtube" | "instagram";
};

export type FooterPolicyLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const primaryLinks: FooterLink[] = [
  {
    label: "みらい議会について",
    href: "/about",
  },
  {
    label: "公開中の議案",
    href: "/bills",
  },
  {
    label: "お問い合わせ",
    href: "https://team-mir.ai/contact",
    external: true,
  },
  {
    label: "参加・サポーター募集",
    href: "https://team-mir.ai/support",
    external: true,
  },
];

export const socialLinks: FooterSocialLink[] = [
  {
    name: "X",
    href: "https://x.com/team_mirai_jp",
    iconId: "x",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/teammirai",
    iconId: "facebook",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@team_mirai",
    iconId: "youtube",
  },
];

export const policyLinks: FooterPolicyLink[] = [
  {
    label: "プライバシーポリシー",
    href: "https://team-mir.ai/privacy",
    external: true,
  },
  {
    label: "利用規約",
    href: "https://team-mir.ai/terms",
    external: true,
  },
  {
    label: "特定商取引法に基づく表記",
    href: "https://team-mir.ai/policies/tokutei",
    external: true,
  },
  {
    label: "党員規約",
    href: "https://team-mir.ai/policies/member",
    external: true,
  },
];

