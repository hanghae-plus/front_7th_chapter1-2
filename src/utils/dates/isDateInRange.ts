// Returns true if the given date is within the specified date range (inclusive).
// 주어진 날짜가 지정된 날짜 범위 내에 있는지 여부를 반환합니다.

// Helper function to strip time from a date
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function isDateInRange(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}
