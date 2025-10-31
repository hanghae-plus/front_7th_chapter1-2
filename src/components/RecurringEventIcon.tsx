// 반복 일정 아이콘 컴포넌트
import React, { memo, useMemo } from 'react';

import { recurringIconStyles } from '@/styles/recurringStyles';
import { RepeatInfoProps } from '@/types/events/RepeatInfo.types';
import {
  getRecurringIcon,
  getRecurringIconLabel,
  isRecurringEvent,
} from '@/utils/recurring/displayHelpers';

interface RecurringEventIconProps {
  repeatInfo?: RepeatInfoProps | null;
  size?: 'small' | 'medium' | 'large' | string;
  showTooltip?: boolean;
  className?: string;
  color?: string;
  disabled?: boolean;
}

export const RecurringEventIcon: React.FC<RecurringEventIconProps> = memo(
  ({
    repeatInfo,
    size = 'medium',
    showTooltip = true,
    className = '',
    color,
    disabled = false,
  }) => {
    // 메모이제이션으로 불필요한 재계산 방지 (조건부 호출 방지를 위해 상단으로 이동)
    const iconData = useMemo(
      () => ({
        icon: getRecurringIcon(repeatInfo),
        label: getRecurringIconLabel(repeatInfo),
      }),
      [repeatInfo]
    );

    // 스타일 메모이제이션 (조건부 호출 방지를 위해 상단으로 이동)
    const computedStyle = useMemo(() => {
      const isCustomSize =
        typeof size === 'string' &&
        !['small', 'medium', 'large'].includes(size);
      const styles = isCustomSize
        ? null
        : recurringIconStyles[size as keyof typeof recurringIconStyles];

      const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        cursor: showTooltip ? 'help' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease-in-out', // 부드러운 전환 효과
        // 접근성 향상: focus 상태 스타일
        '&:focus': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      };

      if (isCustomSize) {
        return {
          ...baseStyle,
          fontSize: size,
          color: color || '#1976d2',
          minWidth: size,
          minHeight: size,
        };
      }

      return {
        ...baseStyle,
        fontSize: styles?.fontSize,
        color: color || styles?.color,
        width: styles?.width,
        height: styles?.height,
        backgroundColor: styles?.backgroundColor,
      };
    }, [size, color, disabled, showTooltip]);

    // 반복 일정이 아닌 경우 렌더링하지 않음 (Hook 호출 후 조건부 리턴)
    if (!isRecurringEvent(repeatInfo)) {
      return null;
    }

    return (
      <span
        className={`recurring-event-icon ${className}`}
        style={computedStyle}
        aria-label={iconData.label}
        aria-describedby={showTooltip ? 'recurring-tooltip' : undefined}
        role="img"
        title={showTooltip ? iconData.label : undefined}
        tabIndex={showTooltip ? 0 : -1} // 키보드 네비게이션 지원
        onKeyDown={(e) => {
          // 엔터나 스페이스 키로 상호작용 가능
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // 툴팁 표시 또는 추가 동작 수행 가능
          }
        }}
      >
        {iconData.icon}
        {/* 스크린 리더를 위한 숨겨진 설명 */}
        {showTooltip && (
          <span
            id="recurring-tooltip"
            style={{
              position: 'absolute',
              left: '-10000px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            {iconData.label}
          </span>
        )}
      </span>
    );
  }
);

// 컴포넌트에 displayName 추가 (개발 도구에서 식별 용이)
RecurringEventIcon.displayName = 'RecurringEventIcon';

// 기본 export
export default RecurringEventIcon;
