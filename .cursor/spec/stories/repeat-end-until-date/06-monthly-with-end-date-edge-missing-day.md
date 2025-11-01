---
epic: repeat-end-until-date
test_suite: repeat end date - monthly generation with missing day edge
---

# Story: 종료일 적용 - 매월 반복(존재하지 않는 날짜 건너뜀)

## 개요
매월 반복 생성 시 시작일의 '일(day)'이 존재하는 달에만 생성되며, 종료일까지(포함) 생성됨을 검증합니다.

## Epic 연결
- **Epic**: 반복 종료 - 특정 날짜까지 (Until Date)
- **Epic 파일**: `.cursor/spec/epics/repeat-end-until-date.md`
- **검증 포인트**: 예상 동작 섹션 6

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** 'repeat end date - monthly generation with missing day edge'
  - **테스트 케이스 1:** 31일 시작, 2월 건너뜀, 종료일까지(포함) 생성 여부

## 검증 포인트 (Given-When-Then)
```
Given: 시작일 2025-01-31, interval=1, endDate='2025-04-30'
When: 일정 생성
Then: 2025-01-31, (2월 건너뜀), 2025-03-31 생성, 2025-04-30은 시작일의 일(31)이 없어 생성되지 않음
```

## 테스트 데이터
| 시작일     | 간격 | 종료일     | 예상 생성 날짜                    |
| ---------- | ---- | ---------- | --------------------------------- |
| 2025-01-31 | 1    | 2025-04-30 | 01-31, (02 없음), 03-31 (04 없음) |

## 기술 참고사항
- 월 증가: `+ interval개월`
- `monthHasDay(year, month, startDay) === false`이면 해당 월은 건너뜀
