// Ai Edit
import { describe, expect, it } from 'vitest';

import { RepeatType } from '../../types';
import {
  generateRepeatDates,
  isLeapYear,
  getLastDayOfMonth,
  isValidRepeatDate,
} from '../../utils/repeatUtils';

describe('isLeapYear', () => {
  it('윤년인 경우 true를 반환한다', () => {
    // 🔍 Given: 윤년(2024, 2000, 2400)
    // 🎯 When: isLeapYear 함수 호출
    // ✅ Then: true 반환
    expect(isLeapYear(2024)).toBe(true); // 4로 나누어떨어지고 100으로 안 나누어떨어짐
    expect(isLeapYear(2000)).toBe(true); // 400으로 나누어떨어짐
    expect(isLeapYear(2400)).toBe(true);
  });

  it('평년인 경우 false를 반환한다', () => {
    // 🔍 Given: 평년(2023, 2025, 1900)
    // 🎯 When: isLeapYear 함수 호출
    // ✅ Then: false 반환
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false); // 100으로 나누어떨어지지만 400으로 안 나누어떨어짐
  });
});

describe('getLastDayOfMonth', () => {
  it('1월의 마지막 날은 31일이다', () => {
    // 🔍 Given: 2025년 1월
    // 🎯 When: getLastDayOfMonth 호출
    // ✅ Then: 31 반환
    expect(getLastDayOfMonth(2025, 1)).toBe(31);
  });

  it('2월의 마지막 날은 평년에 28일이다', () => {
    // 🔍 Given: 2025년(평년) 2월
    // 🎯 When: getLastDayOfMonth 호출
    // ✅ Then: 28 반환
    expect(getLastDayOfMonth(2025, 2)).toBe(28);
  });

  it('2월의 마지막 날은 윤년에 29일이다', () => {
    // 🔍 Given: 2024년(윤년) 2월
    // 🎯 When: getLastDayOfMonth 호출
    // ✅ Then: 29 반환
    expect(getLastDayOfMonth(2024, 2)).toBe(29);
  });

  it('4월의 마지막 날은 30일이다', () => {
    // 🔍 Given: 2025년 4월
    // 🎯 When: getLastDayOfMonth 호출
    // ✅ Then: 30 반환
    expect(getLastDayOfMonth(2025, 4)).toBe(30);
  });
});

describe('isValidRepeatDate', () => {
  it('매월 반복 시 항상 true를 반환한다', () => {
    // 🔍 Given: 매월 반복 (31일 케이스는 generateRepeatDates에서 처리)
    // 🎯 When: isValidRepeatDate 호출 (repeatType: monthly)
    // ✅ Then: true 반환
    const originalDate = new Date('2025-01-31');
    const targetDate = new Date('2025-02-28');
    expect(isValidRepeatDate(targetDate, originalDate, 'monthly')).toBe(true);
  });

  it('매년 반복 시 2월 29일을 선택했는데 평년인 경우 false를 반환한다', () => {
    // 🔍 Given: 원본 날짜가 2024-02-29(윤년), 대상 날짜가 2025-02-28(평년)
    // 🎯 When: isValidRepeatDate 호출 (repeatType: yearly)
    // ✅ Then: false 반환 (2025년은 윤년이 아님)
    const originalDate = new Date('2024-02-29');
    const targetDate = new Date('2025-02-28');
    expect(isValidRepeatDate(targetDate, originalDate, 'yearly')).toBe(false);
  });

  it('매년 반복 시 2월 29일을 선택했는데 윤년인 경우 true를 반환한다', () => {
    // 🔍 Given: 원본 날짜가 2024-02-29(윤년), 대상 날짜가 2028-02-29(윤년)
    // 🎯 When: isValidRepeatDate 호출 (repeatType: yearly)
    // ✅ Then: true 반환 (2028년은 윤년)
    const originalDate = new Date('2024-02-29');
    const targetDate = new Date('2028-02-29');
    expect(isValidRepeatDate(targetDate, originalDate, 'yearly')).toBe(true);
  });

  it('매일 반복 시 항상 true를 반환한다', () => {
    // 🔍 Given: 매일 반복
    // 🎯 When: isValidRepeatDate 호출 (repeatType: daily)
    // ✅ Then: 항상 true 반환
    const originalDate = new Date('2025-01-01');
    const targetDate = new Date('2025-01-02');
    expect(isValidRepeatDate(targetDate, originalDate, 'daily')).toBe(true);
  });

  it('매주 반복 시 항상 true를 반환한다', () => {
    // 🔍 Given: 매주 반복
    // 🎯 When: isValidRepeatDate 호출 (repeatType: weekly)
    // ✅ Then: 항상 true 반환
    const originalDate = new Date('2025-01-01');
    const targetDate = new Date('2025-01-08');
    expect(isValidRepeatDate(targetDate, originalDate, 'weekly')).toBe(true);
  });
});

