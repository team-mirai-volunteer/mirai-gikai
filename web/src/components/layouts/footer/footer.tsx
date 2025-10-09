"use client";

import Image from "next/image";
import Link from "next/link";
import { footerIcons } from "./footer-icons";
import {
  policyLinks,
  primaryLinks,
  socialLinks,
} from "./footer.config";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#64d8c6] to-[#bcecd3] text-slate-900">
      <div className="mx-auto grid w-full max-w-4xl place-items-center gap-10 px-6 py-14 text-center">
        <FooterLogoSection />
        <FooterNavSection />
        <FooterLegalSection />
        <FooterSocialSection />
        <FooterCopyright />
      </div>
    </footer>
  );
}

function FooterLogoSection() {
  return (
    <div className="flex flex-col items-center text-center">
      <Link href="/" aria-label="みらい議会 トップページ">
        <Image
          src="/img/logo.svg"
          alt="みらい議会"
          width={200}
          height={60}
          className="h-auto w-44"
        />
      </Link>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        市民と議会をつなぐ情報プラットフォーム。
        <br />
        みらい議会は議案をわかりやすく届けます。
      </p>
    </div>
  );
}

function FooterNavSection() {
  return (
    <nav
      aria-label="サービスリンク"
      className="flex flex-col items-center text-sm"
    >
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
        {primaryLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
                className="text-slate-800 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterSocialSection() {
  return (
    <div className="mt-10 flex flex-col items-center">
      <p className="text-sm font-semibold text-slate-800">ソーシャル</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
        {socialLinks.map((social) => {
          const Icon = footerIcons[social.iconId];
          return (
            <li key={social.name}>
              <Link
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FooterLegalSection() {
  return (
    <div className="flex flex-col items-center text-xs text-slate-700">
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {policyLinks.map((policy) => (
          <li key={policy.label}>
            <Link
              href={policy.href}
              target={policy.external ? "_blank" : undefined}
              rel={policy.external ? "noreferrer" : undefined}
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {policy.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterCopyright() {
  return (
    <div className="text-center text-xs text-slate-600">© 2025 Team Mirai</div>
  );
}

