# 반복 일정 기능 명세서 (SPEC.md)

## 1. 개요

### 1.1 기능 설명
사용자가 반복되는 일정을 생성하고 관리할 수 있는 기능입니다. 기존 단일 일정 생성 기능을 확장하여 반복 패턴을 설정할 수 있습니다.

### 1.2 기술적 제약사항
- 반복 일정은 기존 Event 타입의 repeat 필드를 활용
- 백엔드 API는 이미 구현됨 (/api/events-list, /api/recurring-events/:repeatId)
- UI는 현재 주석 처리된 상태로 존재

## 2. 데이터 구조

### 2.1 타입 정의
```typescript
// 기존 타입 (변경 없음)
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  id?: string; // 반복 시리즈 식별자
}

export interface Event extends EventForm {
  id: string;
  repeat: RepeatInfo;
}
```

## 3. 사용자 인터페이스

### 3.1 반복 일정 생성 폼
기존 일정 생성 폼에 다음 필드 추가:

#### 3.1.1 반복 설정 체크박스
- **위치**: 카테고리 선택 후, 알림 설정 전
- **레이블**: "반복 일정"
- **기본값**: 체크 해제 상태

#### 3.1.2 반복 유형 선택
```tsx
<Select value={repeatType} onChange={(e) => setRepeatType(e.target.value as RepeatType)}>
  <MenuItem value="daily">매일</MenuItem>
  <MenuItem value="weekly">매주</MenuItem>
  <MenuItem value="monthly">매월</MenuItem>
  <MenuItem value="yearly">매년</MenuItem>
</Select>
```

#### 3.1.3 반복 간격 입력
- **타입**: number
- **최소값**: 1
- **기본값**: 1
- **예시**: 2 (2일마다, 2주마다 등)

#### 3.1.4 반복 종료일 (선택사항)
- **타입**: date
- **제약**: 시작일보다 이후 날짜여야 함
- **빈 값**: 무제한 반복

### 3.2 반복 일정 표시

#### 3.2.1 캘린더 뷰
- 반복 일정은 각 발생 날짜에 개별 표시
- 시각적 구분을 위한 아이콘 추가: 🔄 (반복 아이콘)

#### 3.2.2 이벤트 리스트
반복 정보 표시 형식:
```
반복: {interval}{단위}마다 (종료: {endDate})
```

**예시**:
- "반복: 1일마다"
- "반복: 2주마다 (종료: 2025-12-31)"
- "반복: 1월마다"

## 4. 반복 규칙

### 4.1 날짜 계산 규칙

#### 4.1.1 월별 반복 - 31일 처리
- **31일 기준 일정**: 해당 월에 31일이 없으면 마지막 날로 조정
- **예시**: 1월 31일 → 2월 28일(평년)/29일(윤년) → 3월 31일

#### 4.1.2 윤년 처리
- **2월 29일 기준**: 평년에는 2월 28일로 조정
- **예시**: 2024년 2월 29일 → 2025년 2월 28일 → 2026년 2월 28일

#### 4.1.3 연별 반복 - 윤일 처리
- **2월 29일 기준**: 평년에는 2월 28일로 조정
- **윤년 복귀**: 다시 윤년이 되면 2월 29일로 복귀

### 4.2 종료일 컷오프
- **종료일 설정 시**: 해당 날짜 이후 반복 중단
- **종료일 포함**: 종료일 당일까지 포함
- **예시**: 종료일이 2025-03-15면, 2025-03-15까지 반복

## 5. 수정 및 삭제 기능

### 5.1 단일 일정 수정
- **대상**: 반복 시리즈 중 특정 일정 하나만
- **동작**: 해당 일정을 반복 시리즈에서 분리하여 개별 일정으로 변경
- **API**: `PUT /api/events/:id`

### 5.2 전체 시리즈 수정
- **대상**: 반복 시리즈 전체
- **동작**: 모든 반복 일정에 동일한 변경사항 적용
- **API**: `PUT /api/recurring-events/:repeatId`

### 5.3 단일 일정 삭제
- **대상**: 반복 시리즈 중 특정 일정 하나만
- **동작**: 해당 일정만 삭제, 나머지는 유지
- **API**: `DELETE /api/events/:id`

### 5.4 전체 시리즈 삭제
- **대상**: 반복 시리즈 전체
- **동작**: 모든 반복 일정 삭제
- **API**: `DELETE /api/recurring-events/:repeatId`

## 6. 사용자 상호작용

