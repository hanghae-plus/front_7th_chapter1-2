import { Event } from '../../types';

/**
 * Get current system date in October 2025 format
 * <!-- 2025년 10월의 현재 시스템 날짜 가져오기 -->
 */
export function getCurrentTestDate(dayOffset: number = 0): string {
  const baseDate = new Date('2025-10-01'); // System base date
  baseDate.setDate(baseDate.getDate() + dayOffset);
  return baseDate.toISOString().split('T')[0];
}

/**
 * Create a recurring event for testing
 * <!-- 테스트용 반복 일정 생성 -->
 */
export function createRecurringEvent(overrides?: Partial<Event>): Event {
  return {
    id: overrides?.id || 'recurring-1',
    title: overrides?.title || '주간 회의',
    date: overrides?.date || getCurrentTestDate(7), // 2025-10-08
    startTime: overrides?.startTime || '10:00',
    endTime: overrides?.endTime || '11:00',
    description: overrides?.description || '주간 미팅',
    location: overrides?.location || '회의실 A',
    category: overrides?.category || '업무',
    repeat: overrides?.repeat || {
      type: 'weekly',
      interval: 1,
      endDate: '2030-12-31', // Default end date for recurring events
    },
    notificationTime: overrides?.notificationTime || 10,
  };
}

/**
 * Create a normal (non-recurring) event for testing
 * <!-- 테스트용 일반 일정 생성 -->
 */
export function createNormalEvent(overrides?: Partial<Event>): Event {
  return {
    id: overrides?.id || 'normal-1',
    title: overrides?.title || '단일 미팅',
    date: overrides?.date || getCurrentTestDate(9), // 2025-10-10
    startTime: overrides?.startTime || '14:00',
    endTime: overrides?.endTime || '15:00',
    description: overrides?.description || '일회성 미팅',
    location: overrides?.location || '회의실 B',
    category: overrides?.category || '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: overrides?.notificationTime || 10,
  };
}

/**
 * Create a daily recurring event for testing
 * <!-- 테스트용 일일 반복 일정 생성 -->
 */
export function createDailyRecurringEvent(overrides?: Partial<Event>): Event {
  return createRecurringEvent({
    id: 'recurring-daily-1',
    title: '데일리 스탠드업',
    date: getCurrentTestDate(5), // 2025-10-06
    startTime: '09:00',
    endTime: '09:30',
    description: '일일 미팅',
    location: '온라인',
    repeat: { type: 'daily', interval: 1, endDate: '2030-12-31' },
    ...overrides,
  });
}
