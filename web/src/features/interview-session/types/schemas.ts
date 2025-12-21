import { z } from "zod";

// レポート生成結果のバリデーション
export const interviewReportSchema = z.object({
  summary: z.string().nullable(),
  stance: z.enum(["for", "against", "neutral"]).nullable(),
  role: z.string().nullable(),
  role_description: z.string().nullable(),
  opinions: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .nullable(),
});

export type InterviewReportData = z.infer<typeof interviewReportSchema>;
