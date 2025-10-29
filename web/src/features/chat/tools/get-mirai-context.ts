import { tool } from "ai";
import { z } from "zod";

import { miraiKnowledgeText } from "./mirai-knowledge";

type MiraiKnowledge = {
  context: string;
};

const knowledge = getMiraiContext() as MiraiKnowledge;

export function getMiraiContext(): string {
  return miraiKnowledgeText;
}

export const projectContextTool = tool({
  description:
    "みらい議会およびチームみらいに関する内部知識を参照し、要約と要点を返します。",
  inputSchema: z.object({}).default({}),
  execute: async () => getMiraiContext(),
});
