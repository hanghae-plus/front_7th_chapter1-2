import { Event, RepeatInfo } from '../types';

/**
 * 윤년 여부를 판별합니다.
 * @param year - 연도
 * @returns 윤년 여부
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 특정 년/월에 해당 일자가 존재하는지 확인합니다.
 * @param year - 연도
 * @param month - 월 (1-12)
 * @param day - 일 (1-31)
 * @returns 해당 일자가 존재하는지 여부
 */
function hasDay(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환합니다.
 * @param date - Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 다음 반복 날짜를 계산합니다.
 * @param currentDate - 현재 날짜 (YYYY-MM-DD)
 * @param repeat - 반복 설정 정보
 * @returns 다음 반복 날짜 (YYYY-MM-DD)
 */
function getNextRecurringDate(currentDate: string, repeat: RepeatInfo): string | null {
  const [year, month, day] = currentDate.split('-').map(Number);
  const current = new Date(year, month - 1, day);

  switch (repeat.type) {
    case 'daily':
      current.setDate(current.getDate() + repeat.interval);
      return formatDate(current);

    case 'weekly':
      current.setDate(current.getDate() + repeat.interval * 7);
      return formatDate(current);

    case 'monthly': {
      let nextYear = year;
      let nextMonth = month + repeat.interval;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      // 해당 월에 날짜가 있는지 확인
      if (hasDay(nextYear, nextMonth, day)) {
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      // 없으면 null 반환하여 건너뛰기
      return null;
    }

    case 'yearly': {
      const nextYear = year + repeat.interval;

      // 해당 연도에 날짜가 있는지 확인 (윤년 처리)
      if (hasDay(nextYear, month, day)) {
        return `${nextYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      // 없으면 null 반환하여 건너뛰기
      return null;
    }

    default:
      return null;
  }
}

/**
 * 반복 일정 설정을 바탕으로 날짜 배열을 생성합니다.
 * @param startDate - 반복 시작 날짜 (YYYY-MM-DD 형식)
 * @param repeat - 반복 설정 정보
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD 형식, 선택적)
 * @returns 생성된 날짜 배열 (YYYY-MM-DD 형식)
 */
export function generateRecurringDates(
  startDate: string,
  repeat: RepeatInfo,
  endDate?: string
): string[] {
  const dates: string[] = [];
  const end = repeat.endDate || endDate;

  // 종료일이 없으면 빈 배열 반환 (무한 반복은 expandRecurringEvents에서 처리)
  if (!end) {
    return dates;
  }

  const endTime = new Date(end).getTime();
  let currentDate = startDate;

  while (new Date(currentDate).getTime() <= endTime) {
    dates.push(currentDate);

    const nextDate = getNextRecurringDate(currentDate, repeat);
    if (!nextDate) {
      // 다음 날짜 계산 시도 (건너뛰기 처리)
      const [year, month, day] = currentDate.split('-').map(Number);

      if (repeat.type === 'monthly') {
        let nextYear = year;
        let nextMonth = month + repeat.interval;

        while (nextMonth > 12) {
          nextMonth -= 12;
          nextYear += 1;
        }

        // 다음 유효한 날짜를 찾을 때까지 계속 진행
        let foundNext = false;
        while (
          nextYear * 12 + nextMonth <=
          new Date(end).getFullYear() * 12 + new Date(end).getMonth() + 1
        ) {
          if (hasDay(nextYear, nextMonth, day)) {
            currentDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            foundNext = true;
            break;
          }
          nextMonth += repeat.interval;
          if (nextMonth > 12) {
            nextMonth -= 12;
            nextYear += 1;
          }
        }

        if (!foundNext) break;
      } else if (repeat.type === 'yearly') {
        let nextYear = year + repeat.interval;

        // 다음 유효한 날짜를 찾을 때까지 계속 진행
        let foundNext = false;
        while (nextYear <= new Date(end).getFullYear()) {
          if (hasDay(nextYear, month, day)) {
            currentDate = `${nextYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            foundNext = true;
            break;
          }
          nextYear += repeat.interval;
        }

        if (!foundNext) break;
      } else {
        break;
      }
    } else {
      currentDate = nextDate;
    }
  }

  return dates;
}

/**
 * 반복 일정 설정이 유효한지 검증합니다.
 * @param startDate - 반복 시작 날짜
 * @param repeat - 반복 설정 정보
 * @param endDate - 반복 종료 날짜 (선택적)
 * @returns 유효성 검증 결과 { isValid: boolean, errorMessage?: string }
 */
export function validateRecurringConfig(
  startDate: string,
  repeat: RepeatInfo,
  endDate?: string
): { isValid: boolean; errorMessage?: string } {
  // 반복 타입이 none이면 항상 유효
  if (repeat.type === 'none') {
    return { isValid: true };
  }

  // interval 검증
  if (repeat.interval < 1) {
    return { isValid: false, errorMessage: '반복 간격은 1 이상이어야 합니다.' };
  }

  // 종료일이 있는 경우 검증
  const end = repeat.endDate || endDate;
  if (end) {
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(end).getTime();

    if (endTime < startTime) {
      return { isValid: false, errorMessage: '반복 종료일은 시작일 이후여야 합니다.' };
    }
  }

  return { isValid: true };
}

/**
 * 반복 일정을 단일 인스턴스로 분할합니다 (수정/삭제 시 사용).
 * @param event - 원본 반복 일정
 * @param targetDate - 수정/삭제할 날짜
 * @returns 분할된 일정 배열 { before?: Event, after?: Event }
 */
export function splitRecurringEvent(
  event: Event,
  targetDate: string
): { before?: string; after?: string } {
  const result: { before?: string; after?: string } = {};

  const targetTime = new Date(targetDate).getTime();
  const startTime = new Date(event.date).getTime();
  const endTime = event.repeat.endDate ? new Date(event.repeat.endDate).getTime() : Infinity;

  // targetDate가 시작일보다 이후인 경우, before 생성
  if (targetTime > startTime) {
    // targetDate의 이전 날짜를 계산
    let previousDate: string | null = null;
    const allDates = generateRecurringDates(event.date, event.repeat, targetDate);

    // targetDate를 제외한 날짜들 중 마지막 날짜가 before의 endDate
    const beforeDates = allDates.filter((d) => new Date(d).getTime() < targetTime);

    if (beforeDates.length > 0) {
      previousDate = beforeDates[beforeDates.length - 1];

      result.before = previousDate;
    }
  }

  if (!event.repeat.endDate) {
    const nextDate = getNextRecurringDate(targetDate, event.repeat);
    if (nextDate) {
      result.after = nextDate;
    }
  }

  // targetDate가 종료일보다 이전인 경우, after 생성
  if (event.repeat.endDate && targetTime < endTime) {
    const nextDate = getNextRecurringDate(targetDate, event.repeat);

    if (nextDate) {
      result.after = nextDate;
    }
  }

  return result;
}

/**
 * 반복 정보를 사람이 읽을 수 있는 텍스트로 변환합니다.
 * @param repeat - 반복 설정 정보
 * @returns 반복 정보 텍스트 (예: "반복: 1일마다 (종료: 2025-01-07)")
 */
export function getRepeatText(repeat: RepeatInfo): string {
  if (repeat.type === 'none') {
    return '';
  }

  const typeMap: Record<string, string> = {
    daily: '일',
    weekly: '주',
    monthly: '월',
    yearly: '년',
  };

  const unit = typeMap[repeat.type];
  let text = `반복: ${repeat.interval}${unit}마다`;

  if (repeat.endDate) {
    text += ` (종료: ${repeat.endDate})`;
  }

  return text;
}

/**
 * 반복 일정을 날짜별 인스턴스로 전개합니다.
 * @param events - 일정 배열
 * @param rangeStart - 전개 시작 날짜
 * @param rangeEnd - 전개 종료 날짜
 * @returns 전개된 일정 배열
 */
export function expandRecurringEvents(events: Event[], rangeStart: Date, rangeEnd: Date): Event[] {
  const expanded: Event[] = [];

  // 날짜 문자열로 변환하여 비교 (시간대 문제 해결)
  const rangeStartStr = formatDate(rangeStart);
  const rangeEndStr = formatDate(rangeEnd);

  for (const event of events) {
    if (event.repeat.type === 'none') {
      // 반복 없는 일정은 그대로 추가
      expanded.push(event);
    } else {
      // 종료일이 있는 경우
      if (event.repeat.endDate) {
        const dates = generateRecurringDates(event.date, event.repeat, event.repeat.endDate);

        for (const date of dates) {
          // 날짜 문자열 비교로 변경 (시간대 문제 해결)
          if (date >= rangeStartStr && date <= rangeEndStr) {
            expanded.push({
              ...event,
              date,
            });
          }
        }
      } else {
        // 종료일이 없는 경우 (무한 반복) - 뷰 범위 내에서만 생성
        let currentDate = event.date;

        // 시작일이 뷰 범위보다 이전이면 뷰 시작일부터 시작
        if (currentDate < rangeStartStr) {
          // 뷰 범위 내 첫 반복 날짜 찾기
          while (currentDate < rangeStartStr) {
            const nextDate = getNextRecurringDate(currentDate, event.repeat);
            if (!nextDate) {
              // 건너뛰기 처리
              const [year, month, day] = currentDate.split('-').map(Number);

              if (event.repeat.type === 'monthly') {
                let nextYear = year;
                let nextMonth = month + event.repeat.interval;

                while (nextMonth > 12) {
                  nextMonth -= 12;
                  nextYear += 1;
                }

                let foundNext = false;
                while (true) {
                  if (hasDay(nextYear, nextMonth, day)) {
                    currentDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    foundNext = true;
                    break;
                  }
                  nextMonth += event.repeat.interval;
                  if (nextMonth > 12) {
                    nextMonth -= 12;
                    nextYear += 1;
                  }

                  const checkDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
                  if (checkDate > rangeEndStr) {
                    break;
                  }
                }

                if (!foundNext) break;
              } else if (event.repeat.type === 'yearly') {
                let nextYear = year + event.repeat.interval;

                let foundNext = false;
                while (true) {
                  if (hasDay(nextYear, month, day)) {
                    currentDate = `${nextYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    foundNext = true;
                    break;
                  }
                  nextYear += event.repeat.interval;

                  const checkDate = `${nextYear}-${String(month).padStart(2, '0')}-01`;
                  if (checkDate > rangeEndStr) {
                    break;
                  }
                }

                if (!foundNext) break;
              } else {
                break;
              }
            } else {
              currentDate = nextDate;
            }
          }
        }

        // 뷰 범위 내에서 일정 생성
        while (currentDate <= rangeEndStr) {
          // 날짜 문자열 비교로 변경 (시간대 문제 해결)
          if (currentDate >= rangeStartStr) {
            expanded.push({
              ...event,
              date: currentDate,
            });
          }

          const nextDate = getNextRecurringDate(currentDate, event.repeat);
          if (!nextDate) {
            // 건너뛰기 처리
            const [year, month, day] = currentDate.split('-').map(Number);

            if (event.repeat.type === 'monthly') {
              let nextYear = year;
              let nextMonth = month + event.repeat.interval;

              while (nextMonth > 12) {
                nextMonth -= 12;
                nextYear += 1;
              }

              let foundNext = false;
              while (true) {
                if (hasDay(nextYear, nextMonth, day)) {
                  currentDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  foundNext = true;
                  break;
                }
                nextMonth += event.repeat.interval;
                if (nextMonth > 12) {
                  nextMonth -= 12;
                  nextYear += 1;
                }

                const checkDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
                if (checkDate > rangeEndStr) {
                  break;
                }
              }

              if (!foundNext) break;
            } else if (event.repeat.type === 'yearly') {
              let nextYear = year + event.repeat.interval;

              let foundNext = false;
              while (true) {
                if (hasDay(nextYear, month, day)) {
                  currentDate = `${nextYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  foundNext = true;
                  break;
                }
                nextYear += event.repeat.interval;

                const checkDate = `${nextYear}-${String(month).padStart(2, '0')}-01`;
                if (checkDate > rangeEndStr) {
                  break;
                }
              }

              if (!foundNext) break;
            } else {
              break;
            }
          } else {
            currentDate = nextDate;
          }
        }
      }
    }
  }

  return expanded;
}
