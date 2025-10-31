// Calendar component managing the display of week and month views
// 주간 및 월간 뷰 표시를 관리하는 캘린더 컴포넌트

import { Stack } from '@mui/material';

import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

import { CalendarProps } from '@/types/calendars/CalendarProps.types';

export const Calendar = ({
  view,
  setView,
  onNavigate,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: CalendarProps) => {
  return (
    <Stack
      flex={1}
      spacing={5}
    >
      <CalendarHeader
        view={view}
        setView={setView}
        onNavigate={onNavigate}
      />

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
};
