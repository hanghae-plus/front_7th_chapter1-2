# Event Components Migration TODO

## 완료된 작업 ✅

- [x] EventForm.tsx 메인 컴포넌트 마이그레이션
- [x] BasicFields.tsx 기본 필드 컴포넌트 (제목, 날짜, 시간)
- [x] DetailFields.tsx 상세 필드 컴포넌트 (설명, 위치, 카테고리)
- [x] SettingFields.tsx 설정 필드 컴포넌트 (반복, 알림)
- [x] FormActions.tsx 폼 액션 컴포넌트
- [x] 이벤트 관련 타입 정의 마이그레이션
- [x] 시간 유효성 검사 및 Tooltip 에러 메시지 구현
- [x] data/handler 분리 패턴 적용
- [x] 80줄 제한 준수 (BasicFields 예외 설명 포함)
- [x] 이중 언어 문서화

## 검증 필요 사항 📋

- [ ] CATEGORIES 상수 파일 존재 확인
- [ ] NOTIFICATION_OPTIONS 상수 파일 존재 확인
- [ ] getTimeErrorMessage 유틸리티 함수 구현 확인
- [ ] timeValidation 유틸리티 모듈 존재 확인

## 다음 단계 📝

- [ ] 스케줄 컴포넌트 마이그레이션
- [ ] 남은 루트 컴포넌트들 (OverlapDialog.tsx) 마이그레이션
- [ ] 전체 컴포넌트 통합 테스트
- [ ] 의존성 검증 및 수정

## 참고사항

- BasicFields 컴포넌트는 MUI Tooltip 구현으로 인해 80줄 초과 (허용됨)
- 모든 컴포넌트는 Material-UI 패턴과 TypeScript strict 모드 준수
- 접근성 고려한 aria-label 속성 포함
