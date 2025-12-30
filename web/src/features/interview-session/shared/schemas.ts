import { z } from "zod";

// 意見スキーマ
const opinionSchema = z.object({
  title: z.string().describe("意見のタイトル（40文字以内）"),
  content: z.string().describe("意見の説明（120文字以内）"),
});

// スコアリングスキーマ
const scoresSchema = z.object({
  total: z.number().min(0).max(100).describe("総合スコア（0-100）"),
  clarity: z
    .number()
    .min(0)
    .max(100)
    .describe("主張の明確さ（0-100）- 意見や立場が明確に表現されているか"),
  specificity: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "具体性（0-100）- 実務経験に基づく具体的な事例や数値が含まれているか"
    ),
  impact: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "影響度（0-100）- 法案が与える社会的影響や関係者への影響について言及があるか"
    ),
  constructiveness: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "建設性（0-100）- 問題点の指摘だけでなく、改善案や代替案の提示があるか"
    ),
  reasoning: z.string().describe("スコアの根拠を簡潔に説明（100文字以内）"),
});

export type InterviewScores = z.infer<typeof scoresSchema>;

// レポート生成結果のバリデーション
export const interviewReportSchema = z
  .object({
    summary: z
      .string()
      .nullable()
      .describe(
        "ユーザーの主張を20文字以内でまとめたもの。「」書きで書けるようなテキスト（ただし「」は記載しない）"
      ),
    stance: z
      .enum(["for", "against", "neutral"])
      .nullable()
      .describe(
        "法案に対するユーザーのスタンス。for=賛成、against=反対、neutral=期待と懸念の両方がある"
      ),
    role: z
      .string()
      .nullable()
      .describe(
        "インタビュイーの立場・属性（例：「中国航路担当のフォワーダー実務者」）"
      ),
    role_description: z
      .string()
      .nullable()
      .describe("ユーザーの役割や背景についての詳細な説明"),
    opinions: z
      .array(opinionSchema)
      .max(3)
      .describe(
        "ユーザーの具体的な主張（最大3件）。メインの主張を補強するように記載。元の対話ログにないことは記載しない"
      ),
    scores: scoresSchema.describe(
      "インタビューを「法案検討の参考資料」として評価したスコア"
    ),
  })
  .strict();

export type InterviewReportData = z.infer<typeof interviewReportSchema>;

// クライアント表示用の型（scoresはユーザーには表示しない）
export type InterviewReportViewData = Omit<InterviewReportData, "scores">;

// 通常チャット用スキーマ（textとquick_replies）
export const interviewChatTextSchema = z.object({
  text: z.string(),
  quick_replies: z.array(z.string()).nullable(),
  question_id: z.string().nullable(),
});

export type InterviewChatText = z.infer<typeof interviewChatTextSchema>;

// summaryフェーズ用スキーマ（textとreportを含む）
export const interviewChatWithReportSchema = z.object({
  text: z.string(),
  report: interviewReportSchema,
});

export type InterviewChatWithReport = z.infer<
  typeof interviewChatWithReportSchema
>;

// クライアント側で使う統一スキーマ（両方のレスポンスを受け取れる）
export const interviewChatResponseSchema = z.object({
  text: z.string(),
  report: interviewReportSchema.optional(),
  quick_replies: z.array(z.string()).optional().nullable(),
  question_id: z.string().optional().nullable(),
});

export type InterviewChatResponse = z.infer<typeof interviewChatResponseSchema>;
