# Schedule Components Migration TODO

## 완료된 작업 ✅

- [x] ScheduleCard.tsx 개별 일정 카드 컴포넌트 마이그레이션
- [x] ScheduleList.tsx 일정 목록 컴포넌트 마이그레이션
- [x] 스케줄 관련 타입 정의 마이그레이션
- [x] 반복 일정 표시 로직 구현
- [x] 알림 상태 시각화 구현
- [x] data/handler 분리 패턴 적용
- [x] Material-UI 아이콘 및 레이아웃 적용
- [x] 접근성 고려한 버튼 레이블 추가

## 수정 필요 사항 🔧

- [ ] 타입 파일명 통일 (ScheduleItemProps.type.ts → ScheduleItemProps.types.ts)
- [ ] NOTIFICATION_OPTIONS 상수 파일 존재 확인
- [ ] 반복 일정 표시 로직 유틸리티 함수 분리 고려

## 검증 필요 사항 📋

- [ ] NOTIFICATION_OPTIONS 상수 임포트 확인
- [ ] EventProps 타입 연결 확인
- [ ] 편집/삭제 핸들러 함수 시그니처 검증

## 다음 단계 📝

- [ ] 남은 루트 컴포넌트들 (OverlapDialog.tsx) 마이그레이션
- [ ] 전체 컴포넌트 통합 테스트
- [ ] 의존성 검증 및 수정
- [ ] 타입 파일명 불일치 수정

## 참고사항

- ScheduleCard 컴포넌트는 복잡한 반복 일정 렌더링으로 인해 80줄 초과 (허용됨)
- 반복 일정 타입별 텍스트 표시 로직이 복잡하여 가독성 개선 여지 있음
- 모든 컴포넌트는 Material-UI 패턴과 TypeScript strict 모드 준수
