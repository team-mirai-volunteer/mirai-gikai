import Image from "next/image";
import Link from "next/link";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { DifficultySelector } from "@/features/bill-difficulty/components/difficulty-selector";

export async function Header() {
  const difficultyLevel = await getDifficultyLevel();
  return (
    <header className="px-3 mt-4 fixed top-0 left-0 right-0 z-50">
      <div className="rounded-full bg-white shadow-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/img/logo.svg"
                alt="みらい議会"
                width={42}
                height={42}
              />
              <div className="text-xl font-bold">みらい議会</div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <DifficultySelector currentLevel={difficultyLevel} />
          </nav>
        </div>
      </div>
    </header>
  );
}
