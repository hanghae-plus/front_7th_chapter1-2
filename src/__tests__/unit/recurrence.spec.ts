import { describe, it, expect } from 'vitest';

// 대상 함수는 src/utils/recurrence.ts 의 computeRecurringDates 로 가정 (아직 미구현)
import { computeRecurringDates } from '../../utils/recurrence';

/**
 * 시나리오: `docs/recurring-function-spec.md` 22-28
 * - 매월: 31일인 경우 31일이 없는 달은 생성하지 않음
 * - 매년: 2월 29일은 윤년이 아닌 해에는 생성하지 않음
 */

describe('computeRecurringDates (unit)', () => {
  it('매월 반복에서 31일은 31일이 없는 달을 건너뛴다', () => {
    const start = new Date('2025-01-31');
    const until = new Date('2025-05-31');
    const result = computeRecurringDates({ type: 'monthly', interval: 1, start, until });
    // 기대: 1/31, 3/31, 5/31 (2월/4월은 31일 없음)
    const ymd = result.map((d) => d.toISOString().slice(0, 10));
    expect(ymd).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
  });

  it('매년 반복에서 2월 29일은 윤년이 아닌 해를 건너뛴다', () => {
    const start = new Date('2024-02-29'); // 윤년
    const until = new Date('2028-03-01');
    const result = computeRecurringDates({ type: 'yearly', interval: 1, start, until });
    // 기대: 2024-02-29, 2028-02-29 (2025~2027은 2/29 없음)
    const ymd = result.map((d) => d.toISOString().slice(0, 10));
    expect(ymd).toEqual(['2024-02-29', '2028-02-29']);
  });

  it('매주 반복은 동일 요일로 생성한다', () => {
    const start = new Date('2025-10-06'); // 월요일 가정
    const until = new Date('2025-10-27');
    const result = computeRecurringDates({ type: 'weekly', interval: 1, start, until });
    const ymd = result.map((d) => d.toISOString().slice(0, 10));
    expect(ymd).toEqual(['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27']);
  });
});
