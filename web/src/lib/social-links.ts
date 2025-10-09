export interface SocialLink {
  name: string;
  url: string;
  iconPath: string;
}

export const SOCIAL_LINKS: Record<string, SocialLink> = {
  line: {
    name: "LINE",
    url: "https://lin.ee/aVvgk9jN",
    iconPath: "/images/sns/icon_line.png",
  },
  youtube: {
    name: "YouTube",
    url: "https://youtube.com/channel/UC72A_x2FKHkJ8Nc2eIzqj8Q?si=vfLWFp0hyzEqlzTu",
    iconPath: "/images/sns/icon_youtube.png",
  },
  x: {
    name: "X",
    url: "https://x.com/team_mirai_jp",
    iconPath: "/images/sns/icon_x.png",
  },
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/annotakahiro2024/",
    iconPath: "/images/sns/icon_instagram.png",
  },
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/teammirai.official",
    iconPath: "/images/sns/icon_facebook.png",
  },
  note: {
    name: "note",
    url: "https://note.com/annotakahiro24",
    iconPath: "/images/sns/icon_note.png",
  },
  tiktok: {
    name: "TikTok",
    url: "https://www.tiktok.com/@annotakahiro2024",
    iconPath: "/images/sns/icon_tiktok.png",
  },
};

export const getSocialLinksArray = (): Array<SocialLink & { key: string }> =>
  Object.entries(SOCIAL_LINKS).map(([key, link]) => ({
    ...link,
    key,
  }));
