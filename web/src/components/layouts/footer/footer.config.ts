import type { SocialLink } from "@/lib/social-links";
import { SOCIAL_LINKS } from "@/lib/social-links";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
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

export type FooterSocialLink = {
  key: keyof typeof SOCIAL_LINKS;
} & SocialLink;

export const socialLinks: FooterSocialLink[] = [
  { key: "youtube", ...SOCIAL_LINKS.youtube },
  { key: "x", ...SOCIAL_LINKS.x },
  { key: "line", ...SOCIAL_LINKS.line },
  { key: "instagram", ...SOCIAL_LINKS.instagram },
  { key: "facebook", ...SOCIAL_LINKS.facebook },
  { key: "tiktok", ...SOCIAL_LINKS.tiktok },
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
