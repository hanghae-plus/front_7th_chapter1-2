# 명세서: 반복 일정 표시

**Status**: Specification Complete - Awaiting User Approval
**Next Action**: 명세 검토 후 승인되면 @po에게 User Story 작성을 요청합니다.

## 1. 개요 및 목적

### 1.1 기능 개요

캘린더 뷰(월간 뷰, 주간 뷰)에서 반복 일정(Recurring Event)과 일반 일정(Single Event)을 시각적으로 구분할 수 있도록 아이콘 표시 기능을 구현한다.

### 1.2 범위

- 반복일정에 대한 시각적 표시자 구현
- 월간 뷰와 주간 뷰에서 일관된 표시방식 적용
- 접근성 UI 고려 구현(스크린 리더를 위한 라벨 등)

## 2. 세부 기능 명세

### 2.1 반복 일정 판별 조건

- 조건: `event.repeat.type !== 'none'`
- 표시 대상:
  - `event.repeat.type`이 `'daily'`, `'weekly'`, `'monthly'`, `'yearly'` 중 하나
  - 반복 간격(`interval`)과 종료날짜(`endDate`)는 시각적 표시에 직접 영향 없음

### 2.2 아이콘 디자인 사양

#### 2.2.1 아이콘 선택

- 라이브러리: Material-UI Icons (`@mui/icons-material`)
- 아이콘명: `Repeat` 또는 `RepeatOne` 중에서
- 선택안: `Repeat` (반복 개념 표현)

#### 2.2.2 아이콘 배치

- 표시 위치: 일정명 앞쪽 표시 (제목 텍스트보다 앞에 배치)
- 레이아웃: Stack의 direction="row"로 좌측 아이콘들, 우측 텍스트
- 순서: 알림 아이콘(기존 있다면) → 반복 아이콘(새로 추가) → 제목

#### 2.2.3 아이콘 스타일

- 크기: `fontSize="small"` (기존 알림과 동일 크기)
- 색상: 기본 색상 적용 (현재 텍스트 색과 동일, MUI 기본값)
- 간격: Stack spacing={1}로 적절한 간격

### 2.3 표시 범위

#### 2.3.1 적용 뷰

- 월간 뷰(Month View): `renderMonthView`에 아이콘 표시 추가
- 주간 뷰(Week View): `renderWeekView`에 아이콘 표시를 나중에 추가 가능
- 일 뷰는 현재 구현 범위에서 제외

#### 2.3.2 표시 조건

- 반복 일정: 모든 반복 일정에 아이콘을 일관되게 표시
- 일반 일정: 반복 아이콘 표시하지 않음 (기존과 동일)
- 조건부 렌더링 적용: 반복일정인 경우에만 렌더링 (불필요한 DOM 노드 방지)

### 2.4 기존 알림기능 통합

#### 2.4.1 기존 알림아이콘과 공존

- 알림과 반복이 모두 있는 일정의 경우 두 아이콘 모두 표시
- 순서: 알림 아이콘이 앞, 반복 아이콘이 뒤
- 동일 Stack 컨테이너에 배치/표시 처리

#### 2.4.2 접근성

- 반복 아이콘에 aria-label 속성
- 예시: `aria-label="반복 일정"`
- 스크린 리더 지원

## 3. 엣지 케이스 및 예외 처리

### 3.1 반복 타입이지만 type이 'none'인 경우

- 상황: `event.repeat.type === 'none'`
- 처리: 반복 아이콘을 표시하지 않음
- 이유: 반복 설정이 비활성

### 3.2 반복 간격이 1이 아닌 경우

- 예시: 2주마다 반복 (`interval: 2, type: 'weekly'`)
- 처리: 동일한 반복 아이콘 표시
- 이유: 간격과 관계없이 반복 여부만 표시

### 3.3 종료날짜가 설정된 경우

- 상황: `event.repeat.endDate`가 존재함
- 처리: 동일한 반복 아이콘 표시
- 이유: 종료일과 관계없이 반복일정임을 표시

### 3.4 반복 정보가 없는 레거시(기존 데이터)

