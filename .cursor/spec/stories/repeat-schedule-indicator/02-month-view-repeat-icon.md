---
epic: repeat-schedule-indicator
test_suite: 월간 뷰 반복 아이콘 표시
---

# Story: 월간 뷰 반복 아이콘 표시

## 개요

월간 뷰에서 반복 일정의 이벤트 칩에 반복 아이콘을 타이틀 좌측에 표시하며, 31일 미존재 월 등의 전개 규칙과 정합성을 확인합니다.

## Epic 연결

- **Epic**: 반복 일정 아이콘 표시 (Calendar Repeat Indicator)
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-indicator.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 2)에서 추출

## 테스트 구조 및 범위

- **테스트 스위트 (Describe Block):** '월간 뷰 반복 아이콘 표시'
  - **테스트 케이스 1:** '매일 반복 일정은 해당 월의 모든 날짜 칩에서 반복 아이콘이 표시된다'
  - **테스트 케이스 2:** '매월 31일 반복은 2월에는 표시되지 않는다(31일 없음)'

## 검증 포인트 (Given-When-Then)

```
Given: 2025-01-01 시작, 매일 반복, 간격 1, 타이틀 "데일리 체크"
When: 2025-01 월간 뷰 진입
Then: 해당 월의 각 날짜 셀 내 "데일리 체크" 칩 좌측에 반복 아이콘 표시

Given: 31일 매월 반복 일정, 시작일 2025-01-31
When: 2025-02 월간 뷰 진입
Then: 2월에는 일정이 표시되지 않으며(31일 없음), 따라서 반복 아이콘도 표시되지 않음
```

## 테스트 데이터

| title          | start      | repeat.type | interval | month     | expected                                    |
| -------------- | ---------- | ----------- | -------- | --------- | ------------------------------------------- |
| 데일리 체크    | 2025-01-01 | daily       | 1        | 2025-01   | 매 날짜 칩에 반복 아이콘 표시                |
| 월말 정기 점검 | 2025-01-31 | monthly     | 1        | 2025-02   | 표시 없음(31일 없음), 아이콘도 미표시        |

## 기술 참고사항

- 월간 뷰 셀 데이터: `getEventsForDay(displayedEvents, day)`
- 반복 아이콘: MUI `@mui/icons-material/Repeat`, `fontSize="small"`
- 테스트 셀렉터: `data-testid="repeat-icon"`
- 접근성: `aria-label="반복 일정"`

