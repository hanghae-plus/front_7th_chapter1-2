---
epic: repeat-schedule-indicator
test_suite: 아이콘 순서 및 레이아웃
---

# Story: 아이콘 우선순위 및 레이아웃

## 개요

알림 아이콘과 반복 아이콘이 함께 표기될 때 좌→우 순서 및 크기/정렬/간격의 일관성을 검증합니다.

## Epic 연결

- **Epic**: 반복 일정 아이콘 표시 (Calendar Repeat Indicator)
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-indicator.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 4)에서 추출

## 테스트 구조 및 범위

- **테스트 스위트 (Describe Block):** '아이콘 순서 및 레이아웃'
  - **테스트 케이스 1:** '아이콘 순서가 [알림][반복][타이틀]이다'
  - **테스트 케이스 2:** '두 아이콘이 동일 크기(small)로 렌더링된다'
  - **테스트 케이스 3:** '수직 정렬(center), 간격(spacing=1)이 유지된다'

## 검증 포인트 (Given-When-Then)

```
Given: 알림 + 반복이 모두 활성인 일정 칩
When: 주/월 뷰에서 렌더링 확인
Then: [알림][반복][타이틀] 순서, 아이콘 크기/정렬/간격이 일관적임
```

## 테스트 데이터

| title       | repeat.type | interval | notified | expected                           |
| ----------- | ----------- | -------- | -------- | ---------------------------------- |
| 팀 공지     | daily       | 1        | true     | [알림][반복][타이틀] 순서 유지     |

## 기술 참고사항

- 알림 아이콘: MUI `@mui/icons-material/Notifications`, `fontSize="small"`
- 반복 아이콘: MUI `@mui/icons-material/Repeat`, `fontSize="small"`
- 레이아웃: `Stack direction="row" spacing={1} alignItems="center"`

