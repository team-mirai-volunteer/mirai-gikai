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
