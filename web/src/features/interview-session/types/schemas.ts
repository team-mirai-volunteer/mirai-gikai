import { z } from "zod";

// レポート生成結果のバリデーション
export const interviewReportSchema = z
  .object({
    summary: z.string().nullable(),
    stance: z.enum(["for", "against", "neutral"]).nullable(),
    role: z.string().nullable(),
    role_description: z.string().nullable(),
    opinions: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    ),
  })
  .strict();

export type InterviewReportData = z.infer<typeof interviewReportSchema>;

// 通常チャット用スキーマ（textのみ）
export const interviewChatTextSchema = z.object({
  text: z.string(),
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
});

export type InterviewChatResponse = z.infer<typeof interviewChatResponseSchema>;
