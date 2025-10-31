// 향상된 이벤트 카드 컴포넌트 (반복 아이콘 포함)
import React, { memo, useMemo } from 'react';

import { RecurringEventIcon } from './RecurringEventIcon';

import { CalendarEventCard } from '@/components/calendars/CalendarEventCard';
import {
  recurringCardStyles,
  recurringBadgePosition,
} from '@/styles/recurringStyles';
import { EventProps } from '@/types/events/Event.types';
import { isRecurringEvent } from '@/utils/recurring/displayHelpers';

interface EnhancedEventCardProps {
  event: EventProps;
  isNotified?: boolean;
}

export const EnhancedEventCard: React.FC<EnhancedEventCardProps> = memo(
  ({ event, isNotified = false }) => {
    // 반복 일정 여부 메모이제이션
    const isRecurring = useMemo(
      () => isRecurringEvent(event.repeat),
      [event.repeat]
    );

    // 카드 스타일 메모이제이션
    const cardStyle = useMemo(
      () => ({
        position: 'relative' as const,
        ...(isRecurring ? recurringCardStyles : {}),
        // 접근성 향상: 포커스 및 호버 상태
        '&:focus-within': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
        // 반응형 여백 조정
        '@media (max-width: 480px)': {
          margin: '2px 0',
        },
      }),
      [isRecurring]
    );

    // 반복 아이콘 props 메모이제이션
    const iconProps = useMemo(
      () => ({
        repeatInfo: event.repeat,
        size: 'small' as const,
        showTooltip: true,
      }),
      [event.repeat]
    );

    return (
      <div
        className="enhanced-event-card"
        style={cardStyle}
        role="article" // 의미론적 역할 추가
        aria-label={
          isRecurring
            ? `반복 일정: ${event.title}`
            : `일반 일정: ${event.title}`
        }
      >
        {/* 반복 일정 아이콘 */}
        {isRecurring && (
          <div
            style={recurringBadgePosition}
            role="img"
            aria-label="반복 일정 표시"
          >
            <RecurringEventIcon {...iconProps} />
          </div>
        )}

        {/* 기존 캘린더 이벤트 카드 */}
        <CalendarEventCard
          event={event}
          isNotified={isNotified}
        />
      </div>
    );
  },
  // 최적화된 비교 함수 - 필요한 props만 비교
  (prevProps, nextProps) => {
    return (
      prevProps.event.id === nextProps.event.id &&
      prevProps.event.repeat?.type === nextProps.event.repeat?.type &&
      prevProps.event.repeat?.interval === nextProps.event.repeat?.interval &&
      prevProps.isNotified === nextProps.isNotified
    );
  }
);

// 컴포넌트에 displayName 추가 (개발 도구에서 식별 용이)
EnhancedEventCard.displayName = 'EnhancedEventCard';

export default EnhancedEventCard;
