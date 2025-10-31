# 파일 출력 규칙 (File Output Rules)

에이전트가 파일을 생성할 때 반드시 준수해야 하는 규칙입니다.

## 1. 파일 인코딩

### 에이전트 정의 파일 (`.claude/agents/*.md`)

**필수**: **순수 UTF-8 (BOM 없음)**으로 작성해야 합니다.

**이유**: YAML frontmatter 파서가 BOM을 인식하지 못하여 에이전트 인식 실패

```bash
# 올바른 형식 (2d 2d 2d = "---")
head -c 3 .claude/agents/agent-name.md | od -An -tx1
# 출력: 2d 2d 2d

# 잘못된 형식 (ef bb bf = UTF-8 BOM)
# 출력: ef bb bf ← Claude Code가 인식 불가
```

### 출력 파일 (`docs/outputs/*.md`)

**권장**: **UTF-8 with BOM** (VS Code 호환성)

Write 도구 사용 시:
- 한글 문자가 포함된 content는 반드시 UTF-8로 인코딩
- **권장**: VS Code 호환성을 위해 UTF-8 BOM 추가
- 특수문자, 이모지도 UTF-8로 처리

### BOM 추가 방법 (출력 파일용)

```python
# Python 예시
content = "한글 내용..."
with open("file.md", "w", encoding="utf-8-sig") as f:
    f.write(content)
```

```javascript
// Node.js 예시
const BOM = '\ufeff';
const content = BOM + "한글 내용...";
fs.writeFileSync("file.md", content, "utf8");
```

### 검증 방법

```bash
# 에이전트 파일 - BOM 없어야 함
head -c 3 .claude/agents/agent-name.md | od -An -tx1
# 출력: 2d 2d 2d (정상)

# 출력 파일 - BOM 있어도 됨
head -c 3 docs/outputs/output.md | od -An -tx1
# 출력: ef bb bf (정상) 또는 2d 2d 2d (정상)

# 인코딩 확인
file -I path/to/file.md
# 출력 예시: path/to/file.md: text/plain; charset=utf-8
```

## 2. 메타데이터 형식

### 에이전트 정의 파일 (`.claude/agents/*.md`)

**필수**: YAML frontmatter 형식 사용

```markdown
---
name: agent-name
description: Agent description
model: sonnet
---

# Agent system prompt content here...
```

### 출력 파일 (`docs/outputs/*.md`)

**필수**: 블록쿼트 형식 사용 (YAML frontmatter 사용 금지)

#### 올바른 형식 (블록쿼트)

```markdown
> **메타데이터**
>
> - Agent: agent-name
> - Status: success | failed
> - Timestamp: 2025-10-30T12:00:00Z
> - Input Source: path/to/input.md
> - Output Version: 1.0

# 문서 제목

본문 내용...
```

#### 잘못된 형식 (YAML frontmatter - 출력 파일에 사용 금지)

```markdown
---
agent: agent-name
status: success
---
```

**이유**: 출력 파일은 블록쿼트 형식 사용 (에이전트 파일과 구분)

## 3. 파일 경로

### 출력 디렉토리

- **에이전트 출력**: `docs/outputs/`
- **명명 규칙**: `{agent-name}-output.md`

### 예시

- `docs/outputs/spec-analyzer-output.md`
- `docs/outputs/red-test-writer-output.md`
- `docs/outputs/green-implementer-output.md`

## 4. 마크다운 스타일

### 제목 계층

```markdown
# 최상위 제목 (문서 제목)

## 섹션 제목

### 하위 섹션

#### 상세 항목
```

### 코드 블록

언어 지정 필수:

````markdown
```typescript
// TypeScript 코드
```

```bash
# Shell 명령어
```
````

### 리스트

- 순서 없는 리스트: `-` 사용 (일관성)
- 순서 있는 리스트: `1.`, `2.` 등

## 5. 타임스탬프 형식

**필수**: ISO-8601 형식

```
2025-10-30T12:00:00Z
```

## 6. 에이전트별 필수 섹션

### spec-analyzer

```markdown
> **메타데이터**
> - Agent: spec-analyzer
> - Status: success
> - Timestamp: [ISO-8601]

# 요구사항 분석 결과

## 1. 기능 개요
## 2. 상세 요구사항 분석
## 3. 엣지 케이스
## 4. 테스트 시나리오
## 5. 구현 고려사항
```

### red-test-writer

