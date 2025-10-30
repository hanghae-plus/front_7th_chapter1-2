import { describe, it, expect } from 'vitest';

import { generateRepeatGroupId } from '../../features/recurring-events';

describe('generateRepeatGroupId', () => {
  it('고유한 repeatGroupId가 자동으로 생성된다', () => {
    const id = generateRepeatGroupId();

    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('서로 다른 반복 그룹은 서로 다른 repeatGroupId를 가진다', () => {
    const id1 = generateRepeatGroupId();
    const id2 = generateRepeatGroupId();

    expect(id1).not.toBe(id2);
  });

  it('매번 호출할 때마다 다른 ID가 생성된다', () => {
    const ids = new Set();
    for (let i = 0; i < 10; i++) {
      ids.add(generateRepeatGroupId());
    }

    // 10번 호출했을 때 모두 고유한 ID여야 함
    expect(ids.size).toBe(10);
  });
});

