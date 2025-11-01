---
epic: repeat-type-selection
test_suite: 반복 일정 활성화/비활성화
---

# Story: 반복 일정 활성화/비활성화

## 개요

반복 일정 체크박스를 통해 반복 일정 기능을 활성화/비활성화하고, 활성화 상태에 따라 반복 설정 UI의 표시 여부를 제어합니다.

## Epic 연결

- **Epic**: 반복 유형 선택
- **Epic 파일**: `.cursor/spec/epics/repeat-type-selection.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 1번에서 추출

## 테스트 구조 및 범위

이 Story가 작성될 테스트 코드의 논리적 계층 구조를 명시합니다.

- **테스트 스위트 (Describe Block):** '반복 일정 활성화/비활성화'
  - **테스트 케이스 1:** '반복 일정 체크박스를 체크하면 isRepeating이 true가 됨'
  - **테스트 케이스 2:** '반복 일정 체크박스를 해제하면 isRepeating이 false가 됨'
  - **테스트 케이스 3:** 'isRepeating이 true일 때 반복 설정 UI가 표시됨'
  - **테스트 케이스 4:** 'isRepeating이 false일 때 반복 설정 UI가 숨겨짐'
  - **테스트 케이스 5:** '체크박스 해제 시 repeat.type이 none이 됨'

## 검증 포인트 (Given-When-Then)

Epic에서 가져온 모든 검증 포인트를 명시합니다.

### 검증 포인트 1: 반복 일정 활성화

```
Given: 일정 생성 폼
When: 반복 일정 체크박스를 체크
Then: 반복 유형, 반복 간격, 반복 종료일 필드가 표시됨
```

### 검증 포인트 2: 반복 일정 비활성화

```
Given: 반복 일정이 체크된 상태
When: 체크박스를 해제
Then: 반복 설정 UI가 숨겨지고 repeat.type이 'none'이 됨
```

## 테스트 데이터

테스트에서 사용할 구체적인 데이터를 명시합니다.

| 초기 상태           | 사용자 액션   | isRepeating | repeat.type | UI 표시 여부 |
| ------------------- | ------------- | ----------- | ----------- | ------------ |
| 체크박스 해제       | 체크박스 체크 | true        | 'daily'     | 표시         |
| 체크박스 체크       | 체크박스 해제 | false       | 'none'      | 숨김         |
| 체크박스 해제(기본) | 초기 로드     | false       | 'none'      | 숨김         |

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

### 동작 명세

- 반복 일정 체크박스를 체크하면 `isRepeating`이 `true`가 된다.
- 반복 일정 체크박스를 해제하면 `isRepeating`이 `false`가 된다.
- `isRepeating`이 `true`일 때 반복 설정 UI가 표시된다.
- `isRepeating`이 `false`일 때 반복 설정 UI가 숨겨진다.
- 체크박스 해제 시 `repeat.type`이 'none'으로 설정된다.

---
