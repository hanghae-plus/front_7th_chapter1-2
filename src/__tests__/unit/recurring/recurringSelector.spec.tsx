import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RecurringSelector } from '@/components/RecurringSelector';
import { RepeatType } from '@/types/recurring/RepeatType.types';

describe('RecurringSelector 컴포넌트', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('컴포넌트가 올바르게 렌더링되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    expect(screen.getByText('반복 설정')).toBeInTheDocument();
  });

  it('반복 유형 옵션들이 표시되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    expect(screen.getByText('반복 안함')).toBeInTheDocument();
    expect(screen.getByText('매일')).toBeInTheDocument();
    expect(screen.getByText('매주')).toBeInTheDocument();
    expect(screen.getByText('매월')).toBeInTheDocument();
    expect(screen.getByText('매년')).toBeInTheDocument();
  });

  it('반복 안함을 선택하면 onChange가 null로 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('반복 안함'));

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('매일 반복을 선택하면 올바른 RepeatInfo로 onChange가 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('매일'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: RepeatType.DAILY,
      interval: 1,
    });
  });

  it('매주 반복을 선택하면 올바른 RepeatInfo로 onChange가 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('매주'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: RepeatType.WEEKLY,
      interval: 1,
    });
  });

  it('매월 반복을 선택하면 올바른 RepeatInfo로 onChange가 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('매월'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: RepeatType.MONTHLY,
      interval: 1,
    });
  });

  it('매년 반복을 선택하면 올바른 RepeatInfo로 onChange가 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('매년'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: RepeatType.YEARLY,
      interval: 1,
    });
  });

  it('기본값이 있을 때 해당 옵션이 선택된 상태로 표시되어야 함', () => {
    const initialValue = {
      type: RepeatType.WEEKLY,
      interval: 1,
    };

    render(
      <RecurringSelector
        value={initialValue}
        onChange={mockOnChange}
      />
    );

    const weeklyOption = screen.getByLabelText('매주');
    expect(weeklyOption).toBeChecked();
  });

  it('disabled 상태일 때 모든 옵션이 비활성화되어야 함', () => {
    render(
      <RecurringSelector
        onChange={mockOnChange}
        disabled
      />
    );

    const options = screen.getAllByRole('radio');
    options.forEach((option) => {
      expect(option).toBeDisabled();
    });
  });

  it('반복 종료 날짜 선택 UI가 표시되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    // 반복 유형을 선택한 후
    fireEvent.click(screen.getByText('매일'));

    expect(screen.getByText('반복 종료')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 날짜')).toBeInTheDocument();
  });

  it('종료 날짜를 선택하면 onChange가 endDate와 함께 호출되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    // 반복 유형 선택
    fireEvent.click(screen.getByText('매일'));
    mockOnChange.mockClear();

    // 종료 날짜 선택
    const endDateInput = screen.getByLabelText('종료 날짜');
    fireEvent.change(endDateInput, { target: { value: '2025-12-31' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      type: RepeatType.DAILY,
      interval: 1,
      endDate: new Date('2025-12-31'),
    });
  });

  it('접근성 라벨이 올바르게 설정되어야 함', () => {
    render(<RecurringSelector onChange={mockOnChange} />);

    expect(screen.getByLabelText('반복 안함')).toBeInTheDocument();
    expect(screen.getByLabelText('매일')).toBeInTheDocument();
    expect(screen.getByLabelText('매주')).toBeInTheDocument();
    expect(screen.getByLabelText('매월')).toBeInTheDocument();
    expect(screen.getByLabelText('매년')).toBeInTheDocument();
  });
});
