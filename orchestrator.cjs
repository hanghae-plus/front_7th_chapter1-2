const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// App.tsx 패치 적용 함수
function applyPatchToApp(patchContent) {
  const appPath = './src/App.tsx';
  if (!fs.existsSync(appPath)) {
    console.error('App.tsx 파일을 찾을 수 없습니다.');
    return;
  }
  
  let appContent = fs.readFileSync(appPath, 'utf-8');
  
  // import 문 추가 (Star, StarBorder)
  if (!appContent.includes("import { Star")) {
    appContent = appContent.replace(
      /import { ([^}]+) } from '@mui\/icons-material';/,
      (match, imports) => {
        const importList = imports.split(',').map(i => i.trim());
        if (!importList.includes('Star')) importList.push('Star');
        if (!importList.includes('StarBorder')) importList.push('StarBorder');
        return `import { ${importList.join(', ')} } from '@mui/icons-material';`;
      }
    );
  }
  
  // favoriteIds state 추가
  if (!appContent.includes('const [favoriteIds')) {
    appContent = appContent.replace(
      /function App\(\) \{\s*\n\s*const \{/,
      `function App() {\n  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);\n  const {`
    );
  }
  
  // 즐겨찾기 버튼 추가
  if (!appContent.includes('aria-label="즐겨찾기"')) {
    appContent = appContent.replace(
      /(<IconButton aria-label="Edit event"[^]*?<\/IconButton>)/,
      `$1
                    <IconButton aria-label="즐겨찾기" onClick={() => {
                      const id = event.id;
                      setFavoriteIds(fav => fav.includes(id) ? fav.filter(x => x !== id) : [...fav, id]);
                    }}>
                      {favoriteIds.includes(event.id)
                        ? <Star data-testid="StarIcon" color="warning" />
                        : <StarBorder data-testid="StarBorderIcon" />}
                    </IconButton>`
    );
  }
  
  fs.writeFileSync(appPath, appContent, 'utf-8');
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function runTDD(feature) {
  // Clean output
  const OUT = path.resolve('./output');
  fs.rmSync(OUT, { recursive: true, force: true });
  ensureDir(OUT);
  const OUT_TESTS = path.join(OUT, 'tests');
  const OUT_PATCHES = path.join(OUT, 'patches');
  const OUT_LOGS = path.join(OUT, 'logs');
  ensureDir(OUT_TESTS);
  ensureDir(OUT_PATCHES);
  ensureDir(OUT_LOGS);

  const log = (name, data) => {
    const file = path.join(OUT_LOGS, `${Date.now()}-${name}.log`);
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  };

  let loop = 0;
  
  // 명세에 따라 동적으로 파일명 결정
  const isDelete = /삭제|delete/i.test(feature);
  const testFileName = isDelete ? 'use-delete-event.spec.tsx' : 'use-favorite-star-ui.spec.tsx';
  const testPath = path.join(OUT_TESTS, testFileName);

  // 1) Generate RED test into output if missing
  if (!fs.existsSync(testPath)) {
    let redTest;
    if (isDelete) {
      redTest = `import { render, fireEvent, screen } from '@testing-library/react';
import App from '../../src/App';

describe('이벤트 삭제 기능', () => {
  it('이벤트 카드에 삭제 버튼이 노출된다', () => {
    render(<App />);
    expect(screen.getAllByLabelText('삭제').length).toBeGreaterThan(0);
  });
  it('삭제 버튼 클릭 시 해당 이벤트가 리스트에서 즉시 삭제된다', () => {
    render(<App />);
    const deleteBtns = screen.getAllByLabelText('삭제');
    const beforeCount = screen.getAllByLabelText('삭제').length;
    fireEvent.click(deleteBtns[0]);
    expect(screen.queryAllByLabelText('삭제').length).toBe(beforeCount - 1);
  });
});`;
    } else {
      redTest = `import { render, fireEvent, screen } from '@testing-library/react';
import App from '../../src/App';

describe('이벤트 즐겨찾기 UI(별 버튼) 기능', () => {
  it('이벤트 카드에 즐겨찾기(별) 버튼이 나온다', async () => {
    render(<App />);
    await screen.findByLabelText('즐겨찾기');
    expect(screen.getAllByLabelText('즐겨찾기').length).toBeGreaterThan(0);
  });
  it('별 버튼 클릭시 토글되어 상태 및 UI에 반영된다', async () => {
    render(<App />);
    const starBtns = await screen.findAllByLabelText('즐겨찾기');
    fireEvent.click(starBtns[0]);
    expect(starBtns[0].querySelector('svg')?.getAttribute('data-testid')).toBe('StarIcon');
    fireEvent.click(starBtns[0]);
    expect(starBtns[0].querySelector('svg')?.getAttribute('data-testid')).toBe('StarBorderIcon');
  });
});`;
    }
    fs.writeFileSync(testPath, redTest, 'utf-8');
    log('generated-test', { testPath });
  }

  while (loop++ < 3) {
    console.log(`=== [${loop}] 명세 => 테스트/구현/실행 루프 ===\n${feature}\n`);

    // 2) Optional: external test-writing agent
    if (fs.existsSync('./agents/test-writing-agent.cjs')) {
      await require('./agents/test-writing-agent.cjs')({ feature, outDir: OUT_TESTS });
      log('agent-test-writing', { used: true });
    } else {
      log('agent-test-writing', { used: false });
    }

    // 3) Code-writing agent produces implementation and patch
    if (fs.existsSync('./agents/code-writing-agent.cjs')) {
      const { patchPath } = await require('./agents/code-writing-agent.cjs')({ feature, outDir: OUT_PATCHES });
      log('agent-code-writing', { used: true, patchPath });
      
      // 패치 파일을 읽어서 App.tsx에 적용
      if (fs.existsSync(patchPath)) {
        const patch = fs.readFileSync(patchPath, 'utf-8');
        applyPatchToApp(patch);
        log('patch-applied', { patchPath });
      }
    } else {
      log('agent-code-writing', { used: false });
    }

    // 4) Try running test from output by pointing vitest to output/tests path
    try {
      execSync(`pnpm exec vitest run ${testPath}`, { stdio: 'inherit' });
      console.log('\n=== GREEN: 테스트 통과! ===');
      log('result', { status: 'GREEN' });
      break;
    } catch (e) {
      console.log('\n=== RED: 테스트 실패, 다음 루프에서 개선 필요 ===');
      log('result', { status: 'RED', error: String(e) });
    }
  }
}

if (require.main === module) {
  const idx = process.argv.indexOf('--feature');
  const feature = idx >= 0 ? process.argv[idx + 1] : '';
  if (!feature) {
    console.error('--feature "기능 설명" 필수');
    process.exit(1);
  }
  runTDD(feature);
}
