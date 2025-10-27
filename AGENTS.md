# Repository Guidelines

## Project Structure & Module Organization
The app is a Vite + React 19 project under `src/`. UI stateful hooks live in `hooks/`, API helpers in `apis/`, reusable logic in `utils/`, and shared contracts in `types.ts`. Testing artifacts mirror runtime code in `src/__tests__`, split into `unit/`, `hooks/`, and integration specs such as `medium.integration.spec.tsx`. Mock data for the Express companion API resides in `src/__mocks__/response/`; update both `realEvents.json` and `e2e.json` when adjusting event schemas. Static assets stay in `public/`. Tooling and build metadata live at the root (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `server.js`).

## Build, Test, and Development Commands
Use `pnpm dev` for the standard workflow; it runs Vite and the Express mock server in watch mode. `pnpm start` serves the client only, while `pnpm server` or `pnpm server:watch` lets you inspect API handlers independently. `pnpm build` performs the TypeScript project build then creates production assets. `pnpm lint` chains `pnpm lint:eslint` and `pnpm lint:tsc` to enforce style and type safety. `pnpm test`, `pnpm test:coverage`, and `pnpm test:ui` run Vitest in CLI, coverage, and UI dashboards respectively.

## Coding Style & Naming Conventions
The codebase uses TypeScript modules with React function components and two-space indentation. Follow ESLint + Prettier defaults; the Prettier plugin runs within `pnpm lint`. Keep imports grouped and alphabetized as enforced by `import/order`. Prefer camelCase for variables, PascalCase for components, and `useX` prefixes for hooks. Co-locate component-specific helpers next to their usage rather than expanding `utils/` unnecessarily.

## Testing Guidelines
Vitest with Testing Library (`src/setupTests.ts`) powers specs. Name unit tests `*.spec.ts` under folders matching the feature (e.g., `src/__tests__/hooks/easy.useSearch.spec.ts`). Integration suites should land in `src/__tests__/medium.*.spec.tsx`. Use the shared test utilities in `src/__tests__/utils.ts` for render helpers and mock setup. Maintain parity between runtime modules and test coverage; new hooks or utils need accompanying specs. Run `pnpm test:coverage` before PR submission and keep uncovered branches under 10% when feasible.

## Commit & Pull Request Guidelines
Recent history favors concise, present-tense summaries (often Korean) without trailing punctuation; follow that tone, e.g., `feat: 일정 반복 편집 기능 추가`. Reference issue IDs where available and note affected UI flows. For PRs, include a short problem/solution overview, screenshots or GIFs for UI changes, links to relevant specs, and explicit testing notes (`pnpm test`, `pnpm lint`). Mention any data fixture updates in `src/__mocks__/response/` so reviewers can refresh their mock state.
