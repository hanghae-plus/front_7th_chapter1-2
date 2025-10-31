import { EventForm } from '../types';

/**
 * 반복 일정 생성 시 기본 최대 기간 (365일)
 */
const DEFAULT_MAX_DAYS = 365;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 */
function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 종료일을 계산합니다. 명시적 종료일이 없으면 시작일로부터 365일 후를 반환합니다.
 */
function calculateEndDate(startDate: Date, endDateString?: string): Date {
  if (endDateString) {
    return new Date(endDateString);
  }
  return new Date(startDate.getTime() + DEFAULT_MAX_DAYS * MILLISECONDS_PER_DAY);
}

/**
 * 반복 일정 인스턴스를 생성하는 공통 로직입니다.
 * @param event - 반복 일정 정보를 포함한 이벤트
 * @param dayIncrement - 날짜 증가 간격 (일 단위)
 * @returns 생성된 일정 인스턴스 배열
 */
function generateRepeatInstances(event: EventForm, dayIncrement: number): EventForm[] {
  const instances: EventForm[] = [];
  const startDate = new Date(event.date);
  const endDate = calculateEndDate(startDate, event.repeat.endDate);

  if (startDate > endDate) {
    return instances;
  }

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    instances.push({
      ...event,
      date: formatDateToString(currentDate),
    });

    currentDate.setDate(currentDate.getDate() + dayIncrement);
  }

  return instances;
}

/**
 * 매일 반복되는 일정 인스턴스를 생성합니다.
 * @param event - 반복 일정 정보를 포함한 이벤트
 * @returns 생성된 일정 인스턴스 배열
 */
export function generateDailyInstances(event: EventForm): EventForm[] {
  return generateRepeatInstances(event, 1);
}

/**
 * 매주 반복되는 일정 인스턴스를 생성합니다.
 * 시작일과 동일한 요일에 주 단위로 인스턴스가 생성됩니다.
 * @param event - 반복 일정 정보를 포함한 이벤트
 * @returns 생성된 일정 인스턴스 배열
 */
export function generateWeeklyInstances(event: EventForm): EventForm[] {
  return generateRepeatInstances(event, 7);
}

/**
 * 매월 반복되는 일정 인스턴스를 생성합니다.
 * 시작일과 동일한 날짜(일)에 월 단위로 인스턴스가 생성됩니다.
 * 특히 31일 규칙: 31일에 시작한 경우 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뜁니다.
 * @param event - 반복 일정 정보를 포함한 이벤트
 * @returns 생성된 일정 인스턴스 배열
 */
export function generateMonthlyInstances(event: EventForm): EventForm[] {
  const instances: EventForm[] = [];
  const startDate = new Date(event.date);
  const endDate = calculateEndDate(startDate, event.repeat.endDate);

  if (startDate > endDate) {
    return instances;
  }

  const targetDay = startDate.getDate(); // 시작일의 일(day)
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // 현재 월에 targetDay가 존재하는지 확인
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 해당 월의 targetDay 날짜 생성 시도
    const candidateDate = new Date(year, month, targetDay);

    // candidateDate가 실제로 같은 월인지 확인
    // (예: 2월 31일 → 3월 3일로 자동 변환되므로 월이 다름)
    if (candidateDate.getMonth() === month && candidateDate <= endDate) {
      instances.push({
        ...event,
        date: formatDateToString(candidateDate),
      });
    }

    // 다음 달로 이동
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return instances;
}

/**
 * 매년 반복되는 일정 인스턴스를 생성합니다.
 * 시작일과 동일한 월/일에 연 단위로 인스턴스가 생성됩니다.
 * 특히 윤일 규칙: 2월 29일에 시작한 경우 윤년에만 생성되고 평년은 건너뜁니다.
 * @param event - 반복 일정 정보를 포함한 이벤트
 * @returns 생성된 일정 인스턴스 배열
 */
export function generateYearlyInstances(event: EventForm): EventForm[] {
  const instances: EventForm[] = [];
  const startDate = new Date(event.date);
  const endDate = calculateEndDate(startDate, event.repeat.endDate);

  if (startDate > endDate) {
    return instances;
  }

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const targetMonth = startDate.getMonth(); // 시작일의 월
  const targetDay = startDate.getDate(); // 시작일의 일(day)

  // 시작 연도부터 종료 연도까지 순회
  for (let year = startYear; year <= endYear; year++) {
    // 해당 년도의 targetMonth, targetDay 날짜 생성 시도
    const candidateDate = new Date(year, targetMonth, targetDay);

    // candidateDate가 실제로 같은 월과 일인지 확인
    // (예: 평년의 2월 29일 → 3월 1일로 자동 변환되므로 월/일이 다름)
    if (
      candidateDate.getMonth() === targetMonth &&
      candidateDate.getDate() === targetDay &&
      candidateDate >= startDate &&
      candidateDate <= endDate
    ) {
      instances.push({
        ...event,
        date: formatDateToString(candidateDate),
      });
    }
  }

  return instances;
}
