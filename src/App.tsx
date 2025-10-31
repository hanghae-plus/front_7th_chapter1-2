import { Box, Stack } from '@mui/material';

import { Calendar } from './components/calendars/Calendar';
import { EventForm } from './components/events/EventForm';
import { NotificationPanel } from './components/NotificationPanel';
import { OverlapDialog } from './components/OverlapDialog';
import { ScheduleList } from './components/schedules/ScheduleList';
import { useAppState } from './hooks/useAppState';
import { UseAppStateReturn } from './types/hooks/UseAppState.types';

function App() {
  const {
    eventFormState,
    calendarState,
    searchState,
    submissionState,
    deleteEvent,
    notifications,
    notifiedEvents,
    setNotifications,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
  }: UseAppStateReturn = useAppState();

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack
        direction="row"
        spacing={6}
        sx={{ height: '100%' }}
      >
        <Stack
          spacing={2}
          sx={{ width: '20%' }}
        >
          <EventForm
            {...eventFormState}
            onSubmit={submissionState.addOrUpdateEvent}
          />
        </Stack>
        <Calendar
          {...calendarState}
          filteredEvents={searchState.filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={calendarState.holidays}
          onNavigate={calendarState.navigate}
        />
        <ScheduleList
          {...searchState}
          editEvent={eventFormState.editEvent}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      </Stack>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onContinue={submissionState.handleOverlapContinue}
      />
      <NotificationPanel
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </Box>
  );
}

export default App;
