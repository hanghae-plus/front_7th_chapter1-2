---
epic: repeat-schedule-indicator
test_suite: 주간 뷰 반복 아이콘 표시
---

# Story: 주간 뷰 반복 아이콘 표시

## 개요

주간 뷰에서 반복 일정의 이벤트 칩에 반복 아이콘을 타이틀 좌측에 표시하고, 알림 아이콘과의 순서를 보장합니다.

## Epic 연결

- **Epic**: 반복 일정 아이콘 표시 (Calendar Repeat Indicator)
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-indicator.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 1)에서 추출

## 테스트 구조 및 범위

- **테스트 스위트 (Describe Block):** '주간 뷰 반복 아이콘 표시'
  - **테스트 케이스 1:** '반복 일정이면 반복 아이콘이 타이틀 좌측에 표시된다'
  - **테스트 케이스 2:** '단일 일정이면 반복 아이콘이 표시되지 않는다'
  - **테스트 케이스 3:** '알림과 반복이 함께 있을 때 아이콘 순서가 [알림][반복][타이틀]이다'

## 검증 포인트 (Given-When-Then)

```
Given: 2025-01-06(월) 시작, 매주 반복, 간격 1, 타이틀 "주간 회의"
When: 해당 주(2025-01-05~2025-01-11) 주간 뷰 진입
Then: 월요일 셀의 "주간 회의" 칩 좌측에 반복 아이콘 표시, aria-label="반복 일정"

Given: 단일 일정(반복 아님), 타이틀 "1회 미팅"
When: 동일 주간 뷰 확인
Then: 해당 칩에 반복 아이콘 미표시

Given: 반복 + 알림 활성 일정
When: 동일 주간 뷰 확인
Then: 한 칩 내 아이콘 순서가 [알림] → [반복] → [타이틀] 임을 확인
```

## 테스트 데이터

| title      | date       | repeat.type | interval | notified | 예상 결과                                   |
| ---------- | ---------- | ----------- | -------- | -------- | -------------------------------------------- |
| 주간 회의  | 2025-01-06 | weekly      | 1        | false    | 반복 아이콘 표시                             |
| 1회 미팅   | 2025-01-07 | none        | -        | false    | 반복 아이콘 미표시                           |
| 알림 회의  | 2025-01-08 | weekly      | 1        | true     | [알림][반복][타이틀] 순서 유지               |

## 기술 참고사항

- 반복 아이콘: MUI `@mui/icons-material/Repeat`, `fontSize="small"`
- 테스트 셀렉터: `data-testid="repeat-icon"`
- 접근성: `aria-label="반복 일정"`
- 표시 조건: `event.repeat?.type && event.repeat.type !== 'none'`

