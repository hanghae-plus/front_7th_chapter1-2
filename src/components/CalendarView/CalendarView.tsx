import { Stack, Typography } from '@mui/material';

import { CalendarNavigation } from './CalendarNavigation';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { Event } from '../../types';

interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onViewChange: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

/**
 * 캘린더 뷰 통합 컴포넌트
 * WeekView, MonthView, CalendarNavigation을 조합하여 표시
 */
export function CalendarView({
  view,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onViewChange,
  onNavigate,
}: CalendarViewProps) {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>

      <CalendarNavigation view={view} onViewChange={onViewChange} onNavigate={onNavigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </Stack>
  );
}
