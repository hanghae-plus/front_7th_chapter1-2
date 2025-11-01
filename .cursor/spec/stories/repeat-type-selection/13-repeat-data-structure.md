---
epic: repeat-type-selection
test_suite: 일정 저장 데이터 구조
---

# Story: 일정 저장 데이터 구조

## 개요

반복 일정 정보를 Event 객체의 repeat 필드에 올바른 구조로 저장하고, 활성화/비활성화 상태에 따라 적절한 값을 설정합니다.

## Epic 연결

- **Epic**: 반복 유형 선택
- **Epic 파일**: `.cursor/spec/epics/repeat-type-selection.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 13번에서 추출

## 테스트 구조 및 범위

이 Story가 작성될 테스트 코드의 논리적 계층 구조를 명시합니다.

- **테스트 스위트 (Describe Block):** '일정 저장 데이터 구조'
  - **테스트 케이스 1:** '반복 일정 활성화 시 repeat 객체에 반복 정보가 저장됨'
  - **테스트 케이스 2:** '반복 일정 비활성화 시 repeat.type이 none으로 저장됨'
  - **테스트 케이스 3:** '종료일이 있는 반복 일정은 endDate가 포함됨'
  - **테스트 케이스 4:** '종료일이 없는 반복 일정은 endDate가 undefined임'

## 검증 포인트 (Given-When-Then)

Epic에서 가져온 모든 검증 포인트를 명시합니다.

### 검증 포인트 1: 반복 일정 활성화 시 저장

```
Given: 반복 일정 활성화, 매주, 간격 2, 종료일 2024-12-31
When: 일정을 저장
Then: Event.repeat = {
  type: 'weekly',
  interval: 2,
  endDate: '2024-12-31'
}
```

### 검증 포인트 2: 반복 일정 비활성화 시 저장

```
Given: 반복 일정 비활성화
When: 일정을 저장
Then: Event.repeat = {
  type: 'none',
  interval: 1,
  endDate: undefined
}
```

## 테스트 데이터

테스트에서 사용할 구체적인 데이터를 명시합니다.

| isRepeating | repeatType | interval | endDate    | 예상 저장 데이터                                        |
| ----------- | ---------- | -------- | ---------- | ------------------------------------------------------- |
| true        | 'daily'    | 1        | undefined  | { type: 'daily', interval: 1, endDate: undefined }      |
| true        | 'weekly'   | 2        | 2024-12-31 | { type: 'weekly', interval: 2, endDate: '2024-12-31' }  |
| true        | 'monthly'  | 3        | 2025-06-30 | { type: 'monthly', interval: 3, endDate: '2025-06-30' } |
| true        | 'yearly'   | 1        | undefined  | { type: 'yearly', interval: 1, endDate: undefined }     |
| false       | -          | -        | -          | { type: 'none', interval: 1, endDate: undefined }       |

## 기술 참고사항

### 관련 타입

```typescript
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}
```

### 동작 명세

- 반복 일정이 활성화되면 `repeat` 객체에 반복 정보를 저장한다.
- 반복 일정이 비활성화되면 `repeat.type`을 'none'으로 저장한다.
- `interval`은 항상 1 이상의 정수여야 한다.
- `endDate`는 선택적이며, YYYY-MM-DD 형식의 문자열이거나 undefined이다.

### 기본값

- `repeat.type`: 'none'
- `repeat.interval`: 1
- `repeat.endDate`: undefined

---
