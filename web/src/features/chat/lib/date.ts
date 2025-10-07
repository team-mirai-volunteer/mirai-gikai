const JST_OFFSET_MINUTES = 9 * 60;

export function getTodayJstDate(): string {
  const nowUtc = new Date();
  const jstTime = new Date(nowUtc.getTime() + JST_OFFSET_MINUTES * 60 * 1000);
  return jstTime.toISOString().split("T")[0];
}

