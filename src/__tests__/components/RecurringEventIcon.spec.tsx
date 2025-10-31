// 반복 일정 아이콘 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { RecurringEventIcon } from '@/components/RecurringEventIcon';
import { RepeatInfoProps } from '@/types/events/RepeatInfo.types';

describe('RecurringEventIcon 컴포넌트', () => {
  it('매일 반복 일정에 대해 올바른 아이콘을 렌더링해야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'daily',
      interval: 1,
    };

    render(<RecurringEventIcon repeatInfo={repeatInfo} />);

    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByLabelText('매일 반복 일정')).toBeInTheDocument();
  });

  it('매주 반복 일정에 대해 올바른 아이콘을 렌더링해야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'weekly',
      interval: 2,
    };

    render(<RecurringEventIcon repeatInfo={repeatInfo} />);

    expect(screen.getByText('📆')).toBeInTheDocument();
    expect(screen.getByLabelText('2주마다 반복 일정')).toBeInTheDocument();
  });

  it('매월 반복 일정에 대해 올바른 아이콘을 렌더링해야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'monthly',
      interval: 1,
    };

    render(<RecurringEventIcon repeatInfo={repeatInfo} />);

    expect(screen.getByText('🗓️')).toBeInTheDocument();
    expect(screen.getByLabelText('매월 반복 일정')).toBeInTheDocument();
  });

  it('매년 반복 일정에 대해 올바른 아이콘을 렌더링해야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'yearly',
      interval: 1,
    };

    render(<RecurringEventIcon repeatInfo={repeatInfo} />);

    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByLabelText('매년 반복 일정')).toBeInTheDocument();
  });

  it('반복 정보가 없으면 아무것도 렌더링하지 않아야 함', () => {
    const { container } = render(<RecurringEventIcon repeatInfo={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('none 타입 반복 정보에 대해 아무것도 렌더링하지 않아야 함', () => {
    const noneRepeat: RepeatInfoProps = {
      type: 'none',
      interval: 1,
    };

    const { container } = render(
      <RecurringEventIcon repeatInfo={noneRepeat} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('커스텀 크기가 적용되어야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'daily',
      interval: 1,
    };

    render(
      <RecurringEventIcon
        repeatInfo={repeatInfo}
        size="24px"
      />
    );

    const icon = screen.getByLabelText('매일 반복 일정');
    expect(icon).toHaveStyle({ fontSize: '24px' });
  });

  it('커스텀 색상이 적용되어야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'daily',
      interval: 1,
    };

    render(
      <RecurringEventIcon
        repeatInfo={repeatInfo}
        color="#ff0000"
      />
    );

    const icon = screen.getByLabelText('매일 반복 일정');
    expect(icon).toHaveStyle({ color: '#ff0000' });
  });

  it('disabled 상태가 적용되어야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'daily',
      interval: 1,
    };

    render(
      <RecurringEventIcon
        repeatInfo={repeatInfo}
        disabled
      />
    );

    const icon = screen.getByLabelText('매일 반복 일정');
    expect(icon).toHaveStyle({ opacity: '0.5' });
  });

  it('hover 상태에서 툴팁이 표시되어야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'daily',
      interval: 1,
    };

    render(
      <RecurringEventIcon
        repeatInfo={repeatInfo}
        showTooltip
      />
    );

    const icon = screen.getByLabelText('매일 반복 일정');
    expect(icon).toHaveAttribute('title', '매일 반복 일정');
  });

  it('접근성 속성이 올바르게 설정되어야 함', () => {
    const repeatInfo: RepeatInfoProps = {
      type: 'weekly',
      interval: 1,
    };

    render(<RecurringEventIcon repeatInfo={repeatInfo} />);

    const icon = screen.getByLabelText('매주 반복 일정');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', '매주 반복 일정');
  });
});