describe('generateRepeatDates - 매일 반복', () => {
  it('매일 1일 간격, 시작 2025-01-01, 종료 2025-01-05인 경우 5개 날짜를 생성한다', () => {
    // 🔍 Given: 매일 반복, 간격 1일, 시작 2025-01-01, 종료 2025-01-05
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [2025-01-01, 2025-01-02, 2025-01-03, 2025-01-04, 2025-01-05] 반환
    const result = generateRepeatDates({
      startDate: '2025-01-01',
      repeatType: 'daily',
      interval: 1,
      endDate: '2025-01-05',
    });

    expect(result).toEqual([
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      '2025-01-04',
      '2025-01-05',
    ]);
  });

  it('매일 2일 간격, 시작 2025-01-01, 종료 2025-01-05인 경우 3개 날짜를 생성한다', () => {
    // 🔍 Given: 매일 반복, 간격 2일, 시작 2025-01-01, 종료 2025-01-05
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [2025-01-01, 2025-01-03, 2025-01-05] 반환
    const result = generateRepeatDates({
      startDate: '2025-01-01',
      repeatType: 'daily',
      interval: 2,
      endDate: '2025-01-05',
    });

    expect(result).toEqual(['2025-01-01', '2025-01-03', '2025-01-05']);
  });

  it('매일 3일 간격, 시작 2025-01-01, 종료 2025-01-05인 경우 2개 날짜를 생성한다', () => {
    // 🔍 Given: 매일 반복, 간격 3일, 시작 2025-01-01, 종료 2025-01-05
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [2025-01-01, 2025-01-04] 반환 (7일은 종료일 초과)
    const result = generateRepeatDates({
      startDate: '2025-01-01',
      repeatType: 'daily',
      interval: 3,
      endDate: '2025-01-05',
    });

    expect(result).toEqual(['2025-01-01', '2025-01-04']);
  });
});

describe('generateRepeatDates - 매주 반복', () => {
  it('매주 1주 간격, 시작 2025-10-01(수), 종료 2025-10-30인 경우 5개 날짜를 생성한다', () => {
    // 🔍 Given: 매주 반복, 간격 1주, 시작 2025-10-01(수요일), 종료 2025-10-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [10-01, 10-08, 10-15, 10-22, 10-29] 반환
    const result = generateRepeatDates({
      startDate: '2025-10-01',
      repeatType: 'weekly',
      interval: 1,
      endDate: '2025-10-30',
    });

    expect(result).toEqual([
      '2025-10-01',
      '2025-10-08',
      '2025-10-15',
      '2025-10-22',
      '2025-10-29',
    ]);
  });

  it('매주 2주 간격, 시작 2025-10-01, 종료 2025-10-30인 경우 3개 날짜를 생성한다', () => {
    // 🔍 Given: 매주 반복, 간격 2주, 시작 2025-10-01, 종료 2025-10-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [10-01, 10-15, 10-29] 반환
    const result = generateRepeatDates({
      startDate: '2025-10-01',
      repeatType: 'weekly',
      interval: 2,
      endDate: '2025-10-30',
    });

    expect(result).toEqual(['2025-10-01', '2025-10-15', '2025-10-29']);
  });

  it('매주 1주 간격, 월을 넘어가는 경우 정확히 계산한다', () => {
    // 🔍 Given: 매주 반복, 간격 1주, 시작 2025-01-27(월), 종료 2025-02-10
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [01-27, 02-03, 02-10] 반환
    const result = generateRepeatDates({
      startDate: '2025-01-27',
      repeatType: 'weekly',
      interval: 1,
      endDate: '2025-02-10',
    });

    expect(result).toEqual(['2025-01-27', '2025-02-03', '2025-02-10']);
  });
});

describe('generateRepeatDates - 매월 반복 (일반 케이스)', () => {
  it('매월 1개월 간격, 시작 2025-01-15, 종료 2025-04-30인 경우 4개 날짜를 생성한다', () => {
    // 🔍 Given: 매월 반복, 간격 1개월, 시작 2025-01-15, 종료 2025-04-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [01-15, 02-15, 03-15, 04-15] 반환
    const result = generateRepeatDates({
      startDate: '2025-01-15',
      repeatType: 'monthly',
      interval: 1,
      endDate: '2025-04-30',
    });

    expect(result).toEqual(['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15']);
  });

  it('매월 2개월 간격, 시작 2025-01-15, 종료 2025-06-30인 경우 3개 날짜를 생성한다', () => {
    // 🔍 Given: 매월 반복, 간격 2개월, 시작 2025-01-15, 종료 2025-06-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [01-15, 03-15, 05-15] 반환
    const result = generateRepeatDates({
      startDate: '2025-01-15',
      repeatType: 'monthly',
      interval: 2,
      endDate: '2025-06-30',
    });

    expect(result).toEqual(['2025-01-15', '2025-03-15', '2025-05-15']);
  });
});

