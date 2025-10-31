import { describe, it, expect } from 'vitest'
import { expandMonthlyDates } from '../../utils/repeatUtils'

describe('red 1-10: repeatUtils 월말 처리', () => {
  it('2025-01-31에서 monthly로 반복 시 다음 달은 2025-02-28 이어야 한다 (Red)', () => {
    const dates = expandMonthlyDates('2025-01-31', 2) // 2 occurrences
    // 기대: Feb 28, Mar 31
    expect(dates).toEqual(['2025-02-28', '2025-03-31'])
  })
})
