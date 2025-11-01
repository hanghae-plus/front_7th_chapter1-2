---
epic: repeat-type-selection
test_suite: 반복 일정과 겹침 검증
---

# Story: 반복 일정과 겹침 검증

## 개요

반복 일정 생성/수정 시 일정 겹침 검증을 수행하지 않고, 겹침 경고 다이얼로그를 표시하지 않습니다.

## Epic 연결

- **Epic**: 반복 유형 선택
- **Epic 파일**: `.cursor/spec/epics/repeat-type-selection.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 15번에서 추출

## 테스트 구조 및 범위

이 Story가 작성될 테스트 코드의 논리적 계층 구조를 명시합니다.

- **테스트 스위트 (Describe Block):** '반복 일정과 겹침 검증'
  - **테스트 케이스 1:** '반복 일정 생성 시 기존 일정과 겹쳐도 겹침 경고가 표시되지 않음'
  - **테스트 케이스 2:** 'repeat.type이 none이 아닐 때 findOverlappingEvents 검증을 건너뜀'
  - **테스트 케이스 3:** '일반 일정(repeat.type === none) 생성 시에는 겹침 검증을 수행함'
  - **테스트 케이스 4:** '반복 일정은 겹침 여부와 관계없이 바로 저장됨'

## 검증 포인트 (Given-When-Then)

Epic에서 가져온 모든 검증 포인트를 명시합니다.

### 검증 포인트 1: 반복 일정 겹침 시 경고 없음

```
Given: 2024-01-15 10:00-11:00에 기존 일정이 있음
When: 2024-01-15 10:00-11:00에 매일 반복 일정을 생성
Then: 겹침 경고 없이 바로 저장됨
```

### 검증 포인트 2: 반복 일정은 겹침 검증 건너뜀

```
Given: 반복 일정을 생성 중
When: repeat.type이 'none'이 아님
Then: findOverlappingEvents 검증을 건너뜀
```

### 검증 포인트 3: 일반 일정은 겹침 검증 수행

```
Given: 일반 일정을 생성 중
When: repeat.type이 'none'임
Then: findOverlappingEvents 검증을 수행함
```

## 테스트 데이터

테스트에서 사용할 구체적인 데이터를 명시합니다.

| 기존 일정              | 새 일정                       | repeat.type | 겹침 검증 수행 | 겹침 경고 표시 |
| ---------------------- | ----------------------------- | ----------- | -------------- | -------------- |
| 2024-01-15 10:00-11:00 | 2024-01-15 10:00-11:00 (매일) | 'daily'     | ✗              | ✗              |
| 2024-01-15 10:00-11:00 | 2024-01-15 10:00-11:00 (매주) | 'weekly'    | ✗              | ✗              |
| 2024-01-15 10:00-11:00 | 2024-01-15 10:00-11:00 (매월) | 'monthly'   | ✗              | ✗              |
| 2024-01-15 10:00-11:00 | 2024-01-15 10:00-11:00 (매년) | 'yearly'    | ✗              | ✗              |
| 2024-01-15 10:00-11:00 | 2024-01-15 10:00-11:00 (일반) | 'none'      | ✓              | ✓ (겹침 시)    |
| (없음)                 | 2024-01-15 10:00-11:00 (매일) | 'daily'     | ✗              | ✗              |

## 기술 참고사항

### 관련 타입

```typescript
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}
```

### 겹침 검증 로직

```typescript
// 의사 코드
if (event.repeat.type === 'none') {
  // 일반 일정: 겹침 검증 수행
  const overlapping = findOverlappingEvents(event);
  if (overlapping.length > 0) {
    showOverlapWarning();
  }
} else {
  // 반복 일정: 겹침 검증 건너뜀
  saveEventDirectly(event);
}
```

### 동작 명세

- 반복 일정 생성/수정 시 일정 겹침 검증을 수행하지 않는다.
- 겹침 경고 다이얼로그를 표시하지 않는다.
- 기존 일정과 겹쳐도 바로 저장된다.
- `repeat.type`이 'none'이 아닌 경우 `findOverlappingEvents` 검증을 건너뛴다.
- 일반 일정(`repeat.type === 'none'`)은 기존대로 겹침 검증을 수행한다.

### 설계 이유

- 반복 일정은 여러 날짜에 걸쳐 생성되므로 겹침 검증이 복잡함
- 사용자가 의도적으로 겹치는 반복 일정을 만들 수 있음
- 성능상의 이유 (대량의 반복 일정 검증 비용)

---
