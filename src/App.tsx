import {
  Notifications,
  ChevronLeft,
  ChevronRight,
  Delete,
  Edit,
  Close,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
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

import { RepeatOptions } from './components/RepeatOptions.tsx'; // New import
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
// import { Event, EventForm, RepeatType } from './types';
import { Event, EventForm } from './types';
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
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    daysOfWeek,
    setDaysOfWeek,
    dayOfMonth,
    setDayOfMonth,
    monthOfYear,
    setMonthOfYear,
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

  const { events, addOrUpdateEvent, deleteEvent, detachEventFromSeries } = useEventOperations(
    Boolean(editingEvent),
    () => {
      setEditingEvent(null);
      setEditingSeriesId(null); // Reset series ID on save
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, listEvents, calendarEvents, setSearchTerm } = useSearch(
    events,
    currentDate,
    view
  );
  console.log('calendarEvents', calendarEvents);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [editingSeriesEvent, setEditingSeriesEvent] = useState<Event | null>(null);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [deletingSeriesEvent, setDeletingSeriesEvent] = useState<Event | null>(null); // New state for delete confirmation dialog // New state for series editing

  const { enqueueSnackbar } = useSnackbar();

  const handleEditRecurringEvent = (event: Event) => {
    if (event.seriesId) {
      setEditingSeriesEvent(event);
    } else {
      editEvent(event);
    }
  };

  const submitEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const repeatOptions = isRepeating
      ? {
          type: repeatType,
          interval: repeatInterval,
          endDate: repeatEndDate || undefined,
          daysOfWeek: repeatType === 'weekly' ? daysOfWeek : undefined,
          dayOfMonth: repeatType === 'monthly' || repeatType === 'yearly' ? dayOfMonth : undefined,
          monthOfYear: repeatType === 'yearly' ? monthOfYear : undefined,
        }
      : { type: 'none', interval: 0 };

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: repeatOptions,
      notificationTime,
      seriesId: editingEvent?.seriesId,
    };

    const overlapping = findOverlappingEvents(eventData, listEvents);
    if (overlapping.length > 0 && !editingSeriesId) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await addOrUpdateEvent(eventData, editingSeriesId);
      resetForm();
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
                    {calendarEvents
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        return (
                          <Box
                            key={`${event.id}${event.seriesId}${event.startTime}${event.endTime}`}
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
                            {getEventsForDay(calendarEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              return (
                                <Box
                                  key={`${event.id}-${event.date}`}
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

          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                />
              }
              label="반복 일정"
            />
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

          {isRepeating && (
            <RepeatOptions
              repeatType={repeatType}
              setRepeatType={setRepeatType}
              repeatInterval={repeatInterval}
              setRepeatInterval={setRepeatInterval}
              repeatEndDate={repeatEndDate}
              setRepeatEndDate={setRepeatEndDate}
              daysOfWeek={daysOfWeek}
              setDaysOfWeek={setDaysOfWeek}
              dayOfMonth={dayOfMonth}
              setDayOfMonth={setDayOfMonth}
              monthOfYear={monthOfYear}
              setMonthOfYear={setMonthOfYear}
            />
          )}

          <Button
            data-testid="event-submit-button"
            onClick={submitEvent}
            variant="contained"
            color="primary"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </Stack>

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

          {listEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            listEvents.map((event, index) => (
              <Box
                key={`${event.id}-${event.date}-${index}`}
                sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {event.seriesId && <ReplayIcon data-testid="ReplayIcon" />}
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
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
                    <IconButton
                      aria-label={`Edit event ${event.title}`}
                      onClick={() => handleEditRecurringEvent(event)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete event ${event.title}`}
                      onClick={() => {
                        console.log('[DEBUG] Deleting Event:', event); // 디버깅 로그 추가
                        if (event.seriesId) {
                          setDeletingSeriesEvent(event);
                        } else {
                          deleteEvent(event.id);
                        }
                      }}
                    >
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
              <Typography key={event.id} component="span" display="block">
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
              addOrUpdateEvent({
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
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* 반복 일정 수정 확인 다이얼로그 */}
      <Dialog
        open={Boolean(editingSeriesEvent)}
        onClose={() => setEditingSeriesEvent(null)}
        aria-labelledby="edit-recurring-event-dialog-title"
      >
        <DialogTitle id="edit-recurring-event-dialog-title">일정 수정 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 수정하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              if (editingSeriesEvent) {
                await detachEventFromSeries(editingSeriesEvent.id);
                editEvent(editingSeriesEvent);
              }
              setEditingSeriesEvent(null);
            }}
          >
            예
          </Button>
          <Button
            onClick={() => {
              if (editingSeriesEvent) {
                setEditingSeriesId(editingSeriesEvent.seriesId);
                editEvent(editingSeriesEvent);
              }
              setEditingSeriesEvent(null);
            }}
          >
            아니오
          </Button>
        </DialogActions>
      </Dialog>
      {/* 반복 일정 삭제 확인 다이얼로그 */}
      <Dialog
        open={Boolean(deletingSeriesEvent)}
        onClose={() => setDeletingSeriesEvent(null)}
        aria-labelledby="delete-recurring-event-dialog-title"
      >
        <DialogTitle id="delete-recurring-event-dialog-title">일정 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              if (deletingSeriesEvent) {
                await deleteEvent(deletingSeriesEvent.id);
              }
              setDeletingSeriesEvent(null);
            }}
          >
            예
          </Button>
          <Button
            onClick={async () => {
              if (deletingSeriesEvent?.seriesId) {
                // TODO: 전체 시리즈 삭제 로직 구현 (다음 스토리에서)
                console.log(`Deleting entire series: ${deletingSeriesEvent.seriesId}`);
              }
              setDeletingSeriesEvent(null);
            }}
          >
            아니오
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
