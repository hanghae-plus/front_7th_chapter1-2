import CalendarMonth from '@mui/icons-material/CalendarMonth';
import CalendarViewWeek from '@mui/icons-material/CalendarViewWeek';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import Notifications from '@mui/icons-material/Notifications';
import Repeat from '@mui/icons-material/Repeat';
import Today from '@mui/icons-material/Today';
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

import EditOptionsDialog from './components/EditOptionsDialog';
import Modal from './components/Modal';
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
import { shouldAllowOverlapBypass } from './utils/overlapBypassLogic';
import { getTimeErrorMessage } from './utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const repeatTypeOptions = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

/**
 * Get appropriate icon component based on repeat type
 * 반복 타입에 따라 적절한 아이콘 컴포넌트 반환
 */
const getRepeatIcon = (repeatType: RepeatType) => {
  switch (repeatType) {
    case 'daily':
      return Today;
    case 'weekly':
      return CalendarViewWeek;
    case 'monthly':
      return CalendarMonth;
    case 'yearly':
      return EventIcon;
    default:
      return Repeat;
  }
};

const getRepeatBackgroundColor = (repeatType: RepeatType, isNotified: boolean): string => {
  // Notification takes priority
  // <!-- 알림이 최우선 -->
  if (isNotified) return '#ffebee';

  switch (repeatType) {
    case 'daily':
      return '#e3f2fd'; // Light blue
    case 'weekly':
      return '#f3e5f5'; // Light purple
    case 'monthly':
      return '#fff3e0'; // Light orange
    case 'yearly':
      return '#e8f5e9'; // Light green
    case 'none':
    default:
      return '#f5f5f5'; // Gray (non-repeating)
  }
};

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
    // setRepeatInterval, // TODO: Add interval UI
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

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [allowBypass, setAllowBypass] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOptionsDialogOpen, setIsEditOptionsDialogOpen] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);
  const [isDeleteOptionsDialogOpen, setIsDeleteOptionsDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

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

    // Validate repeat end date is required for repeating events
    // <!-- 반복 일정의 경우 종료 날짜 필수 검증 -->
    if (isRepeating && !repeatEndDate) {
      enqueueSnackbar('반복 일정의 종료 날짜를 선택해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = editingEvent
      ? {
          // Editing: Preserve original event with metadata
          // <!-- 수정: 메타데이터를 포함한 원본 이벤트 보존 -->
          ...editingEvent,
          title,
          date,
          startTime,
          endTime,
          description,
          location,
          category,
          repeat: {
            ...editingEvent.repeat, // Preserve metadata
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate,
          },
          notificationTime,
        }
      : {
          // Creating new event
          // <!-- 새 이벤트 생성 -->
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
            endDate: repeatEndDate,
          },
          notificationTime,
        };

    // Check if editing recurring event
    // <!-- 반복 일정 수정 여부 확인 -->
    if (editingEvent && editingEvent.repeat.type !== 'none') {
      setPendingEventData(eventData);
      setIsEditOptionsDialogOpen(true);
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      const canBypass = shouldAllowOverlapBypass(eventData, overlapping);
      setOverlappingEvents(overlapping);
      setAllowBypass(canBypass);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleEditSingle = async () => {
    if (!pendingEventData) return;

    const originalEvent = pendingEventData as Event;

    setIsEditOptionsDialogOpen(false);
    setPendingEventData(null);

    try {
      // Update this specific instance only (keep repeat metadata)
      // <!-- 이 특정 인스턴스만 업데이트 (반복 메타데이터 유지) -->

      // Check for overlaps with the updated event data
      // <!-- 업데이트된 이벤트 데이터로 오버랩 체크 -->
      const remainingEvents = events.filter((e) => e.id !== originalEvent.id);
      const overlapping = findOverlappingEvents(pendingEventData, remainingEvents);

      if (overlapping.length > 0) {
        const canBypass = shouldAllowOverlapBypass(pendingEventData, overlapping);
        if (!canBypass) {
          setOverlappingEvents(overlapping);
          setAllowBypass(false);
          setIsOverlapDialogOpen(true);
          return;
        }
      }

      // Update the specific instance via PUT (preserves repeat metadata)
      // <!-- PUT을 통해 특정 인스턴스 업데이트 (반복 메타데이터 보존) -->
      const response = await fetch(`/api/events/${originalEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingEventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
      setEditingEvent(null);
      resetForm();
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error editing single instance:', error);
      enqueueSnackbar('일정 수정 실패', { variant: 'error' });
    }
  };

  const handleEditAll = async () => {
    if (!pendingEventData || !editingEvent) return;

    const repeatId = editingEvent.repeat?.id;

    if (!repeatId) {
      // Not a recurring event with repeatId, fallback to single edit
      // <!-- repeatId 없는 반복 이벤트, 단일 수정으로 폴백 -->
      await handleEditSingle();
      return;
    }

    // Prepare update data (without id, but include repeat metadata with endDate)
    // <!-- 수정 데이터 준비 (id 제외, repeat 메타데이터와 endDate 포함) -->
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...baseUpdateData } = pendingEventData as Event;

    // Include repeat metadata with updated endDate
    // <!-- 업데이트된 endDate를 포함한 repeat 메타데이터 포함 -->
    const updatePayload = {
      ...baseUpdateData,
      repeat: {
        type: editingEvent.repeat.type,
        interval: editingEvent.repeat.interval,
        id: repeatId,
        endDate: (pendingEventData as Event).repeat.endDate,
      },
    };

    setIsEditOptionsDialogOpen(false);
    setPendingEventData(null);

    try {
      // Update all instances in the recurring series
      // <!-- 반복 시리즈의 모든 인스턴스 업데이트 -->
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update recurring series');
      }

      await fetchEvents();
      setEditingEvent(null);
      resetForm();
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating all instances:', error);
      enqueueSnackbar('일정 수정 실패', { variant: 'error' });
    }
  };

  const handleCloseEditOptions = () => {
    setIsEditOptionsDialogOpen(false);
    setPendingEventData(null);
  };

  const handleDeleteSingle = async () => {
    if (!eventToDelete) return;

    // For instance model: delete only this specific event instance
    // <!-- 인스턴스 모델: 이 특정 이벤트 인스턴스만 삭제 -->
    await deleteEvent(eventToDelete.id);

    setIsDeleteOptionsDialogOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteAll = async () => {
    if (!eventToDelete) return;

    try {
      // For instance model: delete all events with same repeat.id
      // <!-- 인스턴스 모델: 같은 repeat.id를 가진 모든 이벤트 삭제 -->
      const repeatId = eventToDelete.repeat?.id;

      if (repeatId) {
        const response = await fetch(`/api/recurring-events/${repeatId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete recurring series');
        }

        await fetchEvents();
        enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
      } else {
        // Fallback for non-recurring events
        // <!-- 반복하지 않는 이벤트의 폴백 -->
        await deleteEvent(eventToDelete.id);
      }

      setIsDeleteOptionsDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting all instances:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      setIsDeleteOptionsDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleCloseDeleteOptions = () => {
    setIsDeleteOptionsDialogOpen(false);
    setEventToDelete(null);
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
                              backgroundColor: getRepeatBackgroundColor(
                                event.repeat?.type || 'none',
                                isNotified
                              ),
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
                              {event.repeat.type !== 'none' &&
                                (() => {
                                  const RepeatIconComponent = getRepeatIcon(event.repeat.type);
                                  return (
                                    <RepeatIconComponent
                                      fontSize="small"
                                      data-testid="RepeatIcon"
                                    />
                                  );
                                })()}
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
                                    backgroundColor: getRepeatBackgroundColor(
                                      event.repeat?.type || 'none',
                                      isNotified
                                    ),
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
                                    {event.repeat.type !== 'none' &&
                                      (() => {
                                        const RepeatIconComponent = getRepeatIcon(
                                          event.repeat.type
                                        );
                                        return (
                                          <RepeatIconComponent
                                            fontSize="small"
                                            data-testid="RepeatIcon"
                                          />
                                        );
                                      })()}
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

          {isRepeating && (
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
                {repeatTypeOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    aria-label={`${option.label}-option`}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isRepeating && (
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-end-date" required>
                반복 종료 날짜
              </FormLabel>
              <TextField
                id="repeat-end-date"
                type="date"
                size="small"
                required
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
                error={repeatEndDate !== '' && date !== '' && repeatEndDate < date}
                helperText={
                  repeatEndDate !== '' && date !== '' && repeatEndDate < date
                    ? '종료 날짜는 시작 날짜 이후여야 합니다'
                    : '반복 일정의 종료 날짜를 선택해주세요 (필수)'
                }
              />
            </FormControl>
          )}

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
          {/* {isRepeating && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel>반복 유형</FormLabel>
                <Select
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
                  <FormLabel>반복 종료일</FormLabel>
                  <TextField
                    size="small"
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </Stack>
            </Stack>
          )} */}

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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">일정 보기</Typography>
            <Button variant="outlined" onClick={() => setIsModalOpen(true)}>
              모달 열기
            </Button>
          </Stack>

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
                        fontWeight="bold"
                        fontSize="18px"
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
                    <IconButton
                      aria-label="Delete event"
                      onClick={() => {
                        if (event.repeat?.type !== 'none') {
                          setEventToDelete(event);
                          setIsDeleteOptionsDialogOpen(true);
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
            {allowBypass
              ? '다음 일정과 겹칩니다:'
              : '다음 일정과 겹칩니다. 다른 시간을 선택해주세요.'}
            {overlappingEvents.map((event) => (
              <Typography key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Typography>
            ))}
            {allowBypass && '반복 일정과 일반 일정이 겹칩니다. 계속 진행하시겠습니까?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
          {allowBypass && (
            <Button
              color="error"
              onClick={async () => {
                setIsOverlapDialogOpen(false);
                await saveEvent(
                  editingEvent
                    ? {
                        ...editingEvent,
                        title,
                        date,
                        startTime,
                        endTime,
                        description,
                        location,
                        category,
                        repeat: {
                          ...editingEvent.repeat,
                          type: isRepeating ? repeatType : 'none',
                          interval: repeatInterval,
                          endDate: repeatEndDate,
                        },
                        notificationTime,
                      }
                    : {
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
                          endDate: repeatEndDate,
                        },
                        notificationTime,
                      }
                );
                resetForm();
              }}
            >
              계속 진행
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <EditOptionsDialog
        open={isEditOptionsDialogOpen}
        onClose={handleCloseEditOptions}
        onEditSingle={handleEditSingle}
        onEditAll={handleEditAll}
      />

      <EditOptionsDialog
        open={isDeleteOptionsDialogOpen}
        onClose={handleCloseDeleteOptions}
        onEditSingle={handleDeleteSingle}
        onEditAll={handleDeleteAll}
        title="해당 일정만 삭제하시겠어요?"
        message="'예'를 선택하면 이 일정만 삭제되고, '아니오'를 선택하면 모든 반복 일정이 삭제됩니다."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
