// Converts date and time strings to a Date object
// 날짜 및 시간 문자열을 Date 객체로 변환합니다.

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}
