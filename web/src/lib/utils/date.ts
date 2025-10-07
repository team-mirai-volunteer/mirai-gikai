export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getJstCurrentDate(): string {
  const now = new Date();
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const jst = new Date(utc + jstOffsetMs);

  return jst.toISOString().split("T")[0];
}
