---
epic: repeat-type-selection
test_suite: 반복 유형 선택
---

# Story: 반복 유형 선택

## 개요

반복 유형 드롭다운에서 4가지 반복 옵션(매일, 매주, 매월, 매년)을 선택하고, 선택한 값을 상태에 올바르게 저장합니다.

## Epic 연결

- **Epic**: 반복 유형 선택
- **Epic 파일**: `.cursor/spec/epics/repeat-type-selection.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 2번에서 추출

## 테스트 구조 및 범위

이 Story가 작성될 테스트 코드의 논리적 계층 구조를 명시합니다.

- **테스트 스위트 (Describe Block):** '반복 유형 선택'
  - **테스트 케이스 1:** '반복 유형 드롭다운에 4가지 옵션이 표시됨'
  - **테스트 케이스 2:** '기본값은 매일(daily)임'
  - **테스트 케이스 3:** '매주(weekly)를 선택하면 repeatType이 weekly가 됨'
  - **테스트 케이스 4:** '매월(monthly)을 선택하면 repeatType이 monthly가 됨'
  - **테스트 케이스 5:** '매년(yearly)을 선택하면 repeatType이 yearly가 됨'

## 검증 포인트 (Given-When-Then)

Epic에서 가져온 모든 검증 포인트를 명시합니다.

### 검증 포인트 1: 반복 유형 선택

```
Given: 반복 일정이 활성화된 상태
When: 반복 유형을 '매주'로 선택
Then: repeatType이 'weekly'가 됨
```

### 검증 포인트 2: 기본값

```
Given: 반복 일정을 새로 활성화
When: 아무것도 선택하지 않음
Then: repeatType의 기본값은 'daily'
```

## 테스트 데이터

테스트에서 사용할 구체적인 데이터를 명시합니다.

| 드롭다운 표시 | 선택 값   | repeatType | 비고   |
| ------------- | --------- | ---------- | ------ |
| 매일          | 'daily'   | 'daily'    | 기본값 |
| 매주          | 'weekly'  | 'weekly'   |        |
| 매월          | 'monthly' | 'monthly'  |        |
| 매년          | 'yearly'  | 'yearly'   |        |

## 기술 참고사항

### 관련 타입

```typescript
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
```

### 동작 명세

- 반복 유형 드롭다운은 4가지 옵션을 제공한다: 매일, 매주, 매월, 매년
- 기본값은 '매일'이다.
- 선택한 유형은 `repeatType` 상태에 저장된다.

---
