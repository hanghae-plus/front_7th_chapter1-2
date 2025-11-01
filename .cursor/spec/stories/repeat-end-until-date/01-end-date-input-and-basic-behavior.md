---
epic: repeat-end-until-date
test_suite: repeat end date - input and basic behavior
---

# Story: 종료일 입력 및 기본 동작

## 개요
반복 일정에서 종료일을 입력했을 때와 비워둘 때의 기본 동작을 검증합니다.

## Epic 연결
- **Epic**: 반복 종료 - 특정 날짜까지 (Until Date)
- **Epic 파일**: `.cursor/spec/epics/repeat-end-until-date.md`
- **검증 포인트**: 예상 동작 섹션 1

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** 'repeat end date - input and basic behavior'
  - **테스트 케이스 1:** 종료일이 설정되면 해당 일자까지(포함)만 표시
  - **테스트 케이스 2:** 종료일이 비어 있으면 표시 범위 내에서만 표시(무기한)

## 검증 포인트 (Given-When-Then)

### 검증 포인트 1
```
Given: 시작일 2025-01-10, repeat.type='daily', interval=1, endDate='2025-01-13'
When: 주간/월간 뷰에서 일정을 조회
Then: 2025-01-10, 11, 12, 13에만 표시되고 14 이후는 표시되지 않음
```

### 검증 포인트 2
```
Given: 시작일 2025-01-10, repeat.type='daily', interval=1, endDate=''
When: 월간 뷰에서 일정을 조회
Then: 종료일 제약 없이 표시 범위 내에서만 표시됨
```

## 테스트 데이터
| 시작일       | 유형  | 간격 | 종료일       | 예상 표시 날짜(요지)        |
| ------------ | ----- | ---- | ------------ | ---------------------------- |
| 2025-01-10   | daily | 1    | 2025-01-13   | 10, 11, 12, 13               |
| 2025-01-10   | daily | 1    | (없음)       | 표시 범위 내에서만           |

## 기술 참고사항
- 종료일이 설정된 경우: until = min(endDate, 표시 범위 끝)
- 종료일 미설정: until = 표시 범위 끝
