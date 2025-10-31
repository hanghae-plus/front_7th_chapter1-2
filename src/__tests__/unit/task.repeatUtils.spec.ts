/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 날짜 생성 로직
 *
 * 예상 실패 (구현 전):
 * - ✗ 모든 generateRepeatDates 테스트
 *   → 예상: 빈 배열 반환 (실제 로직 미구현)
 * - ✗ 모든 getNextRepeatDate 테스트
 *   → 예상: null 반환 (실제 로직 미구현)
 * - ✗ 모든 isValid31stMonthly 테스트
 *   → 예상: false 반환 (실제 로직 미구현)
 * - ✗ 모든 isValidLeapYearFeb29 테스트
 *   → 예상: false 반환 (실제 로직 미구현)
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, expect, it } from 'vitest';

import {
  formatRepeatInfo,
  generateRepeatDates,
  getNextRepeatDate,
  isValid31stMonthly,
  isValidLeapYearFeb29,
} from '../../utils/repeatUtils';

describe('generateRepeatDates - 반복 일정 날짜 배열 생성', () => {
  it('반복 없음(none)인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'none' as const, interval: 1 };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('매일 반복, 종료일 있음 - 시작일부터 종료일까지 모든 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: 1, endDate: '2025-01-20' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(6);
    expect(result).toEqual([
      '2025-01-15',
      '2025-01-16',
      '2025-01-17',
      '2025-01-18',
      '2025-01-19',
      '2025-01-20',
    ]);
  });

  it('매일 반복, 간격 3일 - 3일 단위로 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: 3, endDate: '2025-01-30' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(6);
    expect(result[0]).toBe('2025-01-15');
    expect(result[1]).toBe('2025-01-18');
    expect(result[2]).toBe('2025-01-21');
    expect(result[3]).toBe('2025-01-24');
    expect(result[4]).toBe('2025-01-27');
    expect(result[5]).toBe('2025-01-30');
  });

  it('매주 반복, 종료일 2개월 - 7일 단위로 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'weekly' as const, interval: 1, endDate: '2025-03-15' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(9);
    // 모두 같은 요일(수요일)이어야 함
    expect(result[0]).toBe('2025-01-15');
    expect(result[1]).toBe('2025-01-22');
    expect(result[8]).toBe('2025-03-12');
  });

  it('매주 반복, 간격 2주 - 14일 단위로 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'weekly' as const, interval: 2, endDate: '2025-02-15' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('2025-01-15');
    expect(result[1]).toBe('2025-01-29');
    expect(result[2]).toBe('2025-02-12');
  });

  it('매월 반복, 일반 일자(15일) - 매월 15일에 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'monthly' as const, interval: 1, endDate: '2025-06-15' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(6);
    expect(result).toEqual([
      '2025-01-15',
      '2025-02-15',
      '2025-03-15',
      '2025-04-15',
      '2025-05-15',
      '2025-06-15',
    ]);
  });

  it('매월 반복, 31일 - 31일이 있는 달에만 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-31';
    const repeatInfo = { type: 'monthly' as const, interval: 1, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    // 31일이 있는 달: 1, 3, 5, 7, 8, 10, 12월 (7개)
    expect(result).toHaveLength(7);
    expect(result).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
      '2025-12-31',
    ]);
  });

  it('매월 반복, 30일 - 2월을 건너뛰고 날짜를 생성한다', () => {
    // Given
    const baseDate = '2025-01-30';
    const repeatInfo = { type: 'monthly' as const, interval: 1, endDate: '2025-03-30' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(2);
    expect(result).toEqual(['2025-01-30', '2025-03-30']);
  });

  it('매년 반복, 일반 날짜 - 매년 같은 날짜에 생성한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'yearly' as const, interval: 1, endDate: '2029-01-15' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(5);
    expect(result).toEqual(['2025-01-15', '2026-01-15', '2027-01-15', '2028-01-15', '2029-01-15']);
  });

  it('매년 반복, 2월 29일 - 윤년에만 날짜를 생성한다', () => {
    // Given
    const baseDate = '2024-02-29';
    const repeatInfo = { type: 'yearly' as const, interval: 1, endDate: '2032-02-29' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    // 윤년: 2024, 2028, 2032 (3개)
    expect(result).toHaveLength(3);
    expect(result).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
  });

  it('매년 반복, 간격 4년(윤년 사이) - 4년 간격의 윤년에만 생성한다', () => {
    // Given
    const baseDate = '2024-02-29';
    const repeatInfo = { type: 'yearly' as const, interval: 4, endDate: '2040-02-29' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toHaveLength(5);
    expect(result).toEqual(['2024-02-29', '2028-02-29', '2032-02-29', '2036-02-29', '2040-02-29']);
  });

  it('유효하지 않은 baseDate인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = 'invalid-date';
    const repeatInfo = { type: 'daily' as const, interval: 1, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('interval이 0 이하인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: 0, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('interval이 음수인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: -1, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('endDate가 baseDate보다 이전인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-12-31';
    const repeatInfo = { type: 'daily' as const, interval: 1, endDate: '2025-01-01' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });
});

describe('getNextRepeatDate - 다음 반복 날짜 계산', () => {
  it('매일 반복, 간격 1일 - 1일 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'daily' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-01-16');
  });

  it('매일 반복, 간격 10일 - 10일 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'daily' as const;
    const interval = 10;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-01-25');
  });

  it('매주 반복, 간격 1주 - 7일 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'weekly' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-01-22');
  });

  it('매주 반복, 간격 2주 - 14일 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'weekly' as const;
    const interval = 2;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-01-29');
  });

  it('매월 반복, 간격 1개월 - 1개월 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'monthly' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-02-15');
  });

  it('매월 반복, 31일에서 2월로 넘어갈 때 - 2월 마지막 날을 반환한다', () => {
    // Given
    const currentDate = '2025-01-31';
    const repeatType = 'monthly' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-02-28');
  });

  it('매년 반복, 간격 1년 - 1년 후 날짜를 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'yearly' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2026-01-15');
  });

  it('매년 반복, 윤년 2월 29일에서 평년으로 넘어갈 때 - 2월 28일을 반환한다', () => {
    // Given
    const currentDate = '2024-02-29';
    const repeatType = 'yearly' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-02-28');
  });

  it('반복 없음(none)인 경우 null을 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'none' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBeNull();
  });

  it('유효하지 않은 날짜인 경우 null을 반환한다', () => {
    // Given
    const currentDate = 'invalid-date';
    const repeatType = 'daily' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBeNull();
  });

  it('interval이 0 이하인 경우 null을 반환한다', () => {
    // Given
    const currentDate = '2025-01-15';
    const repeatType = 'daily' as const;
    const interval = 0;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBeNull();
  });

  it('연도를 넘어가는 매일 반복 - 새해 첫날을 반환한다', () => {
    // Given
    const currentDate = '2024-12-31';
    const repeatType = 'daily' as const;
    const interval = 1;

    // When
    const result = getNextRepeatDate(currentDate, repeatType, interval);

    // Then
    expect(result).toBe('2025-01-01');
  });
});

