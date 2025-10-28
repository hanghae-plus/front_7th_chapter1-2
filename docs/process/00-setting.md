# 00. [Setting] 과제 제출을 위한 초기 설정

## 📋 개요
AI 기반 Test-Driven Development (TDD) 시스템 구축을 위한 프로젝트 초기 설정 단계입니다.

## 🎯 목표
- 프로젝트 기본 구조 설정
- 개발 환경 구성
- 과제 요구사항 분석 및 계획 수립

## 🔧 수행 작업

### 1. 프로젝트 구조 분석
- 기존 React/TypeScript 캘린더 애플리케이션 코드베이스 파악
- `package.json`, `types.ts`, `App.tsx`, `useEventOperations.ts` 등 핵심 파일 분석
- 기존 테스트 파일 구조 파악 (`src/__tests__/` 디렉토리)

### 2. 기술 스택 확인
- **프론트엔드**: React + TypeScript + Vite
- **테스팅**: Vitest + React Testing Library + MSW
- **UI**: Material-UI (MUI)
- **패키지 매니저**: pnpm

### 3. 과제 요구사항 분석
- **핵심 목표**: AI 에이전트를 활용한 완전 자동화된 TDD 워크플로우 구축
- **필요한 에이전트**: 6개 (Orchestrator, Feature Design, Test Design, Test Writing, Code Writing, Refactoring)
- **TDD 사이클**: RED → GREEN → REFACTOR 자동화
- **결과물**: 실행 가능한 애플리케이션과 통과하는 테스트

### 4. 개발 환경 설정
- Node.js ES Module 환경 구성
- ESLint 설정 확인 및 수정
- 테스트 실행 환경 검증

## 📁 생성된 파일
- 프로젝트 기본 구조 유지
- 기존 코드베이스 보존

## 🎯 다음 단계 준비
- AI 에이전트 아키텍처 설계
- 각 에이전트별 역할 정의
- TDD 워크플로우 설계

## 💡 핵심 인사이트
이 단계에서는 기존 코드베이스를 최대한 보존하면서 AI 에이전트 시스템을 구축할 수 있는 기반을 마련했습니다. 기존의 잘 작동하는 테스트와 구현 코드를 분석하여 AI 에이전트가 생성해야 할 코드의 품질 기준을 설정했습니다.
