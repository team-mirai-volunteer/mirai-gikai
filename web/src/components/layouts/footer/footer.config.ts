import { EXTERNAL_LINKS } from "@/config/external-links";
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
    href: EXTERNAL_LINKS.ABOUT_NOTE,
    external: true,
  },
  {
    label: "チームみらいについて",
    href: EXTERNAL_LINKS.TEAM_MIRAI_ABOUT,
    external: true,
  },
  {
    label: "寄附で応援する",
    href: EXTERNAL_LINKS.DONATION,
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
    label: "よくあるご質問",
    href: EXTERNAL_LINKS.FAQ,
    external: true,
  },
  {
    label: "利用規約",
    href: "/terms",
  },
  {
    label: "プライバシーポリシー",
    href: "/privacy",
  },
];
