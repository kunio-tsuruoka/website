/** 分を「X時間Y分」表記に整形する（0/負数は空文字）。フロー図の所要時間表示で共用。 */
export function formatDuration(min: number): string {
  if (!min || min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h > 0 && m > 0) return `${h}時間${m}分`;
  if (h > 0) return `${h}時間`;
  return `${m}分`;
}
