"use client";

import Image from "next/image";
import Link from "next/link";
import { DifficultySelector } from "@/features/bill-difficulty/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { HamburgerMenu } from "./hamburger-menu";

interface HeaderClientProps {
  difficultyLevel: DifficultyLevelEnum;
}

export function HeaderClient({ difficultyLevel }: HeaderClientProps) {
  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-10 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-white shadow-sm mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="ホーム"
            >
              <Image
                src="/img/logo.svg"
                alt="みらい議会"
                width={42}
                height={36}
              />
              <div className="text-xl font-bold">みらい議会</div>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center space-x-2"
            aria-label="補助ナビゲーション"
          >
            <DifficultySelector currentLevel={difficultyLevel} />
            <HamburgerMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
