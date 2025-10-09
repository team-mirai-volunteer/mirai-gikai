import Image from "next/image";

export const footerIcons = {
  note: () => <IconImage src="/icons/sns/icon_note.png" alt="note" />,
  youtube: () => <IconImage src="/icons/sns/icon_youtube.png" alt="YouTube" />,
  line: () => <IconImage src="/icons/sns/icon_line.png" alt="LINE" />,
  x: () => <IconImage src="/icons/sns/icon_x.png" alt="X" />,
  instagram: () => (
    <IconImage src="/icons/sns/icon_instagram.png" alt="Instagram" />
  ),
  facebook: () => (
    <IconImage src="/icons/sns/icon_facebook.png" alt="Facebook" />
  ),
  tiktok: () => <IconImage src="/icons/sns/icon_tiktok.png" alt="TikTok" />,
} satisfies Record<string, () => JSX.Element>;

export type FooterIconId = keyof typeof footerIcons;

function IconImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image src={src} alt={alt} width={48} height={48} className="h-12 w-12" />
  );
}
