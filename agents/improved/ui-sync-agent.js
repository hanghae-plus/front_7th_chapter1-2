import fs from 'fs';

/**
 * UI Sync Agent
 * 테스트 코드에서 요구되는 UI 요소를 탐지하여 실제 UI 파일에 동기화합니다.
 * - 예: '삭제' 버튼이 필요하면 `src/App.tsx`에 aria-label을 추가하거나 요소를 생성
 */
class UISyncAgent {
  constructor() {
    this.targetUIFile = 'src/App.tsx';
  }

  /**
   * 테스트 코드를 분석하여 필요한 UI 시그널(aria-label, 텍스트 등)을 추출
   */
  analyzeUITargetsFromTest(testCode) {
    const ariaLabels = new Set();
    const labelRegex =
      /(getAllByLabelText|getByLabelText|queryAllByLabelText|findByLabelText)\(['"]([^'"]+)['"]/g;
    let m;
    while ((m = labelRegex.exec(testCode)) !== null) {
      ariaLabels.add(m[2]);
    }
    return { ariaLabels: Array.from(ariaLabels) };
  }

  /**
   * UI 파일을 수정하여 필요한 aria-label을 보강
   * 현재는 '삭제' 라벨을 `Delete` 아이콘 버튼에 매핑하는 보수적 변경만 수행
   */
  ensureAppHasDeleteKoreanLabel() {
    if (!fs.existsSync(this.targetUIFile)) return { changed: false, reason: 'UI file missing' };
    const code = fs.readFileSync(this.targetUIFile, 'utf8');

    if (code.includes('aria-label="삭제"') || code.includes("aria-label='삭제'")) {
      return { changed: false, reason: 'already has 삭제 label' };
    }

    // 타겟: Delete 아이콘 버튼에 한국어 라벨 추가
    // 기존: <IconButton aria-label="Delete event" onClick={() => deleteEvent(event.id)}>
    // 변경: <IconButton aria-label="삭제" onClick=...>
    const updated = code.replace(
      /<IconButton\s+aria-label=("|')Delete event\1/g,
      '<IconButton aria-label="삭제"'
    );

    if (updated !== code) {
      fs.writeFileSync(this.targetUIFile, updated, 'utf8');
      return { changed: true };
    }

    // 혹시 다른 영문 라벨을 사용하는 경우에 대한 보강: 'Delete' 단독
    const updated2 = code.replace(
      /<IconButton\s+aria-label=("|')Delete\1/g,
      '<IconButton aria-label="삭제"'
    );
    if (updated2 !== code) {
      fs.writeFileSync(this.targetUIFile, updated2, 'utf8');
      return { changed: true };
    }

    return { changed: false, reason: 'no matching delete button found' };
  }

  /**
   * 테스트에서 aria-label="recurring" 요구가 있을 때, App.tsx에 반복 배지 아이콘을 매핑 방식으로 삽입한다.
   * - @mui/icons-material import에 Repeat 추가
   * - 주간/월간 뷰, 이벤트 리스트의 Notifications 옆에 Repeat 아이콘 삽입
   */
  ensureRecurringBadgeIcon() {
    if (!fs.existsSync(this.targetUIFile)) return { changed: false, reason: 'UI file missing' };
    let code = fs.readFileSync(this.targetUIFile, 'utf8');

    let changed = false;

    // 1) import 보강
    const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from '@mui\/icons-material';/;
    if (importRegex.test(code)) {
      code = code.replace(importRegex, (_m, group) => {
        const names = group
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (!names.includes('Repeat')) {
          names.push('Repeat');
          changed = true;
        }
        return `import { ${names.join(', ')} } from '@mui/icons-material';`;
      });
    }

    // 2) 주간/월간 뷰: Notifications(fontSize="small") 옆에 Repeat 삽입
    const notifSmall = '{isNotified && <Notifications fontSize="small" />}';
    if (code.includes(notifSmall) && !code.includes('aria-label="recurring"')) {
      code = code.replaceAll(
        notifSmall,
        `${notifSmall}{event.repeat.type !== 'none' && <Repeat fontSize=\"small\" aria-label=\"recurring\" />}`
      );
      changed = true;
    }

    // 3) 이벤트 리스트: Notifications(color="error") 옆에 Repeat 삽입
    const notifErr = '{notifiedEvents.includes(event.id) && <Notifications color="error" />}';
    if (code.includes(notifErr) && !code.includes('aria-label="recurring"')) {
      code = code.replaceAll(
        notifErr,
        `${notifErr}{event.repeat.type !== 'none' && <Repeat aria-label=\"recurring\" />}`
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(this.targetUIFile, code, 'utf8');
      return { changed: true };
    }
    return { changed: false, reason: 'no changes' };
  }

  /**
   * 반복 설정 UI가 비활성화되어 있으면 최소 블록을 주입하여 노출한다.
   */
  ensureRepeatUIEnabled() {
    if (!fs.existsSync(this.targetUIFile)) return { changed: false, reason: 'UI file missing' };
    let code = fs.readFileSync(this.targetUIFile, 'utf8');
    if (code.includes('반복 유형') && code.includes('repeatInterval')) {
      return { changed: false, reason: 'repeat UI present' };
    }
    // 주입 위치: 검색 입력(TextField id="search") 블록 위의 반복 체크박스 이후로 삽입 시도
    const anchor = 'label="반복 일정"\n            />\n          </FormControl>';
    const insertIdx = code.indexOf(anchor);
    if (insertIdx === -1) return { changed: false, reason: 'anchor not found' };
    const injection = `\n          <Stack spacing={2}>\n            <FormControl fullWidth>\n              <FormLabel>반복 유형</FormLabel>\n              <Select size="small" value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>\n                <MenuItem value="daily">매일</MenuItem>\n                <MenuItem value="weekly">매주</MenuItem>\n                <MenuItem value="monthly">매월</MenuItem>\n                <MenuItem value="yearly">매년</MenuItem>\n              </Select>\n            </FormControl>\n            <Stack direction="row" spacing={2}>\n              <FormControl fullWidth>\n                <FormLabel>반복 간격</FormLabel>\n                <TextField size="small" type="number" value={repeatInterval} onChange={(e) => setRepeatInterval(Number(e.target.value))} />\n              </FormControl>\n              <FormControl fullWidth>\n                <FormLabel>반복 종료일</FormLabel>\n                <TextField size="small" type="date" value={repeatEndDate} onChange={(e) => setRepeatEndDate(e.target.value)} />\n              </FormControl>\n            </Stack>\n          </Stack>`;
    const updated =
      code.slice(0, insertIdx + anchor.length) + injection + code.slice(insertIdx + anchor.length);
    if (updated !== code) {
      fs.writeFileSync(this.targetUIFile, updated, 'utf8');
      return { changed: true };
    }
    return { changed: false, reason: 'no changes' };
  }

  /**
   * 공개 API: 테스트 코드 기반으로 UI 동기화 실행
   */
  async syncUIWithTests(testCode) {
    const { ariaLabels } = this.analyzeUITargetsFromTest(testCode || '');
    const results = [];

    if (ariaLabels.includes('삭제')) {
      results.push({ action: 'ensure-삭제-label', result: this.ensureAppHasDeleteKoreanLabel() });
    }

    // 조건 없이 항상 반복 배지 아이콘 동기화 시도
    results.push({ action: 'ensure-recurring-badge', result: this.ensureRecurringBadgeIcon() });

    return { success: true, results };
  }
}

// CLI 실행 지원
if (process.argv[1] && process.argv[1].endsWith('ui-sync-agent.js')) {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--testCode') {
      opts.testCode = args[i + 1];
      i++;
    }
  }
  const agent = new UISyncAgent();
  agent
    .syncUIWithTests(opts.testCode || '')
    .then((r) => {
      console.log(JSON.stringify(r));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export default UISyncAgent;
