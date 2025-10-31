---
alwaysApply: true
---

# Project Structure Rule

## 목적
- 프로젝트 폴더 구조와 역할을 명확히 정의하여 파일 배치 혼선을 방지한다.
- 새 기능 추가 시 위치를 일관되게 선택할 수 있도록 가이드한다.

## 기본 구조
```
/
├─ src/                # 애플리케이션 소스
│  ├─ app/             # 엔트리 구성, 라우팅
│  ├─ components/      # 재사용 가능한 UI 컴포넌트
│  ├─ features/        # 도메인별 기능 모듈 (상태, 서비스, UI 포함)
│  ├─ hooks/           # 커스텀 훅
│  ├─ services/        # API 클라이언트, 비즈니스 로직
│  ├─ utils/           # 순수 함수 유틸리티
│  └─ __tests__/       # 테스트 전용 공간(RED/GREEN/단위/통합 등 단계별 하위 폴더 구성)
├─ public/             # 정적 자산
├─ server/             # 백엔드/프록시 서버 코드
├─ .cursor/rules/      # 에이전트 규칙 프롬프트
└─ docs/               # 사양, 회고 등 문서 (필요 시 생성)
```

## 파일 배치 규칙
- 새 기능은 `src/features/<domain>` 아래에서 상태, 뷰, 테스트를 한 폴더에 모은다.
- 모든 테스트 파일은 `src/__tests__` 하위에 배치한다. 기능/단계별 서브폴더(`src/__tests__/calendar/unit`)를 자유롭게 생성해 책임을 구분한다.
- 환경 설정 파일(`vite.config.ts`, `tsconfig*.json`)은 루트에 유지하며, 폴더 이동 금지.
- 서버 전용 로직은 `server/` 폴더 내에서만 작성. 프론트와 공유할 타입은 `src/types` 에 정의한다.

## 의존성 경계
- `components/` 는 프레젠테이션에 집중하고 비즈니스 로직 접근 금지. 필요한 데이터는 props 또는 hooks를 통해 주입.
- `services/` 는 외부 API 호출과 데이터 가공을 담당하며 UI 코드와 직접 연결되지 않는다. 상태 변경은 `features/` 또는 `hooks/` 에서 수행.
- `utils/` 은 순수 함수만 포함하고 외부 상태, 네트워크 호출, DOM 접근 금지.

## import 경로 규칙
- **Vite Config 확인**: 코드 작성 전에 vite.config.ts의 path alias 설정을 확인하여 import 경로를 올바르게 사용한다.
- **Import 경로 우선순위**:
  - `@/` 별칭이 설정되어 있으면 `import { Event } from '@/types'` 사용
  - 별칭이 없거나 오류 발생 시 상대 경로 `import { Event } from '../types'` 사용
- 상대 경로는 깊이 2단계 이상 (`../../`) 이 되지 않도록 리팩토링한다.
- **Import 경로 일관성**: 프로젝트 내에서 동일한 import 방식을 유지한다.

## self-check
- 새 파일을 추가할 때 폴더 위치가 위 규칙에 맞는지 확인한다.
- 단위/통합 테스트 위치가 일관되는지 검증하고, 필요 시 `README`의 구조 섹션을 갱신한다.