export function fmtMin(m: number): string {
  if (m < 60) return `${m}分`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}時間` : `${h}時間${r}分`;
}

const yenFmt = new Intl.NumberFormat('ja-JP');
export function fmtYen(yen: number): string {
  return `¥${yenFmt.format(Math.round(yen))}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
