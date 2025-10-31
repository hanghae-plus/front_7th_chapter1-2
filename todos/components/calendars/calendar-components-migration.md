# Calendar Components Migration TODO

## 완료된 작업

- [x] Calendar 컴포넌트 마이그레이션
  - [x] Calendar.tsx: 주간/월간 뷰 통합 관리 컴포넌트
  - [x] CalendarHeader.tsx: 뷰 전환 및 네비게이션 헤더
  - [x] MonthView.tsx: 월간 캘린더 뷰 (이벤트, 공휴일 표시)
  - [x] WeekView.tsx: 주간 캘린더 뷰 (이벤트 표시)
  - [x] CalendarEventCard.tsx: 캘린더 내 이벤트 카드 컴포넌트
- [x] TypeScript 엄격 타입 적용 (기존 타입 시스템과 통합)
- [x] Material-UI 컴포넌트 일관된 사용
- [x] 80줄 제한 규칙 준수 (MonthView는 복잡한 캘린더 렌더링으로 초과, 주석으로 이유 명시)
- [x] Import/Export 순서 표준화
- [x] 코드 리뷰 완료 (code-reviews/3-이전-과제-코드베이스-마이그레이션/migrate-calendar-components.md)
- [x] 이슈 파일 업데이트

## 다음 작업

- [ ] Event Forms 컴포넌트 마이그레이션 (event-forms 디렉토리)
- [ ] Schedules 컴포넌트 마이그레이션 (schedules 디렉토리)
- [ ] 기타 컴포넌트 마이그레이션 (EventForm, NotificationPanel, OverlapDialog, ScheduleList)
