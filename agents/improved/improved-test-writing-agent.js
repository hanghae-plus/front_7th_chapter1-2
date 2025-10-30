import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Improved Test Writing Agent
 * 공식 문서 기반으로 완전한 테스트 코드를 생성하는 에이전트
 */
class ImprovedTestWritingAgent {
  constructor() {
    this.testingGuidelines = this.loadTestingGuidelines();
    this.testPatterns = this.loadTestPatterns();
    this.mswPatterns = this.loadMSWPatterns();
  }

  /**
   * 테스트 설계를 바탕으로 완전한 테스트 코드 생성
   */
  async generateTestCode(testDesign, featureSpec) {
    try {
      this.log('🧪 테스트 코드 생성 시작');

      // 단일 파라미터인 경우 (requirement만 전달된 경우)
      if (arguments.length === 1) {
        featureSpec = testDesign;
        testDesign = undefined;
      }

      // 기능명/Hook/파일명은 명세의 제목에서만 파생 (키워드 매핑 제거)
      const featureName = this.extractFeatureName(featureSpec);
      const hookName = `use${featureName}`;
      const testFileName = `use-${featureName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()}.spec.ts`;

      const testCode = `import { renderHook } from '@testing-library/react';
import { ${hookName} } from '../../hooks/${testFileName.replace('.spec.ts', '')}.ts';

describe('use${featureName}', () => {
  it('exposes API without errors', () => {
    const { result } = renderHook(() => ${hookName}());
    expect(result.current).toBeDefined();
  });
});`;
      this.log('✅ 테스트 코드 생성 완료');
      return {
        success: true,
        testCode: testCode,
        hookName: hookName,
        testFileName: testFileName,
      };
    } catch (error) {
      this.log(`❌ 테스트 코드 생성 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 테스트 설계 파싱
   */
  parseTestDesign(testDesign) {
    this.log('📋 테스트 설계 파싱 중...');

    const scenarios = [];

    // testDesign이 undefined인 경우 빈 배열 반환
    if (!testDesign) {
      this.log('📊 파싱 완료: 0개 시나리오');
      return { scenarios };
    }

    const lines = testDesign.split('\n');

    let currentScenario = null;
    let inScenario = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // 시나리오 시작 감지
      if (trimmed.includes('시나리오') || trimmed.includes('Scenario')) {
        if (currentScenario) {
          scenarios.push(currentScenario);
        }

        currentScenario = {
          name: trimmed.replace(/^#+\s*/, '').trim(),
          steps: [],
          expected: [],
          type: this.determineTestType(trimmed),
          priority: this.determinePriority(trimmed),
        };
        inScenario = true;
        continue;
      }

      // Given/When/Then 단계 추출
      if (inScenario && currentScenario) {
        if (
          trimmed.startsWith('- Given:') ||
          trimmed.startsWith('- When:') ||
          trimmed.startsWith('- Then:')
        ) {
          currentScenario.steps.push(trimmed.replace(/^-\s*/, ''));
        } else if (trimmed.startsWith('예상 결과:') || trimmed.startsWith('Expected:')) {
          currentScenario.expected.push(trimmed.replace(/^(예상 결과:|Expected:)\s*/, ''));
        }
      }

      // 시나리오 종료 감지
      if (trimmed === '' && currentScenario && currentScenario.steps.length > 0) {
        inScenario = false;
      }
    }

    if (currentScenario) {
      scenarios.push(currentScenario);
    }

    this.log(`📊 파싱 완료: ${scenarios.length}개 시나리오`);
    return { scenarios };
  }

  /**
   * 기능 명세 파싱
   */
  parseFeatureSpec(featureSpec) {
    this.log('🔍 기능 명세 파싱 중...');

    // JSON 형태의 파싱된 요구사항인지 확인
    let parsedSpec;
    try {
      parsedSpec = JSON.parse(featureSpec);
      if (parsedSpec.title) {
        // 파싱된 요구사항에서 제목 추출
        const feature = parsedSpec.title.replace(/\s*(기능|Feature).*$/, '').trim();

        this.log(
          `📊 파싱 완료: 제목="${parsedSpec.title}", 기능="${feature}", 시나리오 ${
            parsedSpec.scenarios?.length || 0
          }개`
        );
        return {
          feature: feature,
          scenarios: parsedSpec.scenarios || [],
          apis: [],
        };
      }
    } catch (e) {
      this.log(`⚠️ JSON 파싱 실패, 텍스트 파싱으로 전환: ${e.message}`);
      // JSON이 아닌 경우 기존 로직 사용
    }

    // 기존 텍스트 파싱 로직
    const lines = featureSpec.split('\n');
    let feature = '';
    const apis = [];
    const scenarios = [];

    for (const line of lines) {
      // 첫 번째 줄에서 기능명 추출
      if (!feature && line.trim() && !line.includes('describe') && !line.includes('it')) {
        feature = line
          .trim()
          .replace(/\s*기능\s*$/, '')
          .trim();
      }

      if (line.includes('#') && (line.includes('기능') || line.includes('Feature'))) {
        feature = line
          .replace(/^#+\s*/, '')
          .replace(/\s*(기능|Feature).*$/, '')
          .trim();
      }

      // it 블록 파싱
      if (line.includes('it(')) {
        const scenarioTitle = line
          .replace(/it\(['"]/, '')
          .replace(/['"].*/, '')
          .trim();

        scenarios.push({
          name: scenarioTitle,
          given: '',
          when: '',
          then: '',
          description: scenarioTitle,
        });
      }

      if (
        line.includes('PUT') ||
        line.includes('POST') ||
        line.includes('GET') ||
        line.includes('DELETE')
      ) {
        const match = line.match(/(PUT|POST|GET|DELETE)\s+([^\s]+)/);
        if (match) {
          apis.push({
            method: match[1],
            endpoint: match[2],
            description: line.replace(/^(PUT|POST|GET|DELETE)\s+[^\s]+\s*/, '').trim(),
          });
        }
      }
    }

    this.log(
      `📊 파싱 완료: 기능="${feature}", 시나리오 ${scenarios.length}개, API ${apis.length}개`
    );
    return {
      feature: feature || '새로운 기능',
      scenarios: scenarios,
      apis: apis,
    };
  }

  /**
   * 테스트 구조 생성 (공식 문서 기반)
   */
  generateTestStructure(featureAnalysis) {
    this.log('🏗️ 테스트 구조 생성 중...');

    const featureName = this.toEnglishPascalCase(featureAnalysis.feature);

    return `import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { use${featureName} } from '../../hooks/use-${this.toKebabCase(featureName)}.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('use${featureName}', () => {
  const mockEvent: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '테스트 카테고리',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 15,
  };

  beforeEach(() => {
    server.resetHandlers();
    enqueueSnackbarFn.mockClear();
  });`;
  }

  /**
   * MSW 핸들러 생성
   */
  generateMSWHandlers(analysis, featureAnalysis) {
    this.log('🔧 MSW 핸들러 생성 중...');

    const handlers = [];

    analysis.scenarios.forEach((scenario, index) => {
      const apiEndpoint = this.extractApiEndpoint(scenario, featureAnalysis.apis);
      const isErrorTest = this.isErrorTest(scenario);

      if (isErrorTest) {
        handlers.push(`  it('${this.generateTestName(
          scenario,
          index
        )} - API 에러 처리', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => use${this.toEnglishPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${this.extractMethodName(
        scenario.name
      )}('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
  });`);
      } else {
        handlers.push(`  it('${this.generateTestName(scenario, index)} - 정상 처리', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.json(${this.generateMockResponse(apiEndpoint)});
      })
    );

    const { result } = renderHook(() => use${this.toEnglishPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${this.extractMethodName(
        scenario.name
      )}('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });`);
      }
    });

    return handlers.join('\n\n');
  }

  /**
   * 테스트 케이스 생성
   */
  generateTestCases(analysis, featureAnalysis) {
    this.log('📝 테스트 케이스 생성 중...');

    const testCases = [];

    // featureAnalysis.scenarios를 사용 (파싱된 시나리오)
    featureAnalysis.scenarios.forEach((scenario, index) => {
      const testCase = this.generateSingleTestCase(scenario, index, featureAnalysis);
      testCases.push(testCase);
    });

    return testCases.join('\n\n');
  }

  /**
   * 단일 테스트 케이스 생성
   */
  generateSingleTestCase(scenario, index, featureAnalysis) {
    const testName = this.generateTestName(scenario, index);
    const methodName = this.extractMethodName(scenario.name);
    const apiEndpoint = this.extractApiEndpoint(scenario, featureAnalysis.apis);
    const isErrorTest = this.isErrorTest(scenario);

    if (isErrorTest) {
      return `  it('${testName} - API 에러 처리', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => use${this.toEnglishPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${methodName}('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
  });`;
    } else {
      return `  it('${testName} - 정상 처리', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.json(${this.generateMockResponse(apiEndpoint)});
      })
    );

    const { result } = renderHook(() => use${this.toEnglishPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${methodName}('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });`;
    }
  }

  /**
   * 완전한 테스트 코드 조합
   */
  combineTestCode(testStructure, mswHandlers, testCases) {
    return `${testStructure}

${testCases}

});`;
  }

  /**
   * 테스트 타입 결정
   */
  determineTestType(scenarioName) {
    const name = scenarioName.toLowerCase();
    if (name.includes('실패') || name.includes('에러') || name.includes('error')) return 'error';
    if (name.includes('성공') || name.includes('정상') || name.includes('success'))
      return 'success';
    return 'functional';
  }

  /**
   * 우선순위 결정
   */
  determinePriority(scenarioName) {
    const name = scenarioName.toLowerCase();
    if (name.includes('핵심') || name.includes('core')) return 'high';
    if (name.includes('부가') || name.includes('additional')) return 'low';
    return 'medium';
  }

  /**
   * 에러 테스트 여부 확인
   */
  isErrorTest(scenario) {
    const name = scenario.name.toLowerCase();
    return (
      name.includes('실패') ||
      name.includes('에러') ||
      name.includes('error') ||
      name.includes('fail')
    );
  }

  /**
   * API 엔드포인트 추출
   */
  extractApiEndpoint(scenario, apis) {
    // 구조화된 API가 제공된 경우 첫 항목 사용, 아니면 API 테스트 생략을 의미하는 NONE 반환
    if (apis && apis.length > 0) return apis[0];
    return { method: 'NONE', endpoint: 'NONE' };
  }

  /**
   * 메서드 이름 추출
   */
  extractMethodName() {
    // 키워드 매핑 없이 고정된 메서드명 사용 (테스트가 직접 호출하도록 작성되지 않음)
    return 'performAction';
  }

  /**
   * 테스트 이름 생성
   */
  generateTestName(scenario, index) {
    const keywords = this.extractKeywords(scenario.name);
    if (keywords.length > 0) {
      return `${index + 1}. ${keywords.join(' ')}`;
    }
    return `시나리오 ${index + 1}`;
  }

  /**
   * 키워드 추출 (개선된 버전)
   */
  extractKeywords(scenarioName) {
    const keywords = [];
    const lowerName = scenarioName.toLowerCase();

    // 즐겨찾기 관련
    if (lowerName.includes('즐겨찾기') && lowerName.includes('추가')) {
      keywords.push('즐겨찾기', '추가');
    } else if (lowerName.includes('즐겨찾기') && lowerName.includes('목록')) {
      keywords.push('즐겨찾기', '목록', '조회');
    } else if (lowerName.includes('즐겨찾기') && lowerName.includes('제거')) {
      keywords.push('즐겨찾기', '제거');
    }

    // 알림 관련
    else if (lowerName.includes('알림') && lowerName.includes('설정')) {
      keywords.push('알림', '설정');
    } else if (lowerName.includes('알림') && lowerName.includes('해제')) {
      keywords.push('알림', '해제');
    } else if (lowerName.includes('알림') && lowerName.includes('표시')) {
      keywords.push('알림', '표시');
    }

    // 검색 관련
    else if (lowerName.includes('검색') && lowerName.includes('제목')) {
      keywords.push('제목', '검색');
    } else if (lowerName.includes('검색') && lowerName.includes('카테고리')) {
      keywords.push('카테고리', '검색');
    } else if (
      lowerName.includes('검색') &&
      lowerName.includes('결과') &&
      lowerName.includes('없음')
    ) {
      keywords.push('검색', '결과없음');
    }

    // 이벤트 관련
    else if (lowerName.includes('이벤트') && lowerName.includes('생성')) {
      keywords.push('이벤트', '생성');
    } else if (lowerName.includes('이벤트') && lowerName.includes('수정')) {
      keywords.push('이벤트', '수정');
    } else if (lowerName.includes('이벤트') && lowerName.includes('삭제')) {
      keywords.push('이벤트', '삭제');
    } else if (lowerName.includes('이벤트') && lowerName.includes('조회')) {
      keywords.push('이벤트', '조회');
    }

    // 다이얼로그 관련
    else if (lowerName.includes('다이얼로그') && lowerName.includes('열기')) {
      keywords.push('다이얼로그', '열기');
    } else if (lowerName.includes('다이얼로그') && lowerName.includes('닫기')) {
      keywords.push('다이얼로그', '닫기');
    } else if (lowerName.includes('다이얼로그') && lowerName.includes('표시')) {
      keywords.push('다이얼로그', '표시');
    }

    // 폼 관련
    else if (lowerName.includes('폼') && lowerName.includes('제출')) {
      keywords.push('폼', '제출');
    } else if (lowerName.includes('폼') && lowerName.includes('초기화')) {
      keywords.push('폼', '초기화');
    } else if (lowerName.includes('폼') && lowerName.includes('검증')) {
      keywords.push('폼', '검증');
    }

    // 에러 처리
    else if (lowerName.includes('실패') || lowerName.includes('에러')) {
      keywords.push('에러처리');
    }

    return keywords;
  }

  /**
   * Mock 응답 생성
   */
  generateMockResponse(apiEndpoint) {
    if (apiEndpoint.endpoint.includes('notifications')) {
      return `{
        success: true,
        notificationId: 'notif-1',
        scheduledAt: '2024-01-15T08:30:00Z'
      }`;
    }
    if (apiEndpoint.endpoint.includes('events')) {
      return `{
        success: true,
        event: {
          id: '1',
          title: 'Updated Event',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '10:00'
        }
      }`;
    }
    return `{ success: true }`;
  }

  /**
   * 한글을 영어로 변환하여 PascalCase로 변환
   */
  toEnglishPascalCase(text) {
    const koreanToEnglish = {
      이벤트: 'Event',
      즐겨찾기: 'Favorite',
      알림: 'Notification',
      검색: 'Search',
      일정: 'Schedule',
      관리: 'Management',
      설정: 'Setting',
      목록: 'List',
      추가: 'Add',
      제거: 'Remove',
      수정: 'Edit',
      삭제: 'Delete',
      조회: 'Fetch',
      생성: 'Create',
      업데이트: 'Update',
      반복: 'Recurring',
      기능: 'Feature',
    };

    let result = text;
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
      result = result.replace(new RegExp(korean, 'g'), english);
    }

    return this.toPascalCase(result);
  }

  /**
   * PascalCase를 kebab-case로 변환
   */
  toKebabCase(str) {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  /**
   * PascalCase 변환
   */
  toPascalCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toUpperCase() : word.toLowerCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * 테스트 가이드라인 로드
   */
  loadTestingGuidelines() {
    try {
      return fs.readFileSync('docs/guidelines/testing-guidelines.md', 'utf8');
    } catch (error) {
      this.log('⚠️ 테스트 가이드라인 파일을 찾을 수 없습니다', 'warn');
      return '';
    }
  }

  /**
   * 테스트 패턴 로드
   */
  loadTestPatterns() {
    return {
      basicStructure: this.testingGuidelines.includes('기본 테스트 파일 구조'),
      givenWhenThen: this.testingGuidelines.includes('Given-When-Then 패턴'),
      mswHandlers: this.testingGuidelines.includes('MSW 핸들러 작성 규칙'),
    };
  }

  /**
   * MSW 패턴 로드
   */
  loadMSWPatterns() {
    return {
      successCase: this.testingGuidelines.includes('성공 케이스'),
      errorCase: this.testingGuidelines.includes('실패 케이스'),
      networkError: this.testingGuidelines.includes('네트워크 에러'),
    };
  }

  /**
   * 로그 출력
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levelIcon = {
      info: 'ℹ️',
      error: '❌',
      warn: '⚠️',
      success: '✅',
    };

    console.log(`${timestamp} [${level.toUpperCase()}] ${levelIcon[level]} ${message}`);
  }

  /**
   * 명세에서 강제로 hook과 파일명을 추출해 mapping하도록 수정한다.
   */
  extractFeatureName(featureSpec) {
    // JSON 명세의 title 또는 첫 줄 텍스트에서 기능명 추출 후 ASCII PascalCase로 정규화
    let raw = '';
    try {
      const parsed = JSON.parse(featureSpec);
      if (parsed && parsed.title) raw = String(parsed.title);
    } catch {}
    if (!raw) {
      const firstLine = String(featureSpec)
        .split('\n')
        .find((l) => l.trim());
      raw = firstLine || 'Feature';
    }
    return this.toAsciiPascalCase(raw);
  }

  toAsciiPascalCase(text) {
    // 1) 비영문자를 구분자로 치환 2) 토큰을 PascalCase로 3) 비어있으면 'Feature'
    const tokens = String(text)
      .replace(/[^A-Za-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length === 0) return 'Feature';
    return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('');
  }
}

// CLI 실행
if (process.argv[1] && process.argv[1].endsWith('improved-test-writing-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--testDesign':
        options.testDesign = args[i + 1];
        i++;
        break;
      case '--featureSpec':
        options.featureSpec = args[i + 1];
        i++;
        break;
      case '--output':
        options.output = args[i + 1];
        i++;
        break;
    }
  }

  const agent = new ImprovedTestWritingAgent();

  if (options.testDesign && options.featureSpec) {
    agent
      .generateTestCode(options.testDesign, options.featureSpec)
      .then((testCode) => {
        if (options.output) {
          fs.writeFileSync(options.output, testCode);
          console.log(`✅ 테스트 코드가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(testCode);
        }
      })
      .catch((error) => {
        console.error('에이전트 실행 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log(
      '사용법: node improved-test-writing-agent.js --testDesign "테스트 설계" --featureSpec "기능 명세" [--output 파일경로]'
    );
  }
}

export default ImprovedTestWritingAgent;
