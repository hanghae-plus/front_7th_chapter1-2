// Formats the given date into "YYYY-MM-DD" format. Optionally, a specific day can be provided.
// 주어진 날짜를 "YYYY-MM-DD" 형식으로 포맷합니다. 선택적으로 특정 일을 제공할 수 있습니다.

import { fillZero } from './fillZero';

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
