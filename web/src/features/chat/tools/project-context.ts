import knowledgeBase from "./mirai-knowledge.json";

type KnowledgeCategory = "organization" | "platform";

type KnowledgeEntry = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  details: string[];
  keywords: string[];
};

const entries = knowledgeBase as KnowledgeEntry[];

const fallbackOrder = [
  "team-mirai-overview",
  "mirai-gikai-overview",
  "hundred-day-plan",
];

export const PROJECT_CONTEXT_SECTIONS = entries.map((entry) => entry.id);

export type ProjectContextSection = (typeof PROJECT_CONTEXT_SECTIONS)[number];

type ProjectContextParams = {
  query?: string;
  section?: ProjectContextSection;
  limit?: number;
};

export function getProjectContext({
  query,
  section,
  limit = 2,
}: ProjectContextParams): string {
  const selectedEntries = section
    ? getEntriesBySection(section)
    : searchEntries(query);

  const uniqueEntries: KnowledgeEntry[] = [];

  for (const entry of selectedEntries) {
    if (!uniqueEntries.some((item) => item.id === entry.id)) {
      uniqueEntries.push(entry);
    }
    if (uniqueEntries.length >= limit) {
      break;
    }
  }

  if (uniqueEntries.length === 0) {
    for (const fallbackId of fallbackOrder) {
      const fallbackEntry = entries.find((item) => item.id === fallbackId);
      if (fallbackEntry) {
        uniqueEntries.push(fallbackEntry);
      }
      if (uniqueEntries.length >= limit) {
        break;
      }
    }
  }

  return formatResponse(uniqueEntries);
}

function getEntriesBySection(section: ProjectContextSection) {
  const entry = entries.find((item) => item.id === section);
  if (!entry) {
    return [];
  }
  if (entry.category === "organization") {
    return [entry, getEntryById("mirai-gikai-overview")].filter(
      Boolean
    ) as KnowledgeEntry[];
  }
  return [entry];
}

function searchEntries(rawQuery?: string) {
  if (!rawQuery) {
    return fallbackOrder
      .map((id) => getEntryById(id))
      .filter(Boolean) as KnowledgeEntry[];
  }

  const query = normalize(rawQuery);
  const scoredEntries = entries
    .map((entry) => ({
      entry,
      score: Math.max(
        matchKeywords(entry, query),
        matchText(entry.summary, query),
        ...entry.details.map((detail) => matchText(detail, query))
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredEntries.length === 0) {
    return fallbackOrder
      .map((id) => getEntryById(id))
      .filter(Boolean) as KnowledgeEntry[];
  }

  return scoredEntries.map(({ entry }) => entry);
}

function matchKeywords(entry: KnowledgeEntry, query: string) {
  return entry.keywords.reduce((score, keyword) => {
    if (query.includes(normalize(keyword))) {
      return score + 3;
    }
    if (normalize(keyword).includes(query)) {
      return score + 1;
    }
    return score;
  }, 0);
}

function matchText(text: string, query: string) {
  const normalizedText = normalize(text);
  if (normalizedText.includes(query)) {
    return 2;
  }

  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) {
    return 0;
  }

  const matches = queryTokens.filter((token) => normalizedText.includes(token));

  if (matches.length === 0) {
    return 0;
  }

  return 1 + matches.length;
}

function formatResponse(selectedEntries: KnowledgeEntry[]) {
  return selectedEntries
    .map((entry) => {
      const bullets = entry.details.map((detail) => `- ${detail}`).join("\n");
      return `${entry.title}\n${entry.summary}\n${bullets}`;
    })
    .join("\n\n");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .trim();
}

function getEntryById(id: string) {
  return entries.find((entry) => entry.id === id) ?? null;
}
