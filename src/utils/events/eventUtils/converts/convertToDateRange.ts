// Converts event date and time strings to Date objects
// 일정의 날짜 및 시간 문자열을 Date 객체로 변환합니다.

import { EventProps } from '@/types/events/Event.types';
import { EventFormProps } from '@/types/events/EventForm.types';
import { parseDateTime } from '@/utils/events/eventUtils/converts/parseDateTime';

export function convertEventToDateRange({
  date,
  startTime,
  endTime,
}: EventProps | EventFormProps) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}