- 상황: `event.repeat`이 `undefined` 또는 `null`
- 처리: 반복 아이콘을 표시하지 않음 (일반 일정)
- 구현: `event.repeat?.type !== 'none'`로 안전한 처리

### 3.5 제목 길이 제한

- 상황: `event.title`이 매우 긴 경우와 아이콘 배치
- 처리: 기존 텍스트 처리 방식과 동일 (말줄임 처리)
- 구현: 아이콘은 고정 너비로 텍스트 영역 조정

## 4. 구현 가이드

### 4.1 파일 위치

- 위치: `src/App.tsx`
- 함수: `renderMonthView` (305-334행 중 일정표시 부분 수정)
- 추가: `renderWeekView` (향후 주간 뷰 구현)

### 4.2 필요한 import

```typescript
import { Repeat } from '@mui/icons-material';
```

### 4.3 구현 코드 예시

```tsx
{getEventsForDay(filteredEvents, day).map((event) => {
  const isNotified = notifiedEvents.includes(event.id);
  const isRecurring = event.repeat?.type !== 'none';

  return (
    <Box key={event.id} ...>
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRecurring && <Repeat fontSize="small" aria-label="반복 일정" />}
        <Typography variant="caption" noWrap ...>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
})}
```

### 4.4 타입 정의 참조

- Event 인터페이스의 `repeat` 필드 사용
- `RepeatInfo` 인터페이스:
  ```typescript
  interface RepeatInfo {
    type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number;
    endDate: string;
  }
  ```

## 5. 테스트 가이드

### 5.1 기능 동작 테스트

- `repeat.type`이 `'none'`이 아닌 모든 경우에 아이콘 표시
- 각 반복타입(`daily`, `weekly`, `monthly`, `yearly`)에 대해서도 일관된 아이콘 표시 검증

### 5.2 표시 우선순위

1. 알림 아이콘 (기존 알림이 있는 경우)
2. 반복 아이콘 (새로 추가되는 표시)
3. 제목 텍스트

### 5.3 UI 일관성

- 아이콘 크기가 기존과 일치하는지 확인
- 아이콘 간격이 적절한지 확인 (Stack, spacing 등)

## 6. 검증 기준

### 6.1 기능 요구

- 모든 반복 일정(`repeat.type !== 'none'`)에 반복 아이콘이 표시됨
- 모든 일반 일정(`repeat.type === 'none'`)에는 아이콘이 표시되지 않음
- 모든 반복 아이콘이 일정 제목보다 앞에 위치함 (좌측 우선 순서)
- 모든 기존 알림 아이콘과 반복 아이콘(새것) 모두 정상적으로 표시됨

### 6.2 접근성 요구

- 모든 반복 아이콘에 적절한 aria-label이 설정됨
- 모든 반복 아이콘이 스크린 리더에서 "반복 일정"으로 읽힘

### 6.3 성능 요구

- 모든 반복 아이콘이 aria-label 속성이 설정됨
- 모든 반복 아이콘이 스크린 리더에서 "반복 일정"으로 읽힘

### 6.4 예외 처리 요구

- 모든 `repeat`이 `undefined`인 경우에도 오류 없이 처리됨
- 모든 반복 간격이 1이 아닌 경우도 아이콘이 정상 표시됨
- 모든 종료날짜가 설정된 경우에도 아이콘이 정상 표시됨

## 7. 예시 시나리오

### 7.1 시나리오 1: 일반 일정

- 입력: `{ title: "점심 약속", repeat: { type: "none", interval: 1, endDate: "" } }`
- 결과: 아이콘 없이 제목만 표시

### 7.2 시나리오 2: 반복 일정 (매주)

- 입력: `{ title: "팀회의 미팅", repeat: { type: "weekly", interval: 1, endDate: "2025-12-31" } }`
- 결과: 반복 아이콘 + 제목 표시

### 7.3 시나리오 3: 반복 일정 + 알림

- 입력: `{ title: "생일", repeat: { type: "yearly", interval: 1, endDate: "" }, notificationTime: 1440 }`
- 결과: 알림 아이콘 + 반복 아이콘 + 제목 표시

---

**Version**: 1.0.0
**Created**: 2025-01-XX
