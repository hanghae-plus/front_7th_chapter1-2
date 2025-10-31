// Schedule list component to display and search events
// 일정 목록 컴포넌트

import {
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ScheduleCard } from './ScheduleCard';

import {
  ScheduleListHandlerProps,
  ScheduleListProps,
} from '@/types/schedules/ScheduleListProps.types';

export const ScheduleList = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: ScheduleListProps & ScheduleListHandlerProps) => {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <FormControl fullWidth>
        <FormLabel htmlFor="search">일정 검색</FormLabel>
        <TextField
          id="search"
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <ScheduleCard
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
          />
        ))
      )}
    </Stack>
  );
};
