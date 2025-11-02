import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 반복 설정에 따라 반복 날짜 배열을 생성합니다.
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param repeatType 반복 유형 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param interval 반복 간격
 * @param endDate 반복 종료 날짜 (YYYY-MM-DD 형식, 선택사항)
 * @returns 반복 날짜 배열 (YYYY-MM-DD 형식)
 */
export function generateRepeatDates(
  startDate: string,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none',
  interval: number = 1,
  endDate?: string
): string[] {
  if (repeatType === 'none') {
    return [startDate];
  }

  const dates: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start);

  // endDate가 없으면 1년 후를 기본값으로 설정
  if (!endDate) {
    end.setFullYear(end.getFullYear() + 1);
  }

  let current = new Date(start);
  const startDay = start.getDate();
  const startMonth = start.getMonth();

  // 윤년 판별 함수
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  while (current <= end) {
    // 월별 반복에서 31일 설정 시, 실제 현재 날짜가 31일일 때만 추가
    // (31일이 없는 달에서는 자동으로 다음 달이 되므로 확인)
    if (repeatType === 'monthly' && startDay === 31) {
      if (current.getDate() === 31) {
        dates.push(formatDate(current));
      }
    } else if (repeatType === 'yearly' && startMonth === 1 && startDay === 29) {
      // 윤년 2월 29일 설정 시, 윤년에만 생성
      const year = current.getFullYear();
      if (isLeapYear(year)) {
        dates.push(formatDate(current));
      }
    } else {
      dates.push(formatDate(current));
    }

    // 반복 유형에 따라 다음 날짜 계산
    switch (repeatType) {
      case 'daily':
        current.setDate(current.getDate() + interval);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7 * interval);
        break;
      case 'monthly': {
        // 월별 반복: 날짜 손실 방지 (예: 1월 31일 → 2월 31일 없음 → 3월 3일 오버플로우)
        // 1. 날짜를 1일로 설정
        current.setDate(1);
        // 2. 월 증가
        current.setMonth(current.getMonth() + interval);
        // 3. 목표 달의 일수 확인
        const daysInMonth = getDaysInMonth(current.getFullYear(), current.getMonth() + 1);
        // 4. 원래 날짜 또는 해당 달의 마지막 일로 설정
        current.setDate(Math.min(startDay, daysInMonth));
        break;
      }
      case 'yearly':
        // 연별 반복: 날짜 손실 방지 (예: 2024-02-29 → 2025-02-29 불가)
        // setFullYear(year, month, day) 형식으로 연도와 함께 원래 날짜 설정
        current.setFullYear(current.getFullYear() + interval, startMonth, startDay);
        break;
    }
  }

  return dates;
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
