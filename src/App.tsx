import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Edit';
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
import { useState } from 'react';

import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types';
// import { Event, EventForm } from './types';
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

  const { events, saveEvent, deleteEvent, fetchEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isEditSingleDialogOpen, setIsEditSingleDialogOpen] = useState(false);
  const [pendingEditEvent, setPendingEditEvent] = useState<Event | null>(null);
  const [isEditingAllSeries, setIsEditingAllSeries] = useState(false);
  const [isDeleteSingleDialogOpen, setIsDeleteSingleDialogOpen] = useState(false);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<Event | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  // 반복 일정 생성 함수
  const generateRecurringEvents = (
    baseEvent: Event | EventForm,
    repeatType: RepeatType,
    repeatInterval: number,
    repeatEndDate: string
  ): (Event | EventForm)[] => {
    const events: (Event | EventForm)[] = [];
    const startDate = new Date(baseEvent.date);
    const endDate = new Date(repeatEndDate);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      events.push({
        ...baseEvent,
        date: currentDate.toISOString().split('T')[0],
      });

      // 반복 간격에 따라 다음 날짜 계산
      const nextDate = new Date(currentDate);
      switch (repeatType) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + repeatInterval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7 * repeatInterval);
          break;
        case 'monthly': {
          // 월말 대응: 원본 일자의 일(day)을 유지하되, 그 일이 없으면 스킵
          const originalDay = startDate.getDate();
          nextDate.setMonth(nextDate.getMonth() + repeatInterval);
          nextDate.setDate(originalDay);

          // 설정한 날짜가 해당 월에 존재하지 않으면 스킵 (예: 2월 31일 -> 날짜가 3월이 됨)
          if (nextDate.getDate() !== originalDay) {
            // 월말이 원본 일자보다 작은 경우, 해당 월을 건너뛰고 다음 달 계산
            currentDate = nextDate;
            continue;
          }
          break;
        }
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + repeatInterval);
          break;
      }

      currentDate = nextDate;
    }

    return events;
  };

  const handleEditClick = (event: Event) => {
    // 반복 일정인지 확인
    if (event.repeat.type !== 'none') {
      setPendingEditEvent(event);
      setIsEditSingleDialogOpen(true);
    } else {
      editEvent(event);
    }
  };

  const handleEditSingleConfirm = (editSingleOnly: boolean) => {
    setIsEditSingleDialogOpen(false);
    if (pendingEditEvent) {
      if (editSingleOnly) {
        // 해당 일정만 수정 - repeat type을 none으로 변경
        const modifiedEvent = {
          ...pendingEditEvent,
          repeat: { type: 'none' as const, interval: 0 },
        };
        setIsEditingAllSeries(false);
        editEvent(modifiedEvent);
      } else {
        // 전체 시리즈 수정
        setIsEditingAllSeries(true);
        editEvent(pendingEditEvent);
      }
      setPendingEditEvent(null);
    }
  };

  const handleDeleteClick = (event: Event) => {
    // 반복 일정인지 확인
    if (event.repeat.type !== 'none') {
      setPendingDeleteEvent(event);
      setIsDeleteSingleDialogOpen(true);
    } else {
      deleteEvent(event.id);
    }
  };

  const handleDeleteSingleConfirm = (deleteAllSeries: boolean) => {
    setIsDeleteSingleDialogOpen(false);
    if (pendingDeleteEvent) {
      if (deleteAllSeries) {
        // 전체 시리즈 삭제
        deleteAllSeriesEvents(pendingDeleteEvent);
      } else {
        // 해당 일정만 삭제
        deleteEvent(pendingDeleteEvent.id);
      }
      setPendingDeleteEvent(null);
    }
  };

  // 반복 시리즈의 모든 이벤트를 삭제하는 함수
  const deleteAllSeriesEvents = async (eventToDelete: Event) => {
    try {
      // 같은 반복 시리즈에 속한 모든 이벤트 찾기
      const seriesEvents = events.filter(
        (event) =>
          event.repeat.type === eventToDelete.repeat.type &&
          event.repeat.type !== 'none' &&
          event.repeat.interval === eventToDelete.repeat.interval &&
          event.startTime === eventToDelete.startTime &&
          event.endTime === eventToDelete.endTime
      );

      // 시리즈의 모든 이벤트 삭제
      for (const event of seriesEvents) {
        await fetch(`/api/events/${event.id}`, {
          method: 'DELETE',
        });
      }

      await fetchEvents(); // 이벤트 목록 새로고침
      enqueueSnackbar('반복 일정 시리즈가 모두 삭제되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting series:', error);
      enqueueSnackbar('시리즈 삭제 실패', { variant: 'error' });
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
    };

    // 반복일정은 일정 겹침을 고려하지 않음
    if (!isRepeating) {
      const overlapping = findOverlappingEvents(eventData, events);
      if (overlapping.length > 0) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }
    }

    // 전체 시리즈 수정 모드인 경우
    if (isEditingAllSeries && editingEvent) {
      await saveAllSeriesEvents(eventData as Event);
      setIsEditingAllSeries(false);
    } else if (isRepeating && !editingEvent && repeatEndDate) {
      // 반복 일정 생성 (새로운 일정, 반복 유형 선택됨, 종료일 지정됨)
      const recurringEvents = generateRecurringEvents(
        eventData,
        repeatType,
        repeatInterval,
        repeatEndDate
      );

      // /api/events-list로 여러 이벤트 저장
      try {
        const response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: recurringEvents }),
        });

        if (!response.ok) {
          throw new Error('Failed to save recurring events');
        }

        await fetchEvents();
        resetForm();
        enqueueSnackbar('일정이 추가되었습니다.', { variant: 'success' });
      } catch (error) {
        console.error('Error saving recurring events:', error);
        enqueueSnackbar('일정 저장 실패', { variant: 'error' });
      }
    } else {
      await saveEvent(eventData);
    }
    resetForm();
  };

  // 반복 시리즈의 모든 이벤트를 업데이트하는 함수
  const saveAllSeriesEvents = async (updatedEvent: Event) => {
    try {
      // 같은 반복 시리즈에 속한 모든 이벤트 찾기
      const seriesEvents = events.filter(
        (event) =>
          event.id !== updatedEvent.id &&
          event.repeat.type === updatedEvent.repeat.type &&
          event.repeat.type !== 'none' &&
          event.startTime === editingEvent?.startTime &&
          event.endTime === editingEvent?.endTime
      );

      // 업데이트된 이벤트 자신 먼저 업데이트
      await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      // 시리즈의 다른 모든 이벤트들도 업데이트
      for (const event of seriesEvents) {
        const updatedSeriesEvent: Event = {
          ...event,
          title: updatedEvent.title,
          description: updatedEvent.description,
          location: updatedEvent.location,
          category: updatedEvent.category,
          repeat: updatedEvent.repeat,
          notificationTime: updatedEvent.notificationTime,
        };

        await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSeriesEvent),
        });
      }

      await fetchEvents(); // 이벤트 목록 새로고침
      enqueueSnackbar('반복 일정 시리즈가 모두 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating series:', error);
      enqueueSnackbar('시리즈 수정 실패', { variant: 'error' });
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
                        const isRepeating = event.repeat.type !== 'none';
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
                              {isRepeating && <Repeat fontSize="small" data-testid="repeat-icon" />}
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
                              const isRepeating = event.repeat.type !== 'none';
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
                                    {isRepeating && (
                                      <Repeat fontSize="small" data-testid="repeat-icon" />
                                    )}
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

          {/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
          {isRepeating && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel id="repeat-type-label">반복 유형</FormLabel>
                <Select
                  labelId="repeat-type-label"
                  aria-label="반복 유형"
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

      <Dialog open={isEditSingleDialogOpen} onClose={() => setIsEditSingleDialogOpen(false)}>
        <DialogTitle>반복 일정 수정</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 수정하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditSingleConfirm(false)}>아니오</Button>
          <Button onClick={() => handleEditSingleConfirm(true)} color="primary">
            예
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteSingleDialogOpen} onClose={() => setIsDeleteSingleDialogOpen(false)}>
        <DialogTitle>반복 일정 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDeleteSingleConfirm(true)}>아니오</Button>
          <Button onClick={() => handleDeleteSingleConfirm(false)} color="error">
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
