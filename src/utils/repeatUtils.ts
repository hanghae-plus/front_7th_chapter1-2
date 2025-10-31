import { Event, RepeatType } from '../types';

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환합니다.
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜의 요일을 반환합니다.
 * @param date - 확인할 날짜
 * @returns 0(일요일)부터 6(토요일)까지의 숫자
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * 주어진 연도가 윤년인지 판단합니다.
 * @param year - 확인할 연도
 * @returns 윤년이면 true, 평년이면 false
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 특정 날짜가 반복 규칙에 따라 건너뛰어야 하는지 판단합니다.
 * @param date - 체크할 날짜
 * @param repeatType - 반복 유형
 * @param baseDay - 기준일 (1-31)
 * @param baseMonth - 기준월 (0-11, 매년 반복 시 사용)
 * @returns true면 건너뜀, false면 생성
 */
export function shouldSkipDate(
  date: Date,
  repeatType: string,
  baseDay: number,
  baseMonth?: number
): boolean {
  // 매월 31일 반복: 정확히 31일이 아니면 건너뜀
  if (repeatType === 'monthly' && baseDay === 31) {
    return date.getDate() !== 31;
  }

  // 매년 2/29 반복: 윤년이 아니거나 29일이 아니면 건너뜀
  if (repeatType === 'yearly' && baseMonth === 1 && baseDay === 29) {
    return !isLeapYear(date.getFullYear()) || date.getDate() !== 29;
  }

  return false;
}

/**
 * 현재 날짜를 기반으로 다음 반복 발생일을 계산합니다.
 * @param currentDate - 현재 날짜
 * @param repeatType - 반복 유형
 * @param interval - 반복 간격
 * @param baseDate - 기준 날짜 (첫 이벤트 날짜)
 * @returns 다음 발생일 (없으면 null)
 */
export function getNextOccurrence(
  currentDate: Date,
  repeatType: RepeatType,
  interval: number,
  baseDate: Date
): Date | null {
  switch (repeatType) {
    case 'daily':
      // 매일 반복: 현재 날짜 + interval일
      return new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);

    case 'weekly':
      // 매주 반복: 현재 날짜 + interval주 (7 * interval일)
      return new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);

    case 'monthly': {
      // 매월 반복: 현재 날짜의 월 + interval, 일자는 기준일로 설정
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + interval);
      nextMonth.setDate(baseDate.getDate()); // 기준일로 설정
      return nextMonth;
    }

    case 'yearly': {
      // 매년 반복: 현재 날짜의 연 + interval, 월일은 기준 날짜로 설정
      const nextYear = new Date(currentDate);
      nextYear.setFullYear(nextYear.getFullYear() + interval);
      nextYear.setMonth(baseDate.getMonth());
      nextYear.setDate(baseDate.getDate());
      return nextYear;
    }

    case 'none':
    default:
      // 반복 없음
      return null;
  }
}

/**
 * 반복 일정의 모든 인스턴스를 생성합니다.
 * @param event - 원본 Event (반복 정보 포함)
 * @returns 생성된 모든 인스턴스 배열
 */
export function generateRepeatInstances(event: Event): Event[] {
  const instances: Event[] = [];

  // 반복이 없는 경우 원본 이벤트만 반환
  if (event.repeat.type === 'none' || !event.repeat.endDate) {
    return [event];
  }

  const startDate = new Date(event.date);
  const endDate = new Date(event.repeat.endDate);
  const interval = event.repeat.interval || 1;

  // 매일 반복 처리
  if (event.repeat.type === 'daily') {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      instances.push({
        ...event,
        date: formatDate(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }
  }

  return instances;
}

/**
 * 반복 일정의 모든 인스턴스를 생성합니다. (EventForm 기반)
 * @param eventForm - 사용자 입력 (date, repeat.type, repeat.interval 포함)
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD, 최대 2025-12-31)
 * @returns 개별 이벤트 배열 (id 제외)
 */
export function generateRecurringInstances(
  eventForm: import('../types').EventForm,
  endDate: string
): Omit<Event, 'id'>[] {
  const instances: Omit<Event, 'id'>[] = [];

  // 반복이 없는 경우 원본 이벤트만 반환
  if (eventForm.repeat.type === 'none') {
    return [eventForm];
  }

  const baseDate = new Date(eventForm.date);
  const maxDate = new Date(endDate);
  const interval = eventForm.repeat.interval || 1;

  // 첫 이벤트 무조건 추가
  instances.push({ ...eventForm, date: formatDate(baseDate) });

  let currentDate = new Date(baseDate);

  // 다음 발생일 계산 반복
  while (true) {
    const nextDate = getNextOccurrence(currentDate, eventForm.repeat.type, interval, baseDate);

    if (!nextDate || nextDate > maxDate) break;

    // 날짜 건너뛰기 체크 (31일, 윤년)
    if (shouldSkipDate(nextDate, eventForm.repeat.type, baseDate.getDate(), baseDate.getMonth())) {
      currentDate = nextDate;
      continue;
    }

    instances.push({ ...eventForm, date: formatDate(nextDate) });
    currentDate = nextDate;
  }

  return instances;
}
