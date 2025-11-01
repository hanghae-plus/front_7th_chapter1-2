import {
  Notifications,
  ChevronLeft,
  ChevronRight,
  Delete,
  Edit,
  Close,
  Repeat,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { RecurringEventDialog } from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from './utils/dateUtils';
import { findOverlappingEvents } from './utils/eventOverlap';
import { getTimeErrorMessage } from './utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

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

  const { events, saveEvent, deleteEvent, deleteEventSeries } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [editMode, setEditMode] = useState<'single' | 'series' | undefined>(undefined);

  const { enqueueSnackbar } = useSnackbar();

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation state
  const getRepeatEndDateError = (): string | null => {
    if (!repeatType || repeatType === 'none') {
      return null;
    }

    if (!repeatEndDate) {
      // Only show "required" error after submit attempt
      return submitAttempted ? '반복 종료일을 입력해주세요' : null;
    }

    // Show validation errors immediately when date is typed
    const maxDate = new Date('2025-12-31');
    const endDate = new Date(repeatEndDate);
    const startDate = new Date(date);

    if (endDate > maxDate) {
      return '반복 종료일은 2025년 12월 31일을 초과할 수 없습니다';
    }

    if (endDate <= startDate) {
      return '반복 종료일은 시작일 이후여야 합니다';
    }

    return null;
  };

  const repeatEndDateError = getRepeatEndDateError();

  // Button is disabled only for errors that are currently visible
  const isFormValid = !startTimeError && !endTimeError && !repeatEndDateError;

  const handleEditClick = (event: Event) => {
    // Check if it's a recurring event with repeat.id
    if (event.repeat.type !== 'none' && event.repeat.id) {
      setPendingEvent(event);
      setRecurringDialogMode('edit');
      setRecurringDialogOpen(true);
    } else {
      editEvent(event);
    }
  };

  const handleDeleteClick = (event: Event) => {
    // Check if it's a recurring event with repeat.id
    if (event.repeat.type !== 'none' && event.repeat.id) {
      setPendingEvent(event);
      setRecurringDialogMode('delete');
      setRecurringDialogOpen(true);
    } else {
      deleteEvent(event.id);
    }
  };

  const handleRecurringDialogSingle = () => {
    setRecurringDialogOpen(false);

    if (!pendingEvent) return;

    if (recurringDialogMode === 'edit') {
      // Edit single event - use setTimeout to ensure dialog closes first
      setEditMode('single');
      setTimeout(() => {
        editEvent(pendingEvent);
      }, 0);
    } else {
      // Delete single event
      deleteEvent(pendingEvent.id);
      setPendingEvent(null);
    }
  };

  const handleRecurringDialogSeries = () => {
    setRecurringDialogOpen(false);

    if (!pendingEvent) return;

    if (recurringDialogMode === 'edit') {
      // Edit entire series - set editing state with series mode
      setEditMode('series');
      setTimeout(() => {
        editEvent(pendingEvent);
      }, 0);
    } else {
      // Delete entire series
      if (pendingEvent.repeat.id) {
        deleteEventSeries(pendingEvent.repeat.id);
      }
      setPendingEvent(null);
    }
  };

  const addOrUpdateEvent = async () => {
    setSubmitAttempted(true);

    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    // Check repeat end date validation (including required check after submit attempt)
    if (repeatType && repeatType !== 'none' && !repeatEndDate) {
      enqueueSnackbar('반복 종료일을 입력해주세요.', { variant: 'error' });
      return;
    }

    if (repeatEndDateError) {
      enqueueSnackbar('반복 종료일을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
        id: editingEvent?.repeat?.id, // Preserve repeat.id when editing
      },
      notificationTime,
    };

    // Skip overlap detection for recurring events
    const isRecurringEvent = eventData.repeat.type !== 'none';
    const overlapping = isRecurringEvent ? [] : findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      // Check if we have an editMode set (from recurring dialog)
      if (editMode) {
        await saveEvent(eventData, { editMode });
        setEditMode(undefined);
        setPendingEvent(null);
      } else {
        await saveEvent(eventData);
      }
      resetForm();
      setSubmitAttempted(false);
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
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
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {date.getDate()}
                    </Typography>
                    {filteredEvents
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        return (
                          <Box
                            key={event.id}
                            sx={{
                              p: 0.5,
                              my: 0.5,
                              backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                              borderRadius: 1,
                              fontWeight: isNotified ? 'bold' : 'normal',
                              color: isNotified ? '#d32f2f' : 'inherit',
                              minHeight: '18px',
                              width: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              {isNotified && <Notifications fontSize="small" />}
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                              >
                                {event.title}
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
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
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(filteredEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              return (
                                <Box
                                  key={event.id}
                                  sx={{
                                    p: 0.5,
                                    my: 0.5,
                                    backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                    borderRadius: 1,
                                    fontWeight: isNotified ? 'bold' : 'normal',
                                    color: isNotified ? '#d32f2f' : 'inherit',
                                    minHeight: '18px',
                                    width: '100%',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {isNotified && <Notifications fontSize="small" />}
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                    >
                                      {event.title}
                                    </Typography>
                                  </Stack>
                                </Box>
                              );
                            })}
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

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {!recurringDialogOpen && (
          <Stack spacing={2} sx={{ width: '20%' }}>
            <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

            <FormControl fullWidth>
              <FormLabel htmlFor="title">제목</FormLabel>
              <TextField
                id="title"
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel htmlFor="date">날짜</FormLabel>
              <TextField
                id="date"
                size="small"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <FormLabel htmlFor="start-time">시작 시간</FormLabel>
                <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
                  <TextField
                    id="start-time"
                    size="small"
                    type="time"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    onBlur={() => getTimeErrorMessage(startTime, endTime)}
                    error={!!startTimeError}
                  />
                </Tooltip>
              </FormControl>
              <FormControl fullWidth>
                <FormLabel htmlFor="end-time">종료 시간</FormLabel>
                <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
                  <TextField
                    id="end-time"
                    size="small"
                    type="time"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    onBlur={() => getTimeErrorMessage(startTime, endTime)}
                    error={!!endTimeError}
                  />
                </Tooltip>
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <FormLabel htmlFor="description">설명</FormLabel>
              <TextField
                id="description"
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel htmlFor="location">위치</FormLabel>
              <TextField
                id="location"
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel id="category-label">카테고리</FormLabel>
              <Select
                id="category"
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-labelledby="category-label"
                aria-label="카테고리"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel htmlFor="notification">알림 설정</FormLabel>
              <Select
                id="notification"
                size="small"
                value={notificationTime}
                onChange={(e) => setNotificationTime(Number(e.target.value))}
              >
                {notificationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel id="repeat-type-label">반복 유형</FormLabel>
                <Select
                  id="repeat-type"
                  size="small"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  aria-labelledby="repeat-type-label"
                  aria-label="반복 유형"
                >
                  <MenuItem value="none" aria-label="없음-option">
                    반복 안함
                  </MenuItem>
                  <MenuItem value="daily" aria-label="매일-option">
                    매일
                  </MenuItem>
                  <MenuItem value="weekly" aria-label="매주-option">
                    매주
                  </MenuItem>
                  <MenuItem value="monthly" aria-label="매월-option">
                    매월
                  </MenuItem>
                  <MenuItem value="yearly" aria-label="매년-option">
                    매년
                  </MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel>반복 간격</FormLabel>
                  <TextField
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
                  <TextField
                    id="repeat-end-date"
                    size="small"
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    error={!!repeatEndDateError}
                    helperText={repeatEndDateError}
                  />
                </FormControl>
              </Stack>
            </Stack>

            <Button
              data-testid="event-submit-button"
              onClick={addOrUpdateEvent}
              variant="contained"
              color="primary"
              disabled={!isFormValid}
            >
              {editingEvent ? '일정 수정' : '일정 추가'}
            </Button>
          </Stack>
        )}

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
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
            <IconButton aria-label="Next" onClick={() => navigate('next')}>
              <ChevronRight />
            </IconButton>
          </Stack>

          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </Stack>

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
              <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                      {event.repeat.type !== 'none' && event.repeat.id && (
                        <Repeat color="action" fontSize="small" aria-label="반복 일정" />
                      )}
                      <Typography
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                      >
                        {event.title}
                      </Typography>
                    </Stack>
                    <Typography>{event.date}</Typography>
                    <Typography>
                      {event.startTime} - {event.endTime}
                    </Typography>
                    <Typography>{event.description}</Typography>
                    <Typography>{event.location}</Typography>
                    <Typography>카테고리: {event.category}</Typography>
                    {event.repeat.type !== 'none' && (
                      <Typography>
                        반복: {event.repeat.interval}
                        {event.repeat.type === 'daily' && '일'}
                        {event.repeat.type === 'weekly' && '주'}
                        {event.repeat.type === 'monthly' && '월'}
                        {event.repeat.type === 'yearly' && '년'}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Typography>
                    )}
                    <Typography>
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => handleEditClick(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => handleDeleteClick(event)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Typography key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Typography>
            ))}
            계속 진행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
          <Button
            color="error"
            onClick={() => {
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
                  type: repeatType,
                  interval: repeatInterval,
                  endDate: repeatEndDate || undefined,
                },
                notificationTime,
              });
            }}
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>

      <RecurringEventDialog
        open={recurringDialogOpen}
        mode={recurringDialogMode}
        onClose={() => {
          setRecurringDialogOpen(false);
          setPendingEvent(null);
          setEditMode(undefined);
        }}
        onSingle={handleRecurringDialogSingle}
        onSeries={handleRecurringDialogSeries}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
