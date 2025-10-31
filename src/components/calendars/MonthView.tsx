// Month view component displaying a full month calendar with events and holidays
// 일정과 공휴일이 포함된 전체 월간 캘린더를 표시하는 월간 뷰 컴포넌트

// Why Exceeds 80 lines:
// This component contains a significant amount of JSX structure to render the month view calendar,
// including table headers, rows, and cells for each day of the month, as well as event cards and holiday labels.
// The complexity of rendering a full month view with all its details naturally leads to a longer code length.

import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { CalendarEventCard } from './CalendarEventCard';

import { WEEK_DAYS } from '@/constants';
import { CALENDAR_STYLES } from '@/styles';
import { MonthViewProps } from '@/types/calendars/MonthViewProps.types';
import {
  formatDate,
  formatMonth,
  getEventsForDay,
  getWeeksAtMonth,
} from '@/utils/dateUtils';

export const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <Stack
      data-testid="month-view"
      spacing={4}
      sx={{ width: '100%' }}
    >
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
      <TableContainer>
        <Table sx={CALENDAR_STYLES.table}>
          <TableHead>
            <TableRow>
              {WEEK_DAYS.map((day) => (
                <TableCell
                  key={day}
                  sx={CALENDAR_STYLES.headerCell}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];

                  return (
                    <TableCell
                      key={dayIndex}
                      sx={CALENDAR_STYLES.monthDayCell}
                    >
                      {day && (
                        <>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                          >
                            {day}
                          </Typography>
                          {holiday && (
                            <Typography
                              variant="body2"
                              color="error"
                            >
                              {holiday}
                            </Typography>
                          )}
                          {getEventsForDay(filteredEvents, day).map((event) => (
                            <CalendarEventCard
                              key={event.id}
                              event={event}
                              isNotified={notifiedEvents.includes(event.id)}
                            />
                          ))}
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