describe('isValid31stMonthly - 31일 매월 규칙 검증', () => {
  it('1월 31일 - 31일이 있는 달이므로 true를 반환한다', () => {
    // Given
    const date = '2025-01-31';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(true);
  });

  it('3월 31일 - 31일이 있는 달이므로 true를 반환한다', () => {
    // Given
    const date = '2025-03-31';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(true);
  });

  it('5월 31일 - 31일이 있는 달이므로 true를 반환한다', () => {
    // Given
    const date = '2025-05-31';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(true);
  });

  it('2월 28일 - 31일이 없는 달이므로 false를 반환한다', () => {
    // Given
    const date = '2025-02-28';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(false);
  });

  it('4월 30일 - 31일이 없는 달이므로 false를 반환한다', () => {
    // Given
    const date = '2025-04-30';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(false);
  });

  it('1월 15일 - 31일이 있는 달이지만 일자가 31일이 아니므로 true를 반환한다', () => {
    // Given
    const date = '2025-01-15';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(true);
  });

  it('유효하지 않은 날짜인 경우 false를 반환한다', () => {
    // Given
    const date = 'invalid-date';

    // When
    const result = isValid31stMonthly(date);

    // Then
    expect(result).toBe(false);
  });
});

describe('isValidLeapYearFeb29 - 윤년 2월 29일 규칙 검증', () => {
  it('2024년 2월 29일 - 윤년이므로 true를 반환한다', () => {
    // Given
    const date = '2024-02-29';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(true);
  });

  it('2000년 2월 29일 - 400으로 나누어떨어지는 윤년이므로 true를 반환한다', () => {
    // Given
    const date = '2000-02-29';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(true);
  });

  it('2025년 2월 28일 - 평년이므로 false를 반환한다', () => {
    // Given
    const date = '2025-02-28';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(false);
  });

  it('1900년 2월 29일 - 100으로 나누어떨어지지만 400으로는 안 나뉘므로 false를 반환한다', () => {
    // Given
    const date = '1900-02-29';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(false);
  });

  it('2024년 3월 29일 - 윤년이지만 2월이 아니므로 false를 반환한다', () => {
    // Given
    const date = '2024-03-29';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(false);
  });

  it('유효하지 않은 날짜인 경우 false를 반환한다', () => {
    // Given
    const date = 'invalid-date';

    // When
    const result = isValidLeapYearFeb29(date);

    // Then
    expect(result).toBe(false);
  });
});

describe('formatRepeatInfo - 반복 정보 문자열 변환', () => {
  it('반복 없음인 경우 빈 문자열을 반환한다', () => {
    // Given
    const repeatInfo = { type: 'none' as const, interval: 1 };

    // When
    const result = formatRepeatInfo(repeatInfo);

    // Then
    expect(result).toBe('');
  });

  it('매일, 간격 1인 경우 "매일"을 반환한다', () => {
    // Given
    const repeatInfo = { type: 'daily' as const, interval: 1 };

    // When
    const result = formatRepeatInfo(repeatInfo);

    // Then
    expect(result).toBe('매일');
  });

  it('매주, 간격 2, 종료일 있는 경우 "매주 (2주마다) ~ 2025-12-31"을 반환한다', () => {
    // Given
    const repeatInfo = { type: 'weekly' as const, interval: 2, endDate: '2025-12-31' };

    // When
    const result = formatRepeatInfo(repeatInfo);

    // Then
    expect(result).toBe('매주 (2주마다) ~ 2025-12-31');
  });

  it('매월, 간격 3인 경우 "매월 (3개월마다)"를 반환한다', () => {
    // Given
    const repeatInfo = { type: 'monthly' as const, interval: 3 };

    // When
    const result = formatRepeatInfo(repeatInfo);

    // Then
    expect(result).toBe('매월 (3개월마다)');
  });

  it('매년, 간격 1, 종료일 있는 경우 "매년 ~ 2030-01-01"을 반환한다', () => {
    // Given
    const repeatInfo = { type: 'yearly' as const, interval: 1, endDate: '2030-01-01' };

    // When
    const result = formatRepeatInfo(repeatInfo);

    // Then
    expect(result).toBe('매년 ~ 2030-01-01');
  });
});
