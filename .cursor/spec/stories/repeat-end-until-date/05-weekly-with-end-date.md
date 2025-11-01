---
epic: repeat-end-until-date
test_suite: repeat end date - weekly generation
---

# Story: 종료일 적용 - 매주 반복

## 개요
매주 반복 생성 시 시작일과 같은 요일 기준으로 종료일까지(포함) 생성됨을 검증합니다.

## Epic 연결
- **Epic**: 반복 종료 - 특정 날짜까지 (Until Date)
- **Epic 파일**: `.cursor/spec/epics/repeat-end-until-date.md`
- **검증 포인트**: 예상 동작 섹션 5

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** 'repeat end date - weekly generation'
  - **테스트 케이스 1:** 월요일 시작, interval=1, 종료일까지(포함) 생성

## 검증 포인트 (Given-When-Then)
```
Given: 시작일 2025-01-06(월), interval=1, endDate='2025-01-20'
When: 일정 생성
Then: 2025-01-06, 2025-01-13, 2025-01-20 생성
```

## 테스트 데이터
| 시작일       | 간격 | 종료일       | 예상 생성 날짜               |
| ------------ | ---- | ------------ | ---------------------------- |
| 2025-01-06   | 1    | 2025-01-20   | 01-06, 01-13, 01-20          |

## 기술 참고사항
- 기준 요일은 시작일의 요일
- 주 단위 증가: `+ (7 * interval)`
