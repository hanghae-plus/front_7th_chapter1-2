// Ai Edit
import { RepeatType } from '../types';

/**
 * 🗓️ 반복 날짜 생성 옵션
 */
interface RepeatDateGenerationOptions {
  startDate: string; // 'YYYY-MM-DD' 형식
  repeatType: RepeatType;
  interval: number; // 반복 간격
  endDate: string; // 'YYYY-MM-DD' 형식
}

/**
 * 🔍 윤년 여부를 판단합니다.
 */
export function isLeapYear(year: number): boolean {
  // 400으로 나누어떨어지면 윤년
  if (year % 400 === 0) return true;
  // 100으로 나누어떨어지면 평년
  if (year % 100 === 0) return false;
  // 4로 나누어떨어지면 윤년
  if (year % 4 === 0) return true;
  // 그 외는 평년
  return false;
}

/**
 * 📅 특정 월의 마지막 날짜를 반환합니다.
 */
export function getLastDayOfMonth(year: number, month: number): number {
  // month는 1-12 범위
  return new Date(year, month, 0).getDate();
}

/**
 * ✅ 반복 날짜가 유효한지 검증합니다.
 * 매월 반복: 해당 월에 날짜가 없으면 건너뛰기 (generateRepeatDates에서 처리)
 * 매년 반복: 윤년 2월 29일 → 윤년이 아닌 해는 건너뛰기
 */
export function isValidRepeatDate(
  targetDate: Date,
  originalDate: Date,
  repeatType: RepeatType
): boolean {
  // 매일, 매주 반복은 항상 유효
  if (repeatType === 'daily' || repeatType === 'weekly') {
    return true;
  }

  const originalDay = originalDate.getDate();
  const originalMonth = originalDate.getMonth() + 1;

  // 매월 반복: generateRepeatDates에서 이미 처리됨
  if (repeatType === 'monthly') {
    return true;
  }

  // 매년 반복: 윤년 2월 29일 체크
  if (repeatType === 'yearly') {
    // 원본 날짜가 2월 29일인 경우, 윤년이 아니면 건너뛰기
    if (originalMonth === 2 && originalDay === 29) {
      return isLeapYear(targetDate.getFullYear());
    }

    return true;
  }

  return true;
}

/**
 * 🗓️ 날짜를 'YYYY-MM-DD' 형식 문자열로 변환합니다.
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 📆 반복 규칙에 따라 날짜 배열을 생성합니다.
 */
export function generateRepeatDates(options: RepeatDateGenerationOptions): string[] {
  const { startDate, repeatType, interval, endDate } = options;

  // 🔍 입력 유효성 검사
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('유효하지 않은 날짜 형식입니다');
  }

  if (end < start) {
    throw new Error('종료일은 시작일보다 이후여야 합니다');
  }

  if (interval < 1) {
    throw new Error('반복 간격은 1 이상이어야 합니다');
  }

  const maxEndDate = new Date('2025-12-31');
  if (end > maxEndDate) {
    throw new Error('종료일은 2025-12-31까지만 설정 가능합니다');
  }

  // 📋 반복 날짜 배열
  const repeatDates: string[] = [];
  const originalDate = new Date(start);
  let repeatCount = 0; // 반복 횟수 카운터

  // 🔁 반복 유형에 따른 날짜 생성
  while (true) {
    let currentDate: Date;

    // 📅 반복 유형에 따른 날짜 계산
    if (repeatType === 'daily') {
      // 매일: 시작일 + (interval * repeatCount) 일
      currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + interval * repeatCount);
    } else if (repeatType === 'weekly') {
      // 매주: 시작일 + (interval * repeatCount) 주
      currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + interval * repeatCount * 7);
    } else if (repeatType === 'monthly') {
      // 매월: 시작일 + (interval * repeatCount) 개월
      const originalDay = originalDate.getDate();
      const totalMonths = interval * repeatCount;
      const targetYear =
        originalDate.getFullYear() + Math.floor((originalDate.getMonth() + totalMonths) / 12);
      const targetMonth = (originalDate.getMonth() + totalMonths) % 12;

      // 🔍 대상 월에 원본 날짜가 존재하는지 확인
      const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, targetMonth + 1);

      // ⚠️ 31일 특수 케이스: 해당 월에 날짜가 없으면 건너뛰기
      if (originalDay > lastDayOfTargetMonth) {
        repeatCount++;
        continue;
      }

      // 원본 날짜 그대로 사용
      currentDate = new Date(targetYear, targetMonth, originalDay);
    } else if (repeatType === 'yearly') {
      // 매년: 시작일 + (interval * repeatCount) 년
      const originalMonth = originalDate.getMonth();
      const originalDay = originalDate.getDate();
      const targetYear = originalDate.getFullYear() + interval * repeatCount;

      // 윤년 2월 29일 특수 케이스 처리
      if (originalMonth === 1 && originalDay === 29) {
        // 2월 29일인 경우, 윤년이 아니면 건너뛰기
        if (!isLeapYear(targetYear)) {
          repeatCount++;
          continue;
        }
      }

      currentDate = new Date(targetYear, originalMonth, originalDay);
    } else {
      // 지원하지 않는 반복 유형
      break;
    }

    // 종료일 초과 시 반복 종료
    if (currentDate > end) {
      break;
    }

    // ✅ 유효한 반복 날짜인지 확인
    if (isValidRepeatDate(currentDate, originalDate, repeatType)) {
      repeatDates.push(formatDateToString(currentDate));
    }

    repeatCount++;
  }

  return repeatDates;
}
