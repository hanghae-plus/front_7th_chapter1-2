import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView } from './components/CalendarView/CalendarView';
import { OverlapDialog } from './components/Dialogs/OverlapDialog';
import { EventForm } from './components/EventForm/EventForm';
import { EventList } from './components/EventList/EventList';
import { NotificationStack } from './components/Notifications/NotificationStack';
import { RecurrenceDeleteModal } from './components/RecurrenceDeleteModal';
import { RecurrenceEditModal } from './components/RecurrenceEditModal';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const [isRecurrenceEditModalOpen, setIsRecurrenceEditModalOpen] = useState(false);
  const [isRecurrenceDeleteModalOpen, setIsRecurrenceDeleteModalOpen] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<Event | EventFormType | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventFormType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
        recurrenceId: editingEvent?.repeat.recurrenceId,
      },
      notificationTime,
    };

    // Check if we're editing a recurring event
    if (editingEvent && editingEvent.repeat.type !== 'none') {
      setPendingEventData(eventData);
      setIsRecurrenceEditModalOpen(true);
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleRecurrenceEditConfirm = async (type: 'single' | 'all') => {
    setIsRecurrenceEditModalOpen(false);
    if (pendingEventData) {
      await saveEvent(pendingEventData, type);
      setPendingEventData(null);
      resetForm();
    }
  };

  const handleRecurrenceEditCancel = () => {
    setIsRecurrenceEditModalOpen(false);
    setPendingEventData(null);
  };

  const handleDeleteEvent = async (id: string) => {
    const event = events.find((e) => e.id === id);

    // Check if it's a recurring event
    if (event && event.repeat.type !== 'none') {
      setPendingDeleteId(id);
      setIsRecurrenceDeleteModalOpen(true);
      return;
    }

    // Delete single non-recurring event
    await deleteEvent(id);
  };

  const handleRecurrenceDeleteConfirm = async (type: 'single' | 'all') => {
    setIsRecurrenceDeleteModalOpen(false);
    if (pendingDeleteId) {
      await deleteEvent(pendingDeleteId, type);
      setPendingDeleteId(null);
    }
  };

  const handleRecurrenceDeleteCancel = () => {
    setIsRecurrenceDeleteModalOpen(false);
    setPendingDeleteId(null);
  };

  const handleOverlapConfirm = () => {
    setIsOverlapDialogOpen(false);
    saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventForm
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          onSubmit={addOrUpdateEvent}
        />

        <CalendarView
          view={view}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onViewChange={setView}
          onNavigate={navigate}
        />

        <EventList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditEvent={editEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </Stack>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={handleOverlapConfirm}
      />

      <NotificationStack
        notifications={notifications}
        onRemove={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />

      <RecurrenceEditModal
        isOpen={isRecurrenceEditModalOpen}
        onConfirm={handleRecurrenceEditConfirm}
        onCancel={handleRecurrenceEditCancel}
      />

      <RecurrenceDeleteModal
        isOpen={isRecurrenceDeleteModalOpen}
        onConfirm={handleRecurrenceDeleteConfirm}
        onCancel={handleRecurrenceDeleteCancel}
      />
    </Box>
  );
}

export default App;
