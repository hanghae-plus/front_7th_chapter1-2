# 이벤트 즐겨찾기 기능 테스트 명세서

## 1. 테스트 개요
- **기능**: 이벤트 즐겨찾기 기능
- **테스트 목표**: 기능의 정확성과 안정성 검증
- **테스트 범위**: 단위 테스트, 통합 테스트

## 2. 테스트 전략
### 테스트 피라미드
- **단위 테스트**: 70% (Hook, 유틸리티 함수)
- **통합 테스트**: 20% (API 통합, 컴포넌트 통합)
- **E2E 테스트**: 10% (사용자 시나리오)

### 커버리지 목표
- **라인 커버리지**: 90% 이상
- **브랜치 커버리지**: 85% 이상
- **함수 커버리지**: 95% 이상

## 3. 테스트 케이스

### 3.1 단위 테스트


### 3.2 통합 테스트
####  /api/default 메서드 테스트
- **설명**:  /api/default API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

####  /api/default 메서드 테스트
- **설명**:  /api/default API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

####  /api/default 메서드 테스트
- **설명**:  /api/default API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

#### - POST 메서드 테스트
- **설명**: - POST API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

#### - GET 메서드 테스트
- **설명**: - GET API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

#### - DELETE 메서드 테스트
- **설명**: - DELETE API 호출 메서드 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - 메서드를 호출한다
  - 로딩 상태 변화를 확인한다
  - API 응답을 확인한다
  - 에러 상태를 확인한다
- **예상 결과**: 메서드가 올바르게 동작함
- **우선순위**: high

#### API 통합 테스트
- **설명**: API와 Hook의 통합 동작 테스트
- **단계**:
  - MSW 핸들러를 설정한다
  - Hook을 렌더링한다
  - API 호출을 실행한다
  - 상태 변화를 확인한다
  - 결과를 검증한다
- **예상 결과**: API와 Hook이 올바르게 통합됨
- **우선순위**: medium


### 3.3 E2E 테스트


## 4. 테스트 데이터
### Mock 데이터
```typescript
const mockResponse = {
  "success": true
};
const mockResponse = {
  "success": true
};
const mockResponse = {
  "success": true
};
const mock-Response = {
  "success": true
};
const mock-Response = {
  "success": true
};
const mock-Response = {
  "success": true
};
```

### 테스트 픽스처
```typescript
const mockEvent = {
  "id": "1",
  "title": "테스트 이벤트",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00"
};
```

## 5. 모킹 전략
### API 모킹
- ** /api/default**: `http.('/api/default', () => HttpResponse.json({ success: true }))`
- ** /api/default**: `http.('/api/default', () => HttpResponse.json({ success: true }))`
- ** /api/default**: `http.('/api/default', () => HttpResponse.json({ success: true }))`
- **- POST**: `http.-('POST', () => HttpResponse.json({ success: true }))`
- **- GET**: `http.-('GET', () => HttpResponse.json({ success: true }))`
- **- DELETE**: `http.-('DELETE', () => HttpResponse.json({ success: true }))`

### 컴포넌트 모킹
- **notistack**: useSnackbar hook mock

## 6. 테스트 우선순위
### High Priority (6개)
-  /api/default 메서드 테스트
-  /api/default 메서드 테스트
-  /api/default 메서드 테스트
- - POST 메서드 테스트
- - GET 메서드 테스트
- - DELETE 메서드 테스트

### Medium Priority (7개)
-  /api/default 메서드 테스트
-  /api/default 메서드 테스트
-  /api/default 메서드 테스트
- - POST 메서드 테스트
- - GET 메서드 테스트
- - DELETE 메서드 테스트
- API 통합 테스트

### Low Priority (0개)


## 7. Kent Beck 테스트 원칙
### 1. 작은 단계로 나누기
- 각 테스트는 하나의 기능만 검증
- 테스트는 독립적으로 실행 가능

### 2. 빨간 막대 (Red)
- 실패하는 테스트를 먼저 작성
- 구현이 없어도 테스트가 실패해야 함

### 3. 초록 막대 (Green)
- 최소한의 코드로 테스트 통과
- 깔끔한 코드보다는 동작하는 코드 우선

### 4. 리팩토링 (Refactor)
- 테스트 통과 후 코드 품질 개선
- 기능 변경 없이 구조 개선

### 5. 테스트 명명 규칙
- Given-When-Then 패턴 사용
- 명확하고 구체적인 테스트 이름
