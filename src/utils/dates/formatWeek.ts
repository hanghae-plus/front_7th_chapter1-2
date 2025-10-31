// Returns the formatted week string for the given date in the format "YYYY년 MM월 WW주"
// 주어진 날짜에 대한 형식화된 주 문자열을 "YYYY년 MM월 WW주" 형식으로 반환합니다.

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(
    thursday.getFullYear(),
    thursday.getMonth(),
    1
  );

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor(
      (thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}
