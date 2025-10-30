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
import { useMemo, useState } from 'react';

import { CATEGORIES, NOTIFICATION_OPTIONS, REPEAT_TYPE_LABELS, WEEK_DAYS } from './constants';
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
import {
  expandRecurringEvents,
  splitRecurringEvent,
  validateRecurringConfig,
} from './utils/recurringUtils';
import { getTimeErrorMessage } from './utils/timeValidation';

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
        } as EventForm;
        await saveEvent(beforeEvent, { silent: true });
      }

      // 수정된 단일 이벤트 저장 (반복 설정 제거)
      const modifiedEvent: Event | EventForm = {
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
        } as EventForm;
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

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {WEEK_DAYS.map((day) => (
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
                    {expandedEvents
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        const isRepeating = event.repeat.type !== 'none';
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
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {isRepeating && <Repeat data-testid="repeat-icon" fontSize="small" />}
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
                {WEEK_DAYS.map((day) => (
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
                            {getEventsForDay(expandedEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              const isRepeating = event.repeat.type !== 'none';
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
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    {isRepeating && (
                                      <Repeat data-testid="repeat-icon" fontSize="small" />
                                    )}
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
              {CATEGORIES.map((cat) => (
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
              {NOTIFICATION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isRepeating && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel htmlFor="repeat-type">반복 유형</FormLabel>
                <Select
                  id="repeat-type"
                  size="small"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  aria-label="반복 유형"
                >
                  <MenuItem value="daily" aria-label="daily-option">
                    매일
                  </MenuItem>
                  <MenuItem value="weekly" aria-label="weekly-option">
                    매주
                  </MenuItem>
                  <MenuItem value="monthly" aria-label="monthly-option">
                    매월
                  </MenuItem>
                  <MenuItem value="yearly" aria-label="yearly-option">
                    매년
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
                <TextField
                  id="repeat-end-date"
                  size="small"
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                />
              </FormControl>
            </Stack>
          )}

          <Button
            data-testid="event-submit-button"
            onClick={addOrUpdateEvent}
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

          {expandedEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            expandedEvents.map((event) => (
              <Box
                key={`${event.id}-${event.date}`}
                sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {event.repeat.type !== 'none' && <Repeat data-testid="repeat-icon" />}
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
                        {REPEAT_TYPE_LABELS[event.repeat.type]}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Typography>
                    )}
                    <Typography>
                      알림:{' '}
                      {
                        NOTIFICATION_OPTIONS.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => handleEditEvent(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => handleDeleteEvent(event)}>
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

      <Dialog open={isRecurringEditDialogOpen} onClose={() => setIsRecurringEditDialogOpen(false)}>
        <DialogTitle>반복 일정 수정</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 수정하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsRecurringEditDialogOpen(false);
              // 전체 수정: editEvent 호출 + isRepeating = true
              if (targetEventForAction) {
                editEvent(targetEventForAction);
                setIsRepeating(true);
              }
            }}
          >
            아니오
          </Button>
          <Button
            onClick={() => {
              setIsRecurringEditDialogOpen(false);
              // 단일 수정: editEvent 호출 + isRepeating = false + 날짜 오버라이드
              if (targetEventForAction) {
                editEvent(targetEventForAction);
                setIsRepeating(false);
                // 클릭한 이벤트의 날짜로 오버라이드
                if (targetDateForAction) {
                  setDate(targetDateForAction);
                }
              }
            }}
          >
            예
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRecurringDeleteDialogOpen}
        onClose={() => setIsRecurringDeleteDialogOpen(false)}
      >
        <DialogTitle>반복 일정 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsRecurringDeleteDialogOpen(false);
              // 전체 삭제
              if (targetEventForAction) {
                deleteEvent(targetEventForAction.id);
              }
            }}
          >
            아니오
          </Button>
          <Button
            onClick={async () => {
              setIsRecurringDeleteDialogOpen(false);
              // 단일 삭제 - splitRecurringEvent 사용
              if (targetEventForAction && targetDateForAction) {
                // 1. 원본 반복 일정을 split (클릭한 날짜 기준)
                const { before, after } = splitRecurringEvent(
                  targetEventForAction,
                  targetDateForAction
                );

                // 2. 원본 삭제
                await deleteEvent(targetEventForAction.id);

                // 3. before가 있으면 저장
                if (before) {
                  const beforeEvent = {
                    ...targetEventForAction,
                    id: undefined,
                    repeat: {
                      ...targetEventForAction.repeat,
                      endDate: before,
                    },
                  } as EventForm;
                  await saveEvent(beforeEvent, { silent: true });
                }

                // 4. after가 있으면 저장
                if (after) {
                  const afterEvent = {
                    ...targetEventForAction,
                    id: undefined,
                    date: after,
                  } as EventForm;
                  await saveEvent(afterEvent, { silent: true });
                }

                await fetchEvents();
              }
            }}
          >
            예
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
    </Box>
  );
}

export default App;