### 6.1 수정/삭제 확인 다이얼로그
반복 일정 수정/삭제 시 선택지 제공:

```
이 일정을 어떻게 수정/삭제하시겠습니까?

○ 이 일정만 수정/삭제
○ 전체 반복 일정 수정/삭제

[취소] [확인]
```

### 6.2 아이콘 정책

#### 6.2.1 반복 일정 표시 아이콘
- **아이콘**: 🔄 또는 Material-UI의 `Repeat` 아이콘
- **위치**: 일정 제목 앞
- **색상**: 기본 테마 색상

#### 6.2.2 수정/삭제 버튼
- **단일 수정**: `Edit` 아이콘 (기존과 동일)
- **전체 수정**: `EditNote` 아이콘 또는 `Edit` + 작은 🔄
- **단일 삭제**: `Delete` 아이콘 (기존과 동일)  
- **전체 삭제**: `DeleteSweep` 아이콘 또는 `Delete` + 작은 🔄

## 7. 입출력 예시

### 7.1 반복 일정 생성 요청
```typescript
// 입력 데이터
const repeatEvent: EventForm = {
  title: "주간 팀 미팅",
  date: "2025-01-06", // 월요일
  startTime: "10:00",
  endTime: "11:00",
  description: "매주 월요일 팀 미팅",
  location: "회의실 A",
  category: "업무",
  repeat: {
    type: "weekly",
    interval: 1,
    endDate: "2025-12-31"
  },
  notificationTime: 10
};

// API 호출
POST /api/events-list
{
  "events": [
    // 2025년 매주 월요일 일정들 (52개)
    {
      "title": "주간 팀 미팅",
      "date": "2025-01-06",
      // ... 기타 필드
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31",
        "id": "repeat-uuid-123"
      }
    },
    {
      "title": "주간 팀 미팅", 
      "date": "2025-01-13",
      // ... 기타 필드
      "repeat": {
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31",
        "id": "repeat-uuid-123"
      }
    }
    // ... 나머지 반복 일정들
  ]
}
```

### 7.2 31일 처리 예시
```typescript
// 매월 31일 반복 일정
const monthlyEvent = {
  date: "2025-01-31",
  repeat: { type: "monthly", interval: 1 }
};

// 생성되는 일정들:
// 2025-01-31 (31일 존재)
// 2025-02-28 (31일 없음 → 마지막 날)  
// 2025-03-31 (31일 존재)
// 2025-04-30 (31일 없음 → 마지막 날)
```

### 7.3 윤년 처리 예시
```typescript
// 2월 29일 연간 반복
const yearlyEvent = {
  date: "2024-02-29", // 윤년
  repeat: { type: "yearly", interval: 1 }
};

// 생성되는 일정들:
// 2024-02-29 (윤년)
// 2025-02-28 (평년 → 2월 28일)
// 2026-02-28 (평년 → 2월 28일)  
// 2027-02-28 (평년 → 2월 28일)
// 2028-02-29 (윤년 → 다시 2월 29일)
```

## 8. 기존 코드 활용

### 8.1 주석 해제 대상
[src/App.tsx](src/App.tsx) 파일의 447-476라인 반복 설정 UI 주석 해제

### 8.2 기존 API 엔드포인트 활용
- `POST /api/events-list`: 반복 일정 생성
- `PUT /api/events-list`: 반복 일정 일괄 수정  
- `DELETE /api/events-list`: 반복 일정 일괄 삭제
- `PUT /api/recurring-events/:repeatId`: 시리즈 수정
- `DELETE /api/recurring-events/:repeatId`: 시리즈 삭제

### 8.3 타입 활용
기존 [`RepeatType`](src/types.ts)과 [`RepeatInfo`](src/types.ts) 타입 그대로 사용

## 9. 검증 규칙

### 9.1 입력 검증
- 반복 간격: 1 이상의 정수
- 종료일: 시작일 이후 날짜 (선택사항)
- 반복 유형: 'daily', 'weekly', 'monthly', 'yearly' 중 하나

### 9.2 비즈니스 규칙
- 종료일이 설정된 경우 해당 날짜까지만 반복
- 월/년 반복 시 존재하지 않는 날짜는 해당 월의 마지막 날로 조정
- 반복 시리즈는 동일한 repeat.id로 그룹화

이 명세서는 기존 코드베이스의 구조를 유지하면서 반복 일정 기능을 구체화한 것입니다. 새로운 기능 추가 없이 기존 주석 처리된 코드와 API를 활용하여 구현 가능합니다.