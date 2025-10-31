import { formatDate } from '@/utils/dateUtils';

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const testDate = new Date('2023-05-10');
    expect(formatDate(testDate)).toBe('2023-05-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const testDate = new Date('2023-05-10');
    expect(formatDate(testDate, 15)).toBe('2023-05-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testDate = new Date('2023-01-20');
    expect(formatDate(testDate)).toBe('2023-01-20');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testDate = new Date('2023-12-05');
    expect(formatDate(testDate)).toBe('2023-12-05');
  });
});
