# [REFACTOR-통합] Feature 1: 반복 유형 선택 - UI 구조 개선/컴포넌트 분리

## 목적
- 반복 유형 셀렉터를 별도 컴포넌트로 추출하여 코드 중복 제거, 일관성·테스트 용이성 강화
- App.tsx UI 영역을 간결하게 유지하고, 상태/이벤트 핸들링을 props로 제어하도록 리팩토링

## 변경 파일
- src/components/RepeatTypeSelector.tsx : 반복 유형 셀렉터 컴포넌트 신설(주석·라벨 모두 한글)
- src/App.tsx : 기존 인라인 셀렉터 UI를 RepeatTypeSelector로 대체, value/onChange 연결

## 리팩토링 요약
- FormLabel/Select/MenuItem 구조, 접근성(aria-)정책 일관성 유지
- 컴포넌트 prop로 상태/이벤트 바인딩(App 유지보수성↑)
- 일관된 UX, 테스트/업무 단순화(중복 제거)

## 검증 체크리스트
- [ ] 통합 테스트 전체 GREEN 유지
- [ ] 라벨·역할·옵션 쿼리 방식(테스트·접근성) 동일하게 동작
- [ ] 반복 유형 UI 상태/핸들링이 정상 작동(폼 제출 등 연동 확인)

## 차후 커밋 메시지 예시
- refactor(int): 1.i 반복 유형 선택 - 셀렉터 컴포넌트 분리 및 App 구조 개선

## 파일/커밋/요구사항 매핑
- 문서: DOCS/feature-1-INT-REFACTOR.md
- 코드: src/components/RepeatTypeSelector.tsx, src/App.tsx
- 관련 요구사항 번호: 1 (UI 관점)
