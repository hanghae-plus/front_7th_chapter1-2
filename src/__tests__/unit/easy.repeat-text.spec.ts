import { describe, it, expect } from 'vitest';

import { getRepeatText } from '../../features/recurring-events';

describe('getRepeatText', () => {
  it('매일 반복 일정은 "반복: 1일마다"로 표시된다', () => {
    const repeat = { type: 'daily' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).toContain('1일마다');
  });

  it('매주 반복 일정은 "반복: 1주마다"로 표시된다', () => {
    const repeat = { type: 'weekly' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).toContain('1주마다');
  });

  it('매월 반복 일정은 "반복: 1월마다"로 표시된다', () => {
    const repeat = { type: 'monthly' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).toContain('1월마다');
  });

  it('매년 반복 일정은 "반복: 1년마다"로 표시된다', () => {
    const repeat = { type: 'yearly' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).toContain('1년마다');
  });

  it('반복 종료일이 설정된 경우 "(종료: YYYY-MM-DD)" 형식으로 추가 표시된다', () => {
    const repeat = { type: 'daily' as const, interval: 1, endDate: '2025-12-31' };
    const text = getRepeatText(repeat);

    expect(text).toContain('종료: 2025-12-31');
  });

  it('반복 종료일이 없는 경우 종료일이 표시되지 않는다', () => {
    const repeat = { type: 'daily' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).not.toContain('종료');
  });

  it('none 타입은 빈 문자열을 반환한다', () => {
    const repeat = { type: 'none' as const, interval: 1 };
    const text = getRepeatText(repeat);

    expect(text).toBe('');
  });
});

