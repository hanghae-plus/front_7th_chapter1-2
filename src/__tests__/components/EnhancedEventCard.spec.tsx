// 향상된 이벤트 카드 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EnhancedEventCard } from '@/components/EnhancedEventCard';
import { EventProps } from '@/types/events/Event.types';

describe('EnhancedEventCard 컴포넌트', () => {
  const baseEvent: EventProps = {
    id: '1',
    title: '테스트 일정',
    date: '2024-10-29',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  };

  it('반복 일정에 대해 반복 아이콘이 표시되어야 함', () => {
    const recurringEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    };

    render(
      <EnhancedEventCard
        event={recurringEvent}
        isNotified={false}
      />
    );

    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByLabelText('매일 반복 일정')).toBeInTheDocument();
    expect(screen.getByText('테스트 일정')).toBeInTheDocument();
  });

  it('일반 일정에 대해 반복 아이콘이 표시되지 않아야 함', () => {
    render(
      <EnhancedEventCard
        event={baseEvent}
        isNotified={false}
      />
    );

    expect(screen.queryByLabelText(/반복 일정/)).not.toBeInTheDocument();
    expect(screen.getByText('테스트 일정')).toBeInTheDocument();
  });

  it('알림이 있는 반복 일정에 대해 두 아이콘이 모두 표시되어야 함', () => {
    const recurringEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'weekly',
        interval: 1,
      },
    };

    render(
      <EnhancedEventCard
        event={recurringEvent}
        isNotified={true}
      />
    );

    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
    expect(screen.getByText('📆')).toBeInTheDocument();
    expect(screen.getByLabelText('매주 반복 일정')).toBeInTheDocument();
  });

  it('매월 반복 일정의 아이콘이 올바르게 표시되어야 함', () => {
    const monthlyEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'monthly',
        interval: 2,
      },
    };

    render(
      <EnhancedEventCard
        event={monthlyEvent}
        isNotified={false}
      />
    );

    expect(screen.getByText('🗓️')).toBeInTheDocument();
    expect(screen.getByLabelText('2개월마다 반복 일정')).toBeInTheDocument();
  });

  it('매년 반복 일정의 아이콘이 올바르게 표시되어야 함', () => {
    const yearlyEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'yearly',
        interval: 1,
      },
    };

    render(
      <EnhancedEventCard
        event={yearlyEvent}
        isNotified={false}
      />
    );

    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByLabelText('매년 반복 일정')).toBeInTheDocument();
  });

  it('반복 일정 카드에 스타일이 적용되어야 함', () => {
    const recurringEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    };

    const { container } = render(
      <EnhancedEventCard
        event={recurringEvent}
        isNotified={false}
      />
    );

    const cardContainer = container.querySelector('.enhanced-event-card');
    expect(cardContainer).toHaveStyle('position: relative');
  });

  it('반복 아이콘이 올바른 위치에 배치되어야 함', () => {
    const recurringEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    };

    const { container } = render(
      <EnhancedEventCard
        event={recurringEvent}
        isNotified={true}
      />
    );

    const iconContainer = container.querySelector(
      '[style*="position: absolute"]'
    );
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveStyle('top: 4px');
    expect(iconContainer).toHaveStyle('right: 4px');
  });

  it('접근성 속성이 올바르게 설정되어야 함', () => {
    const recurringEvent: EventProps = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    };

    render(
      <EnhancedEventCard
        event={recurringEvent}
        isNotified={false}
      />
    );

    const recurringIcon = screen.getByLabelText('매일 반복 일정');
    expect(recurringIcon).toHaveAttribute('role', 'img');
  });
});