```markdown
> **메타데이터**
> - Agent: red-test-writer
> - Status: success
> - Timestamp: [ISO-8601]

# RED 단계 테스트 작성 결과

## 작성된 테스트
## 테스트 코드
## 실행 결과
## 실패 이유
## 다음 단계 (GREEN)
```

## 7. 체크리스트

### 에이전트 정의 파일 생성/수정 시

- [ ] **순수 UTF-8 (BOM 없음)** 사용
- [ ] YAML frontmatter 형식 사용
- [ ] `name`, `description` 필드 필수
- [ ] BOM 없음 검증: `head -c 3 file.md | od -An -tx1` → `2d 2d 2d`

### 출력 파일 생성 시

- [ ] UTF-8 인코딩 사용 (BOM 선택 사항)
- [ ] 블록쿼트 메타데이터 형식 사용
- [ ] ISO-8601 타임스탬프 사용
- [ ] 올바른 출력 디렉토리 (`docs/outputs/`)
- [ ] 올바른 파일명 (`{agent-name}-output.md`)
- [ ] 코드 블록에 언어 지정
- [ ] 한글 문자 정상 표시 확인

## 8. 문제 해결

### 한글 깨짐 현상

**증상**: 한글이 `�`, `�` 등으로 표시

**원인**:
1. UTF-8이 아닌 인코딩 사용
2. VS Code가 파일을 잘못된 인코딩으로 해석

**해결**:

#### 1. 파일 자체 확인
```bash
# 파일 인코딩 확인
file -I path/to/file.md
# 출력 예시: path/to/file.md: text/plain; charset=utf-8

# 터미널에서 파일 내용 확인
cat path/to/file.md | head -10
```

#### 2. VS Code 설정 해결

**즉시 해결 방법** (파일별):
1. VS Code에서 파일 열기
2. 우측 하단 인코딩 표시 클릭 (예: "UTF-8" 또는 "Windows 1252")
3. "Reopen with Encoding" 선택
4. "UTF-8" 선택

**영구 해결 방법** (프로젝트 전체):
- `.vscode/settings.json` 파일이 이미 생성되어 있음
- 파일 내용:
  ```json
  {
    "files.encoding": "utf8",
    "files.autoGuessEncoding": false
  }
  ```
- VS Code 재시작 후 적용됨

#### 3. 에이전트 출력 시 예방

Write 도구 사용 시:
1. content를 UTF-8로 명시적 처리
2. 파일 생성 후 `file -I` 명령으로 인코딩 검증
3. 한글 포함 여부 확인

### VS Code에서 지속적인 인코딩 문제

**증상**:
- `.vscode/settings.json` 적용 후에도 한글이 깨짐
- 다른 에디터에서는 정상적으로 보임

**원인**:
- VS Code 전역 설정이 프로젝트 설정을 덮어씀
- VS Code 캐시 문제

**해결**:
1. VS Code 전역 설정 확인
   - Cmd+, (설정 열기)
   - "encoding" 검색
   - "Files: Encoding"이 "UTF-8"인지 확인

2. 캐시 초기화
   - VS Code 완전 종료
   - 프로젝트 폴더 다시 열기

3. 확장 프로그램 충돌 확인
   - 인코딩 관련 확장 비활성화
   - 문제 해결 후 하나씩 활성화

### 메타데이터 파싱 오류

**증상**: 메타데이터가 렌더링 안됨

**원인**: YAML frontmatter 사용 또는 형식 오류

**해결**: 블록쿼트 형식 사용 (위 예시 참조)

## 9. VS Code 인코딩 문제 완전 해결 가이드

### 프로젝트 설정 확인 체크리스트

- [ ] `.vscode/settings.json` 파일 존재 확인
- [ ] `"files.encoding": "utf8"` 설정 확인
- [ ] `"files.autoGuessEncoding": false` 설정 확인
- [ ] VS Code 재시작
- [ ] 파일 다시 열기

### 그래도 해결되지 않을 때

1. **파일 재생성**
   ```bash
   # 백업 생성
   cp file.md file.md.backup

   # UTF-8로 강제 변환
   iconv -f ISO-8859-1 -t UTF-8 file.md.backup > file.md
   ```

2. **BOM 추가** (최후의 수단)
   ```bash
   # UTF-8 BOM 추가
   printf '\xEF\xBB\xBF' | cat - file.md > temp && mv temp file.md
   ```

3. **다른 에디터 사용**
   - Sublime Text, Atom, 또는 웹 기반 에디터 사용 고려