describe('generateRepeatDates - 매월 반복 (31일 특수 케이스)', () => {
  it('매월 1개월 간격, 시작 2025-01-31, 종료 2025-04-30인 경우 31일이 있는 달만 생성한다', () => {
    // 🔍 Given: 매월 반복, 간격 1개월, 시작 2025-01-31, 종료 2025-04-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [01-31, 03-31] 반환 (2월, 4월은 31일이 없으므로 건너뜀)
    const result = generateRepeatDates({
      startDate: '2025-01-31',
      repeatType: 'monthly',
      interval: 1,
      endDate: '2025-04-30',
    });

    expect(result).toEqual(['2025-01-31', '2025-03-31']);
  });

  it('매월 1개월 간격, 시작 2025-01-31, 종료 2025-12-31인 경우 31일이 있는 달만 생성한다', () => {
    // 🔍 Given: 매월 반복, 간격 1개월, 시작 2025-01-31, 종료 2025-12-31
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [1/31, 3/31, 5/31, 7/31, 8/31, 10/31, 12/31] 반환 (2,4,6,9,11월 건너뜀)
    const result = generateRepeatDates({
      startDate: '2025-01-31',
      repeatType: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
    });

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

  it('매월 1개월 간격, 시작 2025-03-30, 종료 2025-06-30인 경우 30일이 있는 달만 생성한다', () => {
    // 🔍 Given: 매월 반복, 간격 1개월, 시작 2025-03-30, 종료 2025-06-30
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [3/30, 4/30, 5/30, 6/30] 반환 (모든 달에 30일 존재)
    const result = generateRepeatDates({
      startDate: '2025-03-30',
      repeatType: 'monthly',
      interval: 1,
      endDate: '2025-06-30',
    });

    expect(result).toEqual(['2025-03-30', '2025-04-30', '2025-05-30', '2025-06-30']);
  });
});

describe('generateRepeatDates - 매년 반복 (일반 케이스)', () => {
  it('매년 1년 간격, 시작 2024-03-15, 종료 2025-12-31인 경우 2개 날짜를 생성한다', () => {
    // 🔍 Given: 매년 반복, 간격 1년, 시작 2024-03-15, 종료 2025-12-31
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [2024-03-15, 2025-03-15] 반환
    const result = generateRepeatDates({
      startDate: '2024-03-15',
      repeatType: 'yearly',
      interval: 1,
      endDate: '2025-12-31',
    });

    expect(result).toEqual(['2024-03-15', '2025-03-15']);
  });
});

describe('generateRepeatDates - 매년 반복 (윤년 2/29 특수 케이스)', () => {
  it('매년 1년 간격, 시작 2024-02-29, 종료 2025-12-31인 경우 윤년만 생성한다', () => {
    // 🔍 Given: 매년 반복, 간격 1년, 시작 2024-02-29(윤년), 종료 2025-12-31
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: [2024-02-29] 반환 (2025년은 평년이므로 생성 안 됨)
    const result = generateRepeatDates({
      startDate: '2024-02-29',
      repeatType: 'yearly',
      interval: 1,
      endDate: '2025-12-31',
    });

    expect(result).toEqual(['2024-02-29']);
  });

});

describe('generateRepeatDates - 에러 케이스', () => {
  it('종료일이 시작일보다 이전인 경우 에러를 발생시킨다', () => {
    // 🔍 Given: 종료일(2025-01-01)이 시작일(2025-01-05)보다 이전
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: Error 발생
    expect(() =>
      generateRepeatDates({
        startDate: '2025-01-05',
        repeatType: 'daily',
        interval: 1,
        endDate: '2025-01-01',
      })
    ).toThrow('종료일은 시작일보다 이후여야 합니다');
  });

  it('반복 간격이 1 미만인 경우 에러를 발생시킨다', () => {
    // 🔍 Given: 반복 간격이 0
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: Error 발생
    expect(() =>
      generateRepeatDates({
        startDate: '2025-01-01',
        repeatType: 'daily',
        interval: 0,
        endDate: '2025-01-05',
      })
    ).toThrow('반복 간격은 1 이상이어야 합니다');
  });

  it('종료일이 2025-12-31을 초과하는 경우 에러를 발생시킨다', () => {
    // 🔍 Given: 종료일이 2026-01-01
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: Error 발생
    expect(() =>
      generateRepeatDates({
        startDate: '2025-01-01',
        repeatType: 'daily',
        interval: 1,
        endDate: '2026-01-01',
      })
    ).toThrow();
  });

  it('잘못된 날짜 형식인 경우 에러를 발생시킨다', () => {
    // 🔍 Given: 잘못된 날짜 형식
    // 🎯 When: generateRepeatDates 호출
    // ✅ Then: Error 발생
    expect(() =>
      generateRepeatDates({
        startDate: 'invalid-date',
        repeatType: 'daily',
        interval: 1,
        endDate: '2025-01-05',
      })
    ).toThrow('유효하지 않은 날짜 형식입니다');
  });
});

interface RepeatDateGenerationOptions {
  startDate: string;
  repeatType: RepeatType;
  interval: number;
  endDate: string;
}

