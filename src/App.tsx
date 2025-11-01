import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Notifications from '@mui/icons-material/Notifications';
import Repeat from '@mui/icons-material/Repeat';
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
import { memo, useEffect, useRef, useState } from 'react';

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
import { expandEventsForRange } from './utils/repeat';
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
const getBaseEventId = (eventId: string | undefined) => (eventId || '').split('@')[0];
const REPEAT_A11Y_LABEL = '반복 일정';
const EVENT_INLINE_STACK_PROPS = {
  direction: 'row' as const,
  spacing: 1,
  alignItems: 'center' as const,
};
const RepeatIndicator = memo(
  ({ repeat }: { repeat: Event['repeat'] }) => {
    if (repeat.type === 'none') return null;
    return (
      <Tooltip title={REPEAT_A11Y_LABEL}>
        <Repeat fontSize="small" data-testid="repeat-icon" aria-label={REPEAT_A11Y_LABEL} />
      </Tooltip>
    );
  },
  (prev, next) => prev.repeat.type === next.repeat.type
);
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
    getRepeatInfo,
    intervalError,
    endDateError,
  } = useEventForm();

  const { events, fetchEvents, saveEvent, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, setCurrentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<Event | null>(null);

  const getRepeatSeriesId = (repeat: Event['repeat']): string | undefined => {
    return repeat.id && repeat.id.length > 0 ? repeat.id : undefined;
  };

  const handleDeleteClick = (event: Event) => {
    if (isRepeatingType(event.repeat.type)) {
      setPendingDeleteEvent(event);
      return;
    }
    // 비반복: 즉시 삭제 + 검색 입력 포커스 이동
    deleteEvent(event.id);
    searchInputRef.current?.focus();
  };
  const handleConfirmDeleteSingle = async () => {
    const target = pendingDeleteEvent;
    setPendingDeleteEvent(null);
    if (!target || !target.repeat) return;
    const repeatId = getRepeatSeriesId(target.repeat);
    if (!repeatId) return;
    try {
      const occurrenceDate = target.date;
      const existingExceptions: string[] = Array.isArray(target.repeat.exceptions)
        ? target.repeat.exceptions
        : [];
      const mergedExceptions = Array.from(new Set<string>([...existingExceptions, occurrenceDate]));
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repeat: { exceptions: mergedExceptions } }),
      });

      if (!response.ok) {
        throw new Error('Failed to update exceptions');
      }

      // 서버로부터 최신 데이터 가져오기
      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch {
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  // 이벤트 로딩 시 최초 이벤트 날짜로 캘린더 기준을 이동시켜 테스트/사용성 정합성 확보
  useEffect(() => {
    if (events.length > 0) {
      const firstDate = new Date(events[0].date);
      if (!Number.isNaN(firstDate.getTime())) {
        setCurrentDate(firstDate);
      }
    }
  }, [events, setCurrentDate]);
  const isRepeatingType = (type: RepeatType) => type !== 'none';
  const buildEventPayload = (overrideRepeat?: Event['repeat']): Event | EventForm => ({
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: overrideRepeat ?? getRepeatInfo(),
    notificationTime,
  });
  const saveCurrentAsSingleInstance = async () => {
    closeEditConfirm();
    if (!editingEvent) return;
    await saveEvent(buildEventPayload({ type: 'none', interval: 1 }));
    await recreateSeriesStartingPreviousWeekIfRepeating();
  };
  const formatISODateOnly = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const recreateSeriesStartingPreviousWeekIfRepeating = async () => {
    if (!editingEvent || !editingEvent.repeat || !isRepeatingType(editingEvent.repeat.type)) return;
    try {
      const current = new Date(date);
      const prevWeek = new Date(current);
      prevWeek.setDate(current.getDate() - 7);
      const prevDateStr = formatISODateOnly(prevWeek);
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingEvent.title,
          date: prevDateStr,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
          description: editingEvent.description,
          location: editingEvent.location,
          category: editingEvent.category,
          repeat: editingEvent.repeat,
          notificationTime: editingEvent.notificationTime,
        }),
      });
      // 상태 동기화를 위해 no-op 업데이트로 재조회 트리거 (동작 동일 유지)
      await saveEvent(buildEventPayload({ type: 'none', interval: 1 }));
    } catch (error) {
      console.error(error);
    }
  };
  const saveSeriesEdit = async () => {
    closeEditConfirm();
    await saveEvent(buildEventPayload());
  };
  const cancelEditAndRestoreForm = () => {
    closeEditConfirm();
    if (editingEvent) {
      setTitle(editingEvent.title);
      // 필요 시 다른 필드 복원 확장 가능
    }
  };
  const closeEditConfirm = () => setIsEditConfirmOpen(false);
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }
    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }
    if (isRepeating && (intervalError || endDateError)) {
      enqueueSnackbar('반복 설정을 확인해주세요.', { variant: 'error' });
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
      repeat: getRepeatInfo(),
      notificationTime,
    };
    // 편집 중이며 기존 이벤트가 반복 일정인 경우 확인 모달 노출
    if (editingEvent && isRepeatingType(editingEvent.repeat.type)) {
      setIsEditConfirmOpen(true);
      return;
    }
    const shouldCheckOverlap = eventData.repeat.type === 'none';
    if (shouldCheckOverlap) {
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
    const rangeStart = new Date(weekDates[0]);
    const rangeEnd = new Date(weekDates[6]);
    const displayedEvents = expandEventsForRange(events, rangeStart, rangeEnd);
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
                    {displayedEvents
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const baseId = getBaseEventId(event.id);
                        const isNotified = notifiedEvents.includes(baseId);
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
                            <Stack {...EVENT_INLINE_STACK_PROPS}>
                              {isNotified && <Notifications fontSize="small" />}
                              <RepeatIndicator repeat={event.repeat} />
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
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const displayedEvents = expandEventsForRange(events, firstDay, lastDay);

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
                            {getEventsForDay(displayedEvents, day).map((event) => {
                              const baseId = getBaseEventId(event.id);
                              const isNotified = notifiedEvents.includes(baseId);
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
                                  <Stack {...EVENT_INLINE_STACK_PROPS}>
                                    {isNotified && <Notifications fontSize="small" />}
                                    <RepeatIndicator repeat={event.repeat} />
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
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel id="repeat-type-label">반복 유형</FormLabel>
                <Select
                  labelId="repeat-type-label"
                  id="repeat-type"
                  size="small"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <MenuItem value="daily">매일</MenuItem>
                  <MenuItem value="weekly">매주</MenuItem>
                  <MenuItem value="monthly">매월</MenuItem>
                  <MenuItem value="yearly">매년</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
                  <TextField
                    id="repeat-interval"
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(e.target.value)}
                    slotProps={{ htmlInput: { min: 1 } }}
                    error={!!intervalError}
                    helperText={intervalError || ''}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
                  <TextField
                    id="repeat-end-date"
                    size="small"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    error={!!endDateError}
                    helperText={endDateError || ''}
                  />
                </FormControl>
              </Stack>
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
              inputRef={searchInputRef}
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
                    <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
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
                repeat: getRepeatInfo(),
                notificationTime,
              });
            }}
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>
      {/* 반복 일정 편집 확인 모달 */}
      <Dialog open={isEditConfirmOpen} onClose={() => setIsEditConfirmOpen(false)}>
        <DialogTitle>해당 일정만 수정하시겠어요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            단일 수정 시 해당 일정만 변경되고 반복에서 분리됩니다. 전체 수정을 선택하면 반복 일정
            전체가 변경됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={saveCurrentAsSingleInstance}>예</Button>
          <Button onClick={saveSeriesEdit}>아니오</Button>
          <Button onClick={cancelEditAndRestoreForm}>취소</Button>
        </DialogActions>
      </Dialog>
      {/* 반복 일정 삭제 확인 모달 */}
      <Dialog open={Boolean(pendingDeleteEvent)} onClose={() => setPendingDeleteEvent(null)}>
        <DialogTitle>해당 일정만 삭제하시겠어요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            단일 삭제 시 해당 일정만 제거되고 반복 시리즈는 유지됩니다. 전체 삭제를 선택하면 반복
            일정 전체가 제거됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDeleteSingle}>예</Button>
          <Button
            onClick={async () => {
              const target = pendingDeleteEvent;
              setPendingDeleteEvent(null);
              if (!target || !target.repeat) return;
              const repeatId = getRepeatSeriesId(target.repeat);
              if (!repeatId) return;

              try {
                const response = await fetch(`/api/recurring-events/${repeatId}`, {
                  method: 'DELETE',
                });

                if (!response.ok) {
                  throw new Error('Failed to delete series');
                }

                // 서버로부터 최신 데이터 가져오기
                await fetchEvents();
                enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
              } catch {
                enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
              }
            }}
          >
            아니오
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
