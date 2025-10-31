import { Event, EventForm } from '../types';

/**
 * 반복 일정 생성 함수
 */
export const generateRecurringEvents = (eventForm: EventForm): Event[] => {
  const { repeat } = eventForm;

  // 반복 유형이 none인 경우 단일 이벤트 생성
  if (repeat.type === 'none') {
    const event: Event = {
      ...eventForm,
      id: generateUniqueId(),
    };
    return [event];
  }

  // 반복 종료일이 없으면 빈 배열 반환
  if (!repeat.endDate) {
    return [];
  }

  const events: Event[] = [];
  const startDate = new Date(eventForm.date);
  const endDate = new Date(repeat.endDate);
  const repeatId = generateUniqueId();

  let currentDate = new Date(startDate);

  // 안전장치: 최대 1000개까지만 생성
  let count = 0;
  const maxCount = 1000;

  while (currentDate <= endDate && count < maxCount) {
    // 해당 날짜가 유효한 경우에만 이벤트 생성
    if (isValidRecurringDate(currentDate, startDate, repeat.type)) {
      const event: Event = {
        ...eventForm,
        id: generateUniqueId(),
        repeatId,
        date: formatDate(currentDate),
      };
      events.push(event);
    }

    // 다음 반복 날짜 계산
    currentDate = getNextRecurringDate(currentDate, startDate, repeat.type, repeat.interval);
    count++;
  }

  return events;
};

/**
 * 반복 일정 검증 함수
 */
export const validateRecurringEvent = (eventForm: EventForm): string | null => {
  const { repeat, date } = eventForm;

  // 반복 유형이 none인 경우
  if (repeat.type === 'none') {
    return '반복 유형을 선택해주세요.';
  }

  // 반복 종료 날짜가 없는 경우
  if (!repeat.endDate) {
    return '반복 종료 날짜를 입력해주세요.';
  }

  const startDate = new Date(date);
  const endDate = new Date(repeat.endDate);
  const maxDate = new Date('2025-12-31');

  // 반복 종료 날짜가 시작 날짜보다 이전인 경우
  if (endDate < startDate) {
    return '반복 종료 날짜는 시작 날짜 이후여야 합니다.';
  }

  // 반복 종료 날짜가 2025-12-31을 초과하는 경우
  if (endDate > maxDate) {
    return '반복 종료 날짜는 2025-12-31까지만 설정 가능합니다.';
  }

  return null;
};

/**
 * 반복 일정인지 판별하는 함수
 */
export const isRecurringEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none';
};

/**
 * 같은 반복 그룹의 모든 일정을 가져오는 함수
 */
export const getRecurringEventGroup = (events: Event[], repeatId: string): Event[] => {
  return events.filter((event) => event.repeatId === repeatId);
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 고유 ID 생성
 */
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 다음 반복 날짜 계산
 */
const getNextRecurringDate = (
  currentDate: Date,
  startDate: Date,
  repeatType: string,
  interval: number
): Date => {
  const nextDate = new Date(currentDate);
  const targetDay = startDate.getDate();

  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;
    case 'monthly': {
      // 1일로 먼저 설정하고 다음 달로 이동
      nextDate.setDate(1);
      nextDate.setMonth(nextDate.getMonth() + interval);
      
      // 해당 월에 목표 날짜가 존재하는지 확인
      const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      
      if (targetDay <= lastDay) {
        // 목표 날짜가 존재하면 설정
        nextDate.setDate(targetDay);
      } else {
        // 목표 날짜가 없으면 다음 달로 이동
        nextDate.setMonth(nextDate.getMonth() + interval);
        const nextLastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        if (targetDay <= nextLastDay) {
          nextDate.setDate(targetDay);
        }
      }
      break;
    }
    case 'yearly': {
      const targetMonth = startDate.getMonth();
      const targetDay = startDate.getDate();
      
      // 윤년 2월 29일 처리
      if (targetMonth === 1 && targetDay === 29) {
        // 1일로 먼저 설정하여 날짜 오버플로우 방지
        nextDate.setDate(1);
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        
        // 현재 연도가 윤년이 아니면 다음 윤년까지 이동
        let yearOffset = 0;
        while (!isLeapYear(nextDate.getFullYear()) && yearOffset < 10) {
          nextDate.setFullYear(nextDate.getFullYear() + interval);
          yearOffset++;
        }
        
        // 윤년을 찾았으면 2월로 설정하고 29일로 설정
        if (isLeapYear(nextDate.getFullYear())) {
          nextDate.setMonth(1); // 2월
          nextDate.setDate(29);
        }
      } else {
        // 일반적인 경우
        nextDate.setFullYear(nextDate.getFullYear() + interval);
      }
      break;
    }
  }

  return nextDate;
};

/**
 * 해당 날짜가 반복 규칙에 유효한지 확인
 */
const isValidRecurringDate = (
  currentDate: Date,
  startDate: Date,
  repeatType: string
): boolean => {
  switch (repeatType) {
    case 'daily':
      return true;
    case 'weekly':
      // 같은 요일인지 확인
      return currentDate.getDay() === startDate.getDay();
    case 'monthly':
      // 같은 날짜인지 확인
      return currentDate.getDate() === startDate.getDate();
    case 'yearly':
      // 같은 월과 날짜인지 확인
      // 윤년 처리: 2월 29일인 경우 윤년에만 유효
      if (startDate.getMonth() === 1 && startDate.getDate() === 29) {
        const year = currentDate.getFullYear();
        const isLeapYearValue = isLeapYear(year);
        return (
          isLeapYearValue &&
          currentDate.getMonth() === 1 &&
          currentDate.getDate() === 29
        );
      }
      return (
        currentDate.getMonth() === startDate.getMonth() &&
        currentDate.getDate() === startDate.getDate()
      );
    default:
      return true;
  }
};

/**
 * 윤년 여부 확인
 */
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
