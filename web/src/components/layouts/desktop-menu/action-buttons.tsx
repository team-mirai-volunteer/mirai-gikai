import { LinkButton } from "@/components/top/link-button";
import { EXTERNAL_LINKS } from "@/config/external-links";

/**
 * デスクトップメニュー: アクションボタン（サイドバー内）
 */
export function DesktopMenuActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      <LinkButton
        href={EXTERNAL_LINKS.ABOUT_NOTE}
        icon={{
          src: "/icons/note-icon.png",
          alt: "note",
          width: 20,
          height: 20,
        }}
      >
        みらい議会とは
      </LinkButton>

      <LinkButton
        href={EXTERNAL_LINKS.DONATION}
        icon={{
          src: "/icons/heart-icon.svg",
          alt: "寄附",
          width: 20,
          height: 20,
        }}
      >
        寄附で応援する
      </LinkButton>
    </div>
  );
}
