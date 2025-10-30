# [RED-통합] Feature 1: 반복 유형 선택 - UI 셀렉터 노출 및 옵션 검증

## 관련 요구사항
- 1. 반복 유형 선택 (recurring type selection)
  - 폼에서 반복 유형(매일/매주/매월/매년)을 선택할 수 있어야 함

## 목적
- 실제 UI 상에서 “반복 유형” 셀렉터가 노출되고, 4가지 옵션(매일/매주/매월/매년)을 제공하는지 통합 관점에서 실패 테스트(RED)를 작성한다.

## 테스트 시나리오 요약
1) 일정 추가 버튼 클릭 → 폼 오픈
2) 라벨이 `반복 유형`인 셀렉터의 콤보박스를 연다
3) 옵션: `daily-option`, `weekly-option`, `monthly-option`, `yearly-option`이 DOM에 노출되는지 확인

## 검증 포인트
- 라벨 접근성(라벨 텍스트 `반복 유형`)
- 콤보박스 역할 기반 쿼리로 열 수 있어야 함
- 4가지 옵션이 정확히 노출되어야 함

## 변경 파일(RED)
- 테스트: `src/__tests__/medium.integration.spec.tsx`

## 차후 커밋 메시지 예시
- `test(red): 1.i 반복 유형 선택 - UI 셀렉터 및 옵션 노출 통합 테스트 추가`

## 파일/커밋/요구사항 매핑
- 문서: `DOCS/feature-1-INT-RED.md`
- 테스트: `src/__tests__/medium.integration.spec.tsx`
- 관련 요구사항 번호: 1 (UI 관점)
