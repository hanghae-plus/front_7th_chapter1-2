# Schedules Types Migration TODO

## 완료된 작업

- [x] schedules 타입 정의 마이그레이션 (수정 완료)
  - [x] ScheduleItemProps: 개별 일정 아이템 데이터 (event, notifiedEvents)
  - [x] ScheduleItemHandlerProps: 일정 아이템 액션 핸들러 (editEvent, deleteEvent)
  - [x] ScheduleListProps: 일정 목록 데이터 (searchTerm, filteredEvents, notifiedEvents)
  - [x] ScheduleListHandlerProps: 일정 목록 액션 핸들러 (setSearchTerm, editEvent, deleteEvent)
  - [x] EventProps 타입 충돌 해결 (DOM Event vs EventProps)
  - [x] 데이터/핸들러 분리 패턴 적용
  - [x] interface 이름 및 이벤트 핸들러 수정
- [x] 코드 리뷰 완료 (code-reviews/3-이전-과제-코드베이스-마이그레이션/migrate-schedules-types.md)
- [x] 이슈 파일 업데이트

## 완료된 전체 타입 마이그레이션

- [x] events 타입 (BasicFields, DetailFields, EventForm, EventFormHandlers, RepeatInfo 등)
- [x] calendars 타입 (CalendarHeader, Calendar, MonthView, WeekView, EventCard)
- [x] schedules 타입 (ScheduleItem, ScheduleList)
- [x] dialogs 타입 (OverlapDialog)
- [x] notifications 타입 (NotificationPanel)
- [x] constants 파일 (categories, holidays, notifications, weekdays)
- [x] styles 파일 (CSS-in-JS calendar styles)

## 다음 작업

- [ ] 컴포넌트 마이그레이션 (calendars, event-forms, schedules 디렉토리)
- [ ] 유틸리티 함수 마이그레이션
- [ ] 훅 마이그레이션
