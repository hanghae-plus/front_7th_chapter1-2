import { generateRecurringDates } from '../../domain/recurrence/generateRecurringDates';

describe('generateRecurringDates', () => {
  // codex: 반복 유형은 매일/매주/매월/매년을 지원해야 한다.
  // codex: 반복 유형과 31일·윤년 규칙을 검증한다.
  describe('반복 유형 선택', () => {
    it('supports daily repeats', () => {
      const occurrences = generateRecurringDates({
        startDate: '2025-01-01',
        repeat: { type: 'daily', interval: 1 },
        endDate: '2025-01-03',
      });

      expect(occurrences).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
    });

    it('supports weekly repeats', () => {
      const occurrences = generateRecurringDates({
        startDate: '2025-01-01',
        repeat: { type: 'weekly', interval: 2 },
        endDate: '2025-01-29',
      });

      expect(occurrences).toEqual(['2025-01-01', '2025-01-15', '2025-01-29']);
    });
  });

  // codex: 31일 반복은 31일 있는 달에만, 윤년 2/29는 윤년에만 생성해야 한다.
  describe('경계 규칙', () => {
    it('creates only occurrences that fall on the 31st when starting on January 31st', () => {
      const occurrences = generateRecurringDates({
        startDate: '2025-01-31',
        repeat: { type: 'monthly', interval: 1 },
        endDate: '2025-06-30',
      });

      expect(occurrences).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
    });

    it('creates only leap-day occurrences within the allowed window when repeating yearly from February 29th', () => {
      const occurrences = generateRecurringDates({
        startDate: '2024-02-29',
        repeat: { type: 'yearly', interval: 1 },
        endDate: '2032-12-31',
      });

      expect(occurrences).toEqual(['2024-02-29']);
    });
  });

  // codex: 반복 종료일은 지정 가능하며 2025-12-31을 상한으로 강제한다.
  describe('반복 종료 규칙', () => {
    it('caps generated occurrences at 2025-12-31 when no end date is provided', () => {
      const occurrences = generateRecurringDates({
        startDate: '2025-12-29',
        repeat: { type: 'daily', interval: 1 },
      });

      expect(occurrences).toEqual(['2025-12-29', '2025-12-30', '2025-12-31']);
    });

    it('clamps an explicit endDate beyond the allowed max to 2025-12-31', () => {
      const occurrences = generateRecurringDates({
        startDate: '2025-12-30',
        repeat: { type: 'daily', interval: 1 },
        endDate: '2026-01-05',
      });

      expect(occurrences).toEqual(['2025-12-30', '2025-12-31']);
    });
  });
});
