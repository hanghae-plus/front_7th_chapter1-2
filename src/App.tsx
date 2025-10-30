import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationPanel } from './components/NotificationPanel';
import { OverlapDialog } from './components/OverlapDialog';
import { RecurringDeleteDialog } from './components/RecurringDeleteDialog';
import { RecurringEditDialog } from './components/RecurringEditDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormData } from './types';
import { getWeekDates } from './utils/dateUtils';
import { findOverlappingEvents } from './utils/eventOverlap';
import {
  expandRecurringEvents,
  splitRecurringEvent,
  validateRecurringConfig,
} from './utils/recurringUtils';

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

  const { events, fetchEvents, saveEvent, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const getViewRange = () => {
    if (view === 'week') {
      const weekDates = getWeekDates(currentDate);
      return {
        start: weekDates[0],
        end: weekDates[6],
      };
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    }
  };

  // 반복 일정 전개 - useMemo로 최적화하여 의존성 변경 시에만 재계산
  const expandedEvents = useMemo(() => {
    const { start, end } = getViewRange();
    return expandRecurringEvents(filteredEvents, start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEvents, currentDate, view]);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringEditDialogOpen, setIsRecurringEditDialogOpen] = useState(false);
  const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState(false);
  const [targetEventForAction, setTargetEventForAction] = useState<Event | null>(null);
  const [targetDateForAction, setTargetDateForAction] = useState<string | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleEditEvent = (event: Event) => {
    // 원본 이벤트 찾기 (expandedEvents에서 온 경우를 대비)
    const originalEvent = events.find((e) => e.id === event.id) || event;

    if (originalEvent.repeat.type !== 'none') {
      // 반복 일정이면 즉시 다이얼로그 표시
      setTargetEventForAction(originalEvent);
      setTargetDateForAction(event.date); // 클릭한 이벤트의 날짜 저장
      setIsRecurringEditDialogOpen(true);
    } else {
      // 일반 일정이면 바로 편집 모드
      editEvent(originalEvent);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    // 원본 이벤트 찾기
    const originalEvent = events.find((e) => e.id === event.id) || event;

    if (originalEvent.repeat.type !== 'none') {
      setTargetEventForAction(originalEvent);
      setTargetDateForAction(event.date); // 클릭한 이벤트의 날짜 저장
      setIsRecurringDeleteDialogOpen(true);
    } else {
      deleteEvent(originalEvent.id);
    }
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    // 반복 일정 유효성 검증
    if (isRepeating) {
      const validation = validateRecurringConfig(date, {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      });

      if (!validation.isValid) {
        enqueueSnackbar(validation.errorMessage || '반복 일정 설정이 올바르지 않습니다.', {
          variant: 'error',
        });
        return;
      }
    }

    const eventData: Event | EventFormData = {
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
      repeatGroupId:
        editingEvent?.repeatGroupId ||
        (isRepeating ? `group-${Date.now()}-${Math.random()}` : undefined),
    };

    // PRD v5: 단일 인스턴스 수정 처리
    if (
      editingEvent &&
      editingEvent.repeat.type !== 'none' &&
      !isRepeating &&
      targetDateForAction
    ) {
      // 단일 수정: splitRecurringEvent 사용
      // 폼의 date 상태를 사용 (사용자가 선택한 날짜)
      const { before, after } = splitRecurringEvent(editingEvent, targetDateForAction);

      // 원본 삭제
      await deleteEvent(editingEvent.id, { silent: true });

      // before 저장 (silent)
      if (before) {
        const beforeEvent = {
          ...targetEventForAction,
          id: undefined,
          repeat: {
            ...editingEvent.repeat,
            endDate: before,
          },
          repeatEndDate: before,
        } as EventFormData;
        await saveEvent(beforeEvent, { silent: true });
      }

      // 수정된 단일 이벤트 저장 (반복 설정 제거)
      const modifiedEvent: Event | EventFormData = {
        ...eventData,
        id: undefined, // 새 ID 생성
        repeat: { type: 'none', interval: 1 },
        repeatGroupId: undefined,
      };
      await saveEvent(modifiedEvent, { silent: true });

      // after 저장 (silent)
      if (after) {
        const afterEvent = {
          ...targetEventForAction,
          id: undefined,
          date: after,
        } as EventFormData;
        await saveEvent(afterEvent, { silent: true });
      }

      await fetchEvents();
      resetForm();
      setEditingEvent(null);
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
      return;
    }

    // 반복 일정은 겹침 검사 제외
    if (!isRepeating) {
      const overlapping = findOverlappingEvents(eventData, events);
      if (overlapping.length > 0) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }
    }

    await saveEvent(eventData);
    resetForm();
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
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={Boolean(editingEvent)}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          onSubmit={addOrUpdateEvent}
        />

        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          events={expandedEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onNavigate={navigate}
        />

        <EventList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          events={expandedEvents}
          notifiedEvents={notifiedEvents}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </Stack>

      <OverlapDialog
        open={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={() => {
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
        }}
      />

      <RecurringEditDialog
        open={isRecurringEditDialogOpen}
        onClose={() => setIsRecurringEditDialogOpen(false)}
        onEditAll={() => {
          setIsRecurringEditDialogOpen(false);
          if (targetEventForAction) {
            editEvent(targetEventForAction);
            setIsRepeating(true);
          }
        }}
        onEditSingle={() => {
          setIsRecurringEditDialogOpen(false);
          if (targetEventForAction) {
            editEvent(targetEventForAction);
            setIsRepeating(false);
            if (targetDateForAction) {
              setDate(targetDateForAction);
            }
          }
        }}
      />

      <RecurringDeleteDialog
        open={isRecurringDeleteDialogOpen}
        onClose={() => setIsRecurringDeleteDialogOpen(false)}
        onDeleteAll={() => {
          setIsRecurringDeleteDialogOpen(false);
          if (targetEventForAction) {
            deleteEvent(targetEventForAction.id);
          }
        }}
        onDeleteSingle={async () => {
          setIsRecurringDeleteDialogOpen(false);
          if (targetEventForAction && targetDateForAction) {
            const { before, after } = splitRecurringEvent(
              targetEventForAction,
              targetDateForAction
            );

            await deleteEvent(targetEventForAction.id);

            if (before) {
              const beforeEvent = {
                ...targetEventForAction,
                id: undefined,
                repeat: {
                  ...targetEventForAction.repeat,
                  endDate: before,
                },
              } as EventFormData;
              await saveEvent(beforeEvent, { silent: true });
            }

            if (after) {
              const afterEvent = {
                ...targetEventForAction,
                id: undefined,
                date: after,
              } as EventFormData;
              await saveEvent(afterEvent, { silent: true });
            }

            await fetchEvents();
          }
        }}
      />

      <NotificationPanel
        notifications={notifications}
        onDismiss={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </Box>
  );
}

export default App;
