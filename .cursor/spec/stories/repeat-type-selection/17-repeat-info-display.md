---
epic: repeat-type-selection
test_suite: 일정 목록에서 반복 정보 표시
---

# Story: 일정 목록에서 반복 정보 표시

## 개요

일정 목록에서 반복 일정의 반복 정보를 명확한 텍스트로 표시합니다.

## Epic 연결

- **Epic**: 반복 유형 선택
- **Epic 파일**: `.cursor/spec/epics/repeat-type-selection.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 17번에서 추출

## 테스트 구조 및 범위

이 Story가 작성될 테스트 코드의 논리적 계층 구조를 명시합니다.

- **테스트 스위트 (Describe Block):** '일정 목록에서 반복 정보 표시'
  - **테스트 케이스 1:** 'daily 반복 일정은 "반복: N일마다" 형식으로 표시됨'
  - **테스트 케이스 2:** 'weekly 반복 일정은 "반복: N주마다" 형식으로 표시됨'
  - **테스트 케이스 3:** 'monthly 반복 일정은 "반복: N월마다" 형식으로 표시됨'
  - **테스트 케이스 4:** 'yearly 반복 일정은 "반복: N년마다" 형식으로 표시됨'
  - **테스트 케이스 5:** '종료일이 있으면 "(종료: YYYY-MM-DD)" 형식으로 함께 표시됨'
  - **테스트 케이스 6:** 'none 반복 일정은 반복 정보를 표시하지 않음'

## 검증 포인트 (Given-When-Then)

Epic에서 가져온 모든 검증 포인트를 명시합니다.

### 검증 포인트 1: 매일 반복

```
Given: repeat.type = 'daily', interval = 1
Then: "반복: 1일마다" 표시
```

### 검증 포인트 2: 매주 반복

```
Given: repeat.type = 'weekly', interval = 2
Then: "반복: 2주마다" 표시
```

### 검증 포인트 3: 매월 반복 + 종료일

```
Given: repeat.type = 'monthly', interval = 1, endDate = '2024-12-31'
Then: "반복: 1월마다 (종료: 2024-12-31)" 표시
```

### 검증 포인트 4: 매년 반복

```
Given: repeat.type = 'yearly', interval = 3
Then: "반복: 3년마다" 표시
```

### 검증 포인트 5: 일반 일정

```
Given: repeat.type = 'none'
Then: 반복 정보 표시하지 않음
```

## 테스트 데이터

테스트에서 사용할 구체적인 데이터를 명시합니다.

| repeat.type | interval | endDate    | 표시 텍스트                        |
| ----------- | -------- | ---------- | ---------------------------------- |
| 'daily'     | 1        | undefined  | "반복: 1일마다"                    |
| 'daily'     | 3        | undefined  | "반복: 3일마다"                    |
| 'weekly'    | 1        | undefined  | "반복: 1주마다"                    |
| 'weekly'    | 2        | 2024-12-31 | "반복: 2주마다 (종료: 2024-12-31)" |
| 'monthly'   | 1        | undefined  | "반복: 1월마다"                    |
| 'monthly'   | 1        | 2024-12-31 | "반복: 1월마다 (종료: 2024-12-31)" |
| 'yearly'    | 1        | undefined  | "반복: 1년마다"                    |
| 'yearly'    | 3        | 2030-12-31 | "반복: 3년마다 (종료: 2030-12-31)" |
| 'none'      | 1        | undefined  | (표시하지 않음)                    |

## 기술 참고사항

### 표시 형식

**기본 형식**:

```
반복: {interval}{단위}마다
```

**종료일 포함 형식**:

```
반복: {interval}{단위}마다 (종료: {endDate})
```

### 단위 매핑

| repeat.type | 단위 |
| ----------- | ---- |
| 'daily'     | 일   |
| 'weekly'    | 주   |
| 'monthly'   | 월   |
| 'yearly'    | 년   |
| 'none'      | -    |

### 구현 함수 예시

```typescript
function getRepeatInfoText(repeat: RepeatInfo): string {
  if (repeat.type === 'none') {
    return '';
  }

  const unitMap = {
    daily: '일',
    weekly: '주',
    monthly: '월',
    yearly: '년',
  };

  const unit = unitMap[repeat.type];
  let text = `반복: ${repeat.interval}${unit}마다`;

  if (repeat.endDate) {
    text += ` (종료: ${repeat.endDate})`;
  }

  return text;
}
```

### 동작 명세

- 반복 일정은 반복 정보를 텍스트로 표시한다.
- 표시 형식: "반복: {간격}{단위}마다"
- 종료일이 있으면 함께 표시한다.
- `repeat.type`이 'none'이면 반복 정보를 표시하지 않는다.

---
