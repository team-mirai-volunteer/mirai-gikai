/**
 * 議案詳細ページへのリンクを取得
 */
export function getBillDetailLink(
  billId: string,
  previewToken?: string
): string {
  if (previewToken) {
    return `/preview/bills/${billId}?token=${previewToken}`;
  }
  return `/bills/${billId}`;
}

/**
 * インタビューLPページへのリンクを取得
 */
export function getInterviewLPLink(
  billId: string,
  previewToken?: string
): string {
  if (previewToken) {
    return `/preview/bills/${billId}/interview?token=${previewToken}`;
  }
  return `/bills/${billId}/interview`;
}

/**
 * インタビューチャットページへのリンクを取得
 */
export function getInterviewChatLink(
  billId: string,
  previewToken?: string
): string {
  if (previewToken) {
    return `/preview/bills/${billId}/interview/chat?token=${previewToken}`;
  }
  return `/bills/${billId}/interview/chat`;
}

/**
 * インタビューレポートページへのリンクを取得
 */
export function getInterviewReportLink(reportId: string): string {
  return `/report/${reportId}`;
}
