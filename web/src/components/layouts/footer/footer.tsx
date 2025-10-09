"use client";

import Image from "next/image";
import Link from "next/link";
import { footerIcons } from "./footer-icons";
import { policyLinks, primaryLinks, socialLinks } from "./footer.config";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#bcecd3] to-[#64d8c6] text-slate-900">
      <div className="mx-auto flex w-full max-w-[402px] flex-col items-center gap-9 px-6 py-14 text-center">
        <FooterLogoSection />
        <FooterPrimaryLinks />
        <FooterPolicies />
        <FooterSocialIcons />
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
          width={150}
          height={128}
          className="h-auto"
        />
      </Link>
    </div>
  );
}

function FooterPrimaryLinks() {
  return (
    <nav aria-label="主要リンク" className="w-full max-w-[309px]">
      <ul className="flex flex-col items-center gap-3 text-[14px] font-semibold text-slate-800">
        {primaryLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterPolicies() {
  return (
    <div className="mt-2 flex flex-col items-center text-[12px] font-semibold text-slate-800">
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {policyLinks.map((policy, index) => (
          <li key={policy.label} className="flex items-center gap-2">
            <Link
              href={policy.href}
              target={policy.external ? "_blank" : undefined}
              rel={policy.external ? "noreferrer" : undefined}
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {policy.label}
            </Link>
            {index < policyLinks.length - 1 ? <span>｜</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSocialIcons() {
  return (
    <div className="flex flex-col items-center">
      <ul className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((social) => {
          const Icon = footerIcons[social.iconId];
          return (
            <li key={social.name}>
              <Link
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <Icon className="h-6 w-6" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FooterCopyright() {
  return (
    <div className="text-center text-sm font-medium text-slate-800">
      © 2025 Team Mirai All rights Reserved
    </div>
  );
}
