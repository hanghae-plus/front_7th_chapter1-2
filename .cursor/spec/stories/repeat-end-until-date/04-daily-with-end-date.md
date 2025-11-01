---
epic: repeat-end-until-date
test_suite: repeat end date - daily generation
---

# Story: 종료일 적용 - 매일 반복

## 개요
매일 반복 생성 시 종료일을 포함하여 그 이전까지만 인스턴스가 생성되는지 검증합니다.

## Epic 연결
- **Epic**: 반복 종료 - 특정 날짜까지 (Until Date)
- **Epic 파일**: `.cursor/spec/epics/repeat-end-until-date.md`
- **검증 포인트**: 예상 동작 섹션 4

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** 'repeat end date - daily generation'
  - **테스트 케이스 1:** interval=2, endDate 포함까지 생성

## 검증 포인트 (Given-When-Then)
```
Given: 시작일 2025-01-01, interval=2, endDate='2025-01-07'
When: 일정 생성
Then: 2025-01-01, 03, 05, 07 생성
```

## 테스트 데이터
| 시작일     | 간격 | 종료일     | 예상 생성 날짜               |
| ---------- | ---- | ---------- | ---------------------------- |
| 2025-01-01 | 2    | 2025-01-07 | 01, 03, 05, 07               |

## 기술 참고사항
- until = min(endDate, 표시 범위 끝), d ≤ until 조건에서 생성
