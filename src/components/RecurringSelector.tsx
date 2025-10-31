// 반복 유형 선택 컴포넌트
import React, { useState, useEffect } from 'react';

import { RECURRING_OPTIONS } from '@/constants/recurringOptions';
import { RecurringSelectorProps } from '@/types/recurring/ComponentProps.types';
import { RepeatType } from '@/types/recurring/RepeatType.types';
import {
  createRepeatTypeChangeHandler,
  createIntervalChangeHandler,
  createEndDateChangeHandler,
} from '@/utils/recurring/componentHandlers';

export const RecurringSelector: React.FC<RecurringSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  hideEndDate = false,
  maxEndDate = '2025-12-31',
  intervalMin = 1,
  intervalMax = 99,
}) => {
  const [repeatType, setRepeatType] = useState<RepeatType | 'none'>('none');
  const [interval, setInterval] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (value) {
      setRepeatType(value.type);
      setInterval(value.interval);
      setEndDate(
        value.endDate ? value.endDate.toISOString().split('T')[0] : ''
      );
    } else {
      setRepeatType('none');
      setInterval(1);
      setEndDate('');
    }
  }, [value]);

  useEffect(() => {
    if (!value) onChange(null);
  }, []);

  const handleRepeatTypeChange = createRepeatTypeChangeHandler(
    setRepeatType,
    onChange,
    interval,
    endDate
  );
  const handleIntervalChange = createIntervalChangeHandler(
    setInterval,
    onChange,
    repeatType,
    endDate,
    intervalMin,
    intervalMax
  );
  const handleEndDateChange = createEndDateChangeHandler(
    setEndDate,
    onChange,
    repeatType,
    interval
  );

  return (
    <div
      data-testid="recurring-selector"
      className={className}
    >
      <fieldset
        role="group"
        aria-labelledby="recurring-legend"
      >
        <legend id="recurring-legend">반복 설정</legend>
        {RECURRING_OPTIONS.map(({ value: optValue, label }) => (
          <label key={optValue}>
            <input
              type="radio"
              value={optValue}
              checked={repeatType === optValue}
              onChange={(e) =>
                handleRepeatTypeChange(e.target.value as RepeatType | 'none')
              }
              disabled={disabled}
              aria-label={label}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {repeatType !== 'none' && (
        <>
          <label htmlFor="interval-input">
            반복 간격
            <input
              id="interval-input"
              type="number"
              min={intervalMin}
              max={intervalMax}
              value={interval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
              disabled={disabled}
              data-testid="interval-input"
              aria-label="간격"
            />
          </label>
          {!hideEndDate && (
            <label htmlFor="end-date-input">
              반복 종료
              <input
                id="end-date-input"
                type="date"
                value={endDate}
                max={maxEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                disabled={disabled}
                data-testid="end-date-input"
                aria-label="종료 날짜"
              />
            </label>
          )}
        </>
      )}
    </div>
  );
};
