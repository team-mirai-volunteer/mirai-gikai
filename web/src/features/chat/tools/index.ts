import { openai } from "@ai-sdk/openai";
import { diceTool } from "./dice";

/**
 * 利用可能なツールの設定
 * 環境変数で各ツールの有効/無効を制御可能
 */
export function getAvailableTools() {
  const enableWebSearch = process.env.ENABLE_WEB_SEARCH !== "false";
  const enableDice = process.env.ENABLE_DICE_TOOL !== "false"; // デフォルトで有効

  console.log("[Tools] Tool configuration:", {
    webSearch: enableWebSearch,
    dice: enableDice,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  if (enableWebSearch) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools.web_search = openai.tools.webSearch() as any;
  }

  if (enableDice) {
    tools.dice = diceTool;
  }

  // ツールが1つもない場合はundefinedを返す
  return Object.keys(tools).length > 0 ? tools : undefined;
}

/**
 * システムプロンプトにツールの使用方法を追加
 */
export function buildToolInstructions(
  hasWebSearch: boolean,
  hasDice: boolean
): string {
  const instructions: string[] = [];

  if (hasWebSearch) {
    instructions.push(`
## Web検索の使用について
- あなたの知識カットオフ（2025年1月）以降の情報や、知らない情報については積極的にWeb検索を使用してください
- 最新の政治動向、法案の審議状況、統計データ、ニュースなど時事的な情報が必要な場合は検索してください
- 検索結果を使用する場合は、必ず引用元のURLを明記してください
- 検索すれば分かる内容でも、政治や政策・チームみらいに関係ない内容については答えないようにしてください。
`);
  }

  if (hasDice) {
    instructions.push(`
## サイコロツールの使用について
- ユーザーが「サイコロを振って」「サイコロ振って」「ダイスを振って」など、明示的にサイコロを振ることを依頼した場合**のみ**、diceツールを使用してください
- それ以外の質問（検索、法案の説明など）では絶対にdiceツールを使用しないでください
- サイコロは1から6までのランダムな数を返します
- 複数回振ることも可能です（最大10回）
`);
  }

  return instructions.join("\n");
}
