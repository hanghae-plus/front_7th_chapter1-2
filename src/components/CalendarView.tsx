import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';

import { Event } from '../types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

interface CalendarViewProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function CalendarView({
  view,
  setView,
  currentDate,
  events,
  notifiedEvents,
  holidays,
  onNavigate,
}: CalendarViewProps) {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>

      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <IconButton aria-label="Previous" onClick={() => onNavigate('prev')}>
          <ChevronLeft />
        </IconButton>
        <Select
          size="small"
          aria-label="뷰 타입 선택"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <MenuItem value="week" aria-label="week-option">
            Week
          </MenuItem>
          <MenuItem value="month" aria-label="month-option">
            Month
          </MenuItem>
        </Select>
        <IconButton aria-label="Next" onClick={() => onNavigate('next')}>
          <ChevronRight />
        </IconButton>
      </Stack>

      {view === 'week' && (
        <WeekView currentDate={currentDate} events={events} notifiedEvents={notifiedEvents} />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </Stack>
  );
}
