export function formatMinutes(minutes: number) {
  return `${minutes}分`;
}

export function formatSignedMinutes(minutes: number) {
  return `${minutes >= 0 ? "+" : ""}${minutes}分`;
}

export function formatYen(amount: number) {
  return `${amount.toLocaleString("ja-JP")}円`;
}

export function formatYenRange([low, high]: [number, number]) {
  return `${formatYen(low)}〜${formatYen(high)}`;
}
