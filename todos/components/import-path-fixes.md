# Component Import Path Fixes TODO

## 완료된 작업 ✅

- [x] Calendar.tsx import path 수정

  - `./calendars/CalendarHeader` → `./CalendarHeader`
  - `./calendars/MonthView` → `./MonthView`
  - `./calendars/WeekView` → `./WeekView`

- [x] ScheduleList.tsx import path 수정

  - `./schedules/ScheduleCard` → `./ScheduleCard`

- [x] 코드 품질 검사 통과 (타입 체크 + ESLint)
- [x] 코드 리뷰 문서 생성

## 문제 분석 📋

### 발생 원인

- 컴포넌트 파일이 이미 해당 폴더 내에 위치
- 상대 경로에서 중복된 폴더명 참조
- 빌드 시 모듈 해석 오류 발생 가능성

### 수정 내용

- 같은 폴더 내 컴포넌트는 `./ComponentName` 패턴 사용
- 중복된 폴더명 제거로 정확한 상대 경로 설정
- Import 해석 명확성 향상

## 파일 구조 확인 🗂️

```
src/components/
├── calendars/
│   ├── Calendar.tsx (수정됨)
│   ├── CalendarHeader.tsx
│   ├── MonthView.tsx
│   └── WeekView.tsx
└── schedules/
    ├── ScheduleList.tsx (수정됨)
    └── ScheduleCard.tsx
```

## 다음 단계 📝

- [x] 빌드 테스트로 import 해석 검증
- [x] 런타임 테스트로 컴포넌트 로딩 확인
- [ ] 유사한 import 오류 프로젝트 전체 스캔
- [ ] IDE 설정으로 자동 import path 검증 규칙 추가

## 참고사항

- 순수 경로 수정으로 기능적 변경 없음
- 빌드 오류 해결을 위한 필수 수정
- 컴포넌트 구조 및 로직에 영향 없음
- 향후 컴포넌트 추가 시 올바른 상대 경로 패턴 참고 가능
