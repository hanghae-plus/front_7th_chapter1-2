import { validateRecurringEndDate } from '../../utils/recurringEventUtils';

// [FR-4.1, FR-4.2] 반복 종료일 검증
describe('validateRecurringEndDate', () => {
  it('[FR-4.1] 반복 종료일이 시작일보다 이전이면 에러를 반환해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-01-10'; // 시작일보다 이전

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('반복 종료일은 시작일 이후여야 합니다.');
  });

  it('[FR-4.2] 반복 종료일이 2025-12-31을 초과하면 에러를 반환해야 한다', () => {
    const startDate = '2025-12-30';
    const endDate = '2026-01-05'; // 2025-12-31 초과

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('반복 종료일은 2025-12-31을 초과할 수 없습니다.');
  });

  it('반복 종료일이 시작일과 같으면 유효해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-01-15';

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('반복 종료일이 시작일 이후이고 2025-12-31 이하면 유효해야 한다', () => {
    const startDate = '2025-01-15';
    const endDate = '2025-12-31';

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('반복 종료일이 정확히 2025-12-31이면 유효해야 한다', () => {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('반복 종료일이 2025-12-31과 같고 시작일 이후이면 유효해야 한다', () => {
    const startDate = '2025-12-31';
    const endDate = '2025-12-31';

    const result = validateRecurringEndDate(startDate, endDate);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });
});

