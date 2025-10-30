import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Auto TDD Agent
 * TDD 사이클을 완전 자동화하는 에이전트
 *
 * 프로세스:
 * 1. 테스트 작성 (RED)
 * 2. 테스트 실행하여 실패 확인
 * 3. 구현 코드 작성
 * 4. 테스트 실행하여 성공 확인 (GREEN)
 * 5. 필요시 리팩토링
 */

class AutoTDDAgent {
  constructor(outputDir = './output') {
    this.outputDir = path.resolve(outputDir);
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = ['tests', 'patches', 'logs'];
    dirs.forEach((dir) => {
      const fullPath = path.join(this.outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  log(name, data) {
    const logFile = path.join(this.outputDir, 'logs', `${Date.now()}-${name}.log`);
    fs.writeFileSync(logFile, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  }

  /**
   * 기능 명세를 분석하여 테스트 코드 생성
   */
  analyzeFeature(featureSpec) {
    console.log('🔍 기능 명세 분석 중...');

    const analysis = {
      featureType: this.detectFeatureType(featureSpec),
      testFileName: this.generateTestFileName(featureSpec),
      requiredImports: [],
      requiredState: [],
      requiredComponents: [],
    };

    // 기능 타입에 따른 분석
    if (/즐겨찾기|favorite|star/i.test(featureSpec)) {
      analysis.featureType = 'favorite';
      analysis.requiredImports = ['Star', 'StarBorder'];
      analysis.requiredState = ['favoriteIds'];
    } else if (/삭제|delete/i.test(featureSpec)) {
      analysis.featureType = 'delete';
      analysis.requiredImports = ['Delete'];
    }

    console.log('✅ 분석 완료:', analysis);
    return analysis;
  }

  detectFeatureType(featureSpec) {
    if (/즐겨찾기|favorite|star/i.test(featureSpec)) return 'favorite';
    if (/삭제|delete/i.test(featureSpec)) return 'delete';
    if (/검색|search/i.test(featureSpec)) return 'search';
    return 'unknown';
  }

  generateTestFileName(featureSpec) {
    const featureType = this.detectFeatureType(featureSpec);
    const nameMap = {
      favorite: 'use-favorite-star-ui.spec.tsx',
      delete: 'use-delete-event.spec.tsx',
      search: 'use-search.spec.tsx',
    };
    return nameMap[featureType] || 'feature.spec.tsx';
  }

  /**
   * RED: 실패하는 테스트 코드 생성
   */
  generateRedTest(featureSpec) {
    console.log('📝 RED 테스트 생성 중...');

    const analysis = this.analyzeFeature(featureSpec);

    if (analysis.featureType === 'favorite') {
      return this.generateFavoriteTest();
    } else if (analysis.featureType === 'delete') {
      return this.generateDeleteTest();
    }

    return this.generateGenericTest(featureSpec);
  }

  generateFavoriteTest() {
    return `import { render, fireEvent, screen } from '@testing-library/react';
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

  generateDeleteTest() {
    return `import { render, fireEvent, screen } from '@testing-library/react';
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
  }

  generateGenericTest(featureSpec) {
    return `import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('${featureSpec}', () => {
  it('기능이 구현되어야 함', () => {
    render(<App />);
    // TODO: 구현할 기능에 맞는 테스트 작성
    expect(true).toBe(true);
  });
});`;
  }

  /**
   * 테스트 파일 저장
   */
  saveTest(testCode, fileName) {
    const testPath = path.join(this.outputDir, 'tests', fileName);
    fs.writeFileSync(testPath, testCode, 'utf-8');
    console.log('✅ 테스트 저장:', testPath);
    this.log('generated-test', { testPath, fileName });
    return testPath;
  }

  /**
   * 테스트 실행 (RED/GREEN 확인)
   */
  runTest(testPath) {
    console.log('\n🧪 테스트 실행 중...');
    try {
      execSync(`pnpm exec vitest run ${testPath}`, { stdio: 'inherit' });
      console.log('✅ GREEN: 테스트 통과!');
      this.log('test-result', { status: 'GREEN', path: testPath });
      return true;
    } catch (e) {
      console.log('❌ RED: 테스트 실패');
      this.log('test-result', { status: 'RED', error: String(e), path: testPath });
      return false;
    }
  }

  /**
   * 구현 코드 생성 및 적용
   */
  generateImplementation(featureSpec) {
    console.log('⚙️  구현 코드 생성 중...');

    const analysis = this.analyzeFeature(featureSpec);

    if (analysis.featureType === 'favorite') {
      this.implementFavoriteFeature(analysis);
    } else if (analysis.featureType === 'delete') {
      this.implementDeleteFeature(analysis);
    }

    console.log('✅ 구현 완료');
    this.log('implementation-generated', { featureType: analysis.featureType });
  }

  implementFavoriteFeature(analysis) {
    const appPath = './src/App.tsx';
    let appContent = fs.readFileSync(appPath, 'utf-8');

    // 1. import 추가
    if (!appContent.includes('import { Star')) {
      appContent = appContent.replace(
        /import { ([^}]+) } from '@mui\/icons-material';/,
        (match, imports) => {
          const importList = imports.split(',').map((i) => i.trim());
          if (!importList.includes('Star')) importList.push('Star');
          if (!importList.includes('StarBorder')) importList.push('StarBorder');
          return `import { ${importList.join(', ')} } from '@mui/icons-material';`;
        }
      );
    }

    // 2. state 추가
    if (!appContent.includes('const [favoriteIds')) {
      appContent = appContent.replace(
        /function App\(\) \{\s*\n\s*const \{/,
        `function App() {\n  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);\n  const {`
      );
    }

    // 3. 버튼 추가
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

  implementDeleteFeature(analysis) {
    // 삭제 기능은 이미 useEventOperations에 구현되어 있음
    // aria-label만 변경
    const appPath = './src/App.tsx';
    let appContent = fs.readFileSync(appPath, 'utf-8');

    appContent = appContent.replace(/aria-label="Delete event"/g, 'aria-label="삭제"');

    fs.writeFileSync(appPath, appContent, 'utf-8');
  }

  /**
   * TDD 사이클 실행
   */
  async runTDDCycle(featureSpec) {
    console.log('\n🚀 TDD 사이클 시작');
    console.log('='.repeat(60));
    console.log('기능:', featureSpec);
    console.log('='.repeat(60));

    // 1. 분석
    const analysis = this.analyzeFeature(featureSpec);

    // 2. RED: 테스트 생성
    const testCode = this.generateRedTest(featureSpec);
    const testPath = this.saveTest(testCode, analysis.testFileName);

    // 3. RED: 테스트 실행 (실패해야 함)
    console.log('\n📋 STEP 1: RED 상태 확인');
    const firstRun = this.runTest(testPath);

    if (firstRun) {
      console.log('⚠️  테스트가 이미 통과합니다. 새 기능이 필요합니다.');
      return { success: false, reason: 'test-already-passing' };
    }

    // 4. GREEN: 구현
    console.log('\n📋 STEP 2: 구현 코드 작성');
    this.generateImplementation(featureSpec);

    // 5. GREEN: 테스트 실행 (성공해야 함)
    console.log('\n📋 STEP 3: GREEN 상태 확인');
    const secondRun = this.runTest(testPath);

    if (!secondRun) {
      console.log('⚠️  테스트가 여전히 실패합니다. 구현을 확인해주세요.');
      return { success: false, reason: 'test-still-failing' };
    }

    console.log('\n✅ TDD 사이클 완료!');
    this.log('tdd-cycle-complete', {
      feature: featureSpec,
      testFile: analysis.testFileName,
      success: true,
    });

    return { success: true, testPath };
  }
}

export default AutoTDDAgent;

// CLI에서 직접 실행 가능
if (import.meta.url === `file://${process.argv[1]}`) {
  const feature = process.argv[2];
  if (!feature) {
    console.error('사용법: node auto-tdd-agent.js "기능 설명"');
    process.exit(1);
  }

  const agent = new AutoTDDAgent();
  agent.runTDDCycle(feature).then((result) => {
    process.exit(result.success ? 0 : 1);
  });
}
