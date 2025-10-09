import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { HeaderClient } from "./header-client";

export async function Header() {
  const difficultyLevel = await getDifficultyLevel();
  return <HeaderClient difficultyLevel={difficultyLevel} />;
}
