export interface SocialLink {
  name: string;
  url: string;
  iconPath: string;
  hasBorder: boolean;
}

export const SOCIAL_LINKS: Record<string, SocialLink> = {
  youtube: {
    name: "YouTube",
    url: "https://youtube.com/channel/UC72A_x2FKHkJ8Nc2eIzqj8Q?si=vfLWFp0hyzEqlzTu",
    iconPath: "/icons/sns/icon_youtube.png",
    hasBorder: false,
  },
  x: {
    name: "X",
    url: "https://x.com/team_mirai_jp",
    iconPath: "/icons/sns/icon_x.png",
    hasBorder: false,
  },
  line: {
    name: "LINE",
    url: "https://lin.ee/aVvgk9jN",
    iconPath: "/icons/sns/icon_line.png",
    hasBorder: false,
  },
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/team_mirai_jp/",
    iconPath: "/icons/sns/icon_instagram.png",
    hasBorder: true,
  },
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/teammirai.official",
    iconPath: "/icons/sns/icon_facebook.png",
    hasBorder: false,
  },
  tiktok: {
    name: "TikTok",
    url: "https://www.tiktok.com/@annotakahiro2024",
    iconPath: "/icons/sns/icon_tiktok.png",
    hasBorder: true,
  },
  note: {
    name: "note",
    url: "https://note.com/annotakahiro24",
    iconPath: "/icons/sns/icon_note.png",
    hasBorder: false,
  },
};

export const getSocialLinksArray = (): Array<SocialLink & { key: string }> =>
  Object.entries(SOCIAL_LINKS).map(([key, link]) => ({
    ...link,
    key,
  }));
