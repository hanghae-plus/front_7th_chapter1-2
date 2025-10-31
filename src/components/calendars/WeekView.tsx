// Week view component displaying a week calendar with events
// 일정이 포함된 주간 캘린더를 표시하는 주간 뷰 컴포넌트

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
import { WeekViewProps } from '@/types/calendars/WeekViewProps.types';
import { formatWeek, getWeekDates } from '@/utils/dateUtils';

export const WeekView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <Stack
      data-testid="week-view"
      spacing={4}
      sx={{ width: '100%' }}
    >
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
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
            <TableRow>
              {weekDates.map((date) => (
                <TableCell
                  key={date.toISOString()}
                  sx={CALENDAR_STYLES.dayCell}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >
                    {date.getDate()}
                  </Typography>
                  {filteredEvents
                    .filter(
                      (event) =>
                        new Date(event.date).toDateString() ===
                        date.toDateString()
                    )
                    .map((event) => (
                      <CalendarEventCard
                        key={event.id}
                        event={event}
                        isNotified={notifiedEvents.includes(event.id)}
                      />
                    ))}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
