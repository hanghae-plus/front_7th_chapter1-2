import { generateRecurrences } from '../../utils/eventUtils';

describe('generateRecurrences (RED)', () => {
  it('매월 반복에서 31일 선택 시 31일에만 일정을 생성해야 한다 (30/28/29일 대체 금지)', () => {
    // 준비: 2024년 1월 31일부터 12월 31일까지, 반복 유형은 monthly로 지정
    const start = new Date('2024-01-31');
    const end = new Date('2024-12-31');
    // 실행: 매월 1회 반복 생성
    const events = generateRecurrences({
      start,
      end,
      type: 'monthly',
      interval: 1,
    });
    // 검증: 1, 3, 5, 7, 8, 10, 12월 31일만 있어야 함 (다른 달 대체/생성 금지)
    const dates = events.map((e) => e.date.slice(5, 10)); // MM-DD
    expect(dates).toContain('01-31');
    expect(dates).toContain('03-31');
    expect(dates).toContain('05-31');
    expect(dates).toContain('07-31');
    expect(dates).toContain('08-31');
    expect(dates).toContain('10-31');
    expect(dates).toContain('12-31');
    expect(dates).not.toContain('04-30');
    expect(dates).not.toContain('06-30');
    expect(dates).not.toContain('09-30');
    expect(dates).not.toContain('11-30');
    expect(dates).not.toContain('02-28');
    expect(dates).not.toContain('02-29');
  });

  it('연 반복에서 2월 29일 선택 시 윤년에만 일정을 생성해야 한다', () => {
    // 준비: 2024년 2월 29일부터 2030년 12월 31일까지, 반복 유형은 yearly
    const start = new Date('2024-02-29');
    const end = new Date('2030-12-31');
    // 실행: 매년 1회 반복 생성
    const events = generateRecurrences({
      start,
      end,
      type: 'yearly',
      interval: 1,
    });
    // 검증: 윤년(2024, 2028)만 포함, 그 외는 생성 금지
    const dates = events.map((e) => e.date);
    expect(dates).toContain('2024-02-29');
    expect(dates).toContain('2028-02-29');
    expect(dates).not.toContain('2025-02-28');
    expect(dates).not.toContain('2026-02-28');
    expect(dates).not.toContain('2027-02-28');
    expect(dates).not.toContain('2029-02-28');
    expect(dates).not.toContain('2030-02-28');
  });

  it('반복 일정이 기존 일정과 겹쳐도 생성되어야 한다', () => {
    // 준비: 2024년 5월 31일부터 7월 31일까지, 월간 반복
    const start = new Date('2024-05-31');
    const end = new Date('2024-07-31');
    // 실행: 기존에 2024-05-31 일정이 이미 있다고 가정, 중복 허용
    const events = generateRecurrences({
      start,
      end,
      type: 'monthly',
      interval: 1,
    });
    // 검증: 2024-05-31, 2024-07-31 모두 포함되어야 함 (중복 제외 논리 없어야 함)
    const dates = events.map((e) => e.date);
    expect(dates).toContain('2024-05-31');
    expect(dates).toContain('2024-07-31');
  });

  // 추가적인 음수/경계 사례는 이 패턴을 따라 작성 가능
});
