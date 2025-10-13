"use client";

import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "../footer/footer.config";

/**
 * デスクトップメニュー: ソーシャルフォロー（サイドバー内）
 */
export function DesktopMenuSocialFollow() {
  return (
    <div className="flex flex-col gap-3">
      <p
        className="font-bold"
        style={{
          fontSize: "12px",
          lineHeight: "1.48em",
          color: "#8E8E93",
        }}
      >
        チームみらいをフォローする
      </p>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((social) => (
          <Link
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            className="transition-opacity hover:opacity-80"
          >
            <Image
              src={social.iconPath}
              alt={social.name}
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
