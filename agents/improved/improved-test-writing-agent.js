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

      // 1. 테스트 설계 분석
      const analysis = this.parseTestDesign(testDesign);
      
      // 2. 기능 명세 분석
      const featureAnalysis = this.parseFeatureSpec(featureSpec);
      
      // 3. 테스트 구조 생성
      const testStructure = this.generateTestStructure(featureAnalysis);
      
      // 4. MSW 핸들러 생성
      const mswHandlers = this.generateMSWHandlers(analysis, featureAnalysis);
      
      // 5. 테스트 케이스 생성
      const testCases = this.generateTestCases(analysis, featureAnalysis);
      
      // 6. 완전한 테스트 코드 조합
      const completeTestCode = this.combineTestCode(testStructure, mswHandlers, testCases);
      
      this.log('✅ 테스트 코드 생성 완료');
      return completeTestCode;
      
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
          priority: this.determinePriority(trimmed)
        };
        inScenario = true;
        continue;
      }
      
      // Given/When/Then 단계 추출
      if (inScenario && currentScenario) {
        if (trimmed.startsWith('- Given:') || trimmed.startsWith('- When:') || trimmed.startsWith('- Then:')) {
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
    
    const lines = featureSpec.split('\n');
    let feature = '';
    const apis = [];
    
    for (const line of lines) {
      if (line.includes('#') && (line.includes('기능') || line.includes('Feature'))) {
        feature = line.replace(/^#+\s*/, '').replace(/\s*(기능|Feature).*$/, '').trim();
      }
      
      if (line.includes('PUT') || line.includes('POST') || line.includes('GET') || line.includes('DELETE')) {
        const match = line.match(/(PUT|POST|GET|DELETE)\s+([^\s]+)/);
        if (match) {
          apis.push({
            method: match[1],
            endpoint: match[2],
            description: line.replace(/^(PUT|POST|GET|DELETE)\s+[^\s]+\s*/, '').trim()
          });
        }
      }
    }
    
    return { feature, apis };
  }

  /**
   * 테스트 구조 생성 (공식 문서 기반)
   */
  generateTestStructure(featureAnalysis) {
    this.log('🏗️ 테스트 구조 생성 중...');
    
    const featureName = this.toPascalCase(featureAnalysis.feature);
    
    return `import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { use${featureName} } from '../../hooks/use${featureName}.ts';
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
        handlers.push(`  it('${this.generateTestName(scenario, index)} - API 에러 처리', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => use${this.toPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${this.extractMethodName(scenario.name)}('test-id', { title: 'test-title' });
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

    const { result } = renderHook(() => use${this.toPascalCase(featureAnalysis.feature)}());

    await act(async () => {
      await result.current.${this.extractMethodName(scenario.name)}('test-id', { title: 'test-title' });
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
    
    analysis.scenarios.forEach((scenario, index) => {
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

    const { result } = renderHook(() => use${this.toPascalCase(featureAnalysis.feature)}());

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

    const { result } = renderHook(() => use${this.toPascalCase(featureAnalysis.feature)}());

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
    if (name.includes('성공') || name.includes('정상') || name.includes('success')) return 'success';
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
    return name.includes('실패') || name.includes('에러') || name.includes('error') || name.includes('fail');
  }

  /**
   * API 엔드포인트 추출
   */
  extractApiEndpoint(scenario, apis) {
    const name = scenario.name.toLowerCase();
    
    // 시나리오 이름에서 API 매칭
    for (const api of apis) {
      if (name.includes(api.method.toLowerCase()) || name.includes(api.endpoint.split('/').pop())) {
        return api;
      }
    }
    
    // 기본값 반환
    return { method: 'POST', endpoint: '/api/endpoint' };
  }

  /**
   * 메서드 이름 추출
   */
  extractMethodName(scenarioName) {
    const name = scenarioName.toLowerCase();
    
    if (name.includes('알림') && name.includes('설정')) return 'scheduleNotification';
    if (name.includes('알림') && name.includes('표시')) return 'showNotification';
    if (name.includes('알림') && name.includes('해제')) return 'cancelNotification';
    if (name.includes('단일') && name.includes('수정')) return 'editSingleEvent';
    if (name.includes('전체') && name.includes('수정')) return 'editRecurringEvent';
    if (name.includes('다이얼로그') && name.includes('표시')) return 'openEditDialog';
    if (name.includes('취소')) return 'closeEditDialog';
    if (name.includes('생성') || name.includes('create')) return 'createEvent';
    if (name.includes('삭제') || name.includes('delete')) return 'deleteEvent';
    if (name.includes('조회') || name.includes('fetch')) return 'fetchEvents';
    
    return 'handleAction';
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
   * 키워드 추출
   */
  extractKeywords(scenarioName) {
    const keywords = [];
    const lowerName = scenarioName.toLowerCase();
    
    if (lowerName.includes('알림')) keywords.push('알림');
    if (lowerName.includes('설정')) keywords.push('설정');
    if (lowerName.includes('표시')) keywords.push('표시');
    if (lowerName.includes('해제')) keywords.push('해제');
    if (lowerName.includes('단일')) keywords.push('단일수정');
    if (lowerName.includes('전체')) keywords.push('전체수정');
    if (lowerName.includes('다이얼로그')) keywords.push('다이얼로그');
    if (lowerName.includes('생성')) keywords.push('생성');
    if (lowerName.includes('삭제')) keywords.push('삭제');
    if (lowerName.includes('조회')) keywords.push('조회');
    if (lowerName.includes('실패') || lowerName.includes('에러')) keywords.push('에러처리');
    
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
      mswHandlers: this.testingGuidelines.includes('MSW 핸들러 작성 규칙')
    };
  }

  /**
   * MSW 패턴 로드
   */
  loadMSWPatterns() {
    return {
      successCase: this.testingGuidelines.includes('성공 케이스'),
      errorCase: this.testingGuidelines.includes('실패 케이스'),
      networkError: this.testingGuidelines.includes('네트워크 에러')
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
      success: '✅'
    };
    
    console.log(`${timestamp} [${level.toUpperCase()}] ${levelIcon[level]} ${message}`);
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
    agent.generateTestCode(options.testDesign, options.featureSpec)
      .then(testCode => {
        if (options.output) {
          fs.writeFileSync(options.output, testCode);
          console.log(`✅ 테스트 코드가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(testCode);
        }
      })
      .catch(error => {
        console.error('에이전트 실행 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node improved-test-writing-agent.js --testDesign "테스트 설계" --featureSpec "기능 명세" [--output 파일경로]');
  }
}

export { ImprovedTestWritingAgent };
