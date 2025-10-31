---
**문서 유형**: [AI]  
**목적**: 파일 트리 및 각 파일의 책임 매핑  
**주요 내용**: src/ 디렉토리 구조와 각 파일의 한 줄 책임 설명  
**관련 문서**: [function-index.json](./function-index.json)  
**최종 수정일**: 2025-10-29
---

# 프로젝트 구조

## src/ 디렉토리 트리

```
src/
├── apis/
│   └── fetchHolidays.ts              # 공휴일 데이터 조회
├── hooks/
│   ├── useCalendarView.ts            # 캘린더 뷰 상태 관리 (월/주 전환, 날짜 네비게이션)
│   ├── useEventForm.ts               # 일정 폼 상태 관리 및 유효성 검사
│   ├── useEventOperations.ts         # 일정 CRUD API 호출 및 상태 관리
│   ├── useNotifications.ts           # 알림 시스템 상태 관리 및 주기적 체크
│   └── useSearch.ts                  # 일정 검색 및 필터링 로직
├── utils/
│   ├── dateUtils.ts                  # 날짜 계산, 포맷팅, 주/월 범위 계산
│   ├── eventOverlap.ts               # 일정 시간 중복 감지 로직
│   ├── eventUtils.ts                 # 일정 검색 및 날짜 범위 필터링
│   ├── notificationUtils.ts          # 알림 메시지 생성 및 대상 이벤트 필터링
│   └── timeValidation.ts             # 시작/종료 시간 유효성 검사
├── __tests__/
│   ├── hooks/
│   │   ├── easy.useCalendarView.spec.ts      # useCalendarView 훅 단위 테스트
│   │   ├── easy.useSearch.spec.ts            # useSearch 훅 단위 테스트
│   │   ├── medium.useEventOperations.spec.ts # useEventOperations 훅 통합 테스트
│   │   └── medium.useNotifications.spec.ts   # useNotifications 훅 통합 테스트
│   ├── unit/
│   │   ├── easy.dateUtils.spec.ts            # 날짜 유틸리티 함수 단위 테스트
│   │   ├── easy.eventOverlap.spec.ts         # 일정 중복 감지 로직 단위 테스트
│   │   ├── easy.eventUtils.spec.ts           # 일정 검색/필터링 함수 단위 테스트
│   │   ├── easy.fetchHolidays.spec.ts        # 공휴일 조회 함수 단위 테스트
│   │   ├── easy.notificationUtils.spec.ts    # 알림 유틸리티 함수 단위 테스트
│   │   └── easy.timeValidation.spec.ts       # 시간 유효성 검사 단위 테스트
│   ├── medium.integration.spec.tsx           # 일정 CRUD 통합 테스트
│   └── utils.ts                              # 테스트 헬퍼 함수
├── __mocks__/
│   ├── handlers.ts                   # MSW API 모킹 핸들러
│   ├── handlersUtils.ts              # 핸들러 유틸리티 함수
│   └── response/
│       ├── events.json               # 테스트용 이벤트 목 데이터
│       └── realEvents.json           # 실제 이벤트 목 데이터
├── App.tsx                           # 메인 애플리케이션 컴포넌트
├── main.tsx                          # 애플리케이션 진입점
├── types.ts                          # TypeScript 타입 정의 (Event, EventForm, RepeatInfo 등)
├── setupTests.ts                     # 테스트 환경 설정
└── vite-env.d.ts                     # Vite 환경 타입 정의
```
