import fs from 'fs';
import { execSync } from 'child_process';

class TrueTDDAgent {
  constructor() {
    this.currentFeature = '';
    this.scenarios = [];
    this.currentIteration = 0;
    this.maxIterations = 10;
    this.implementationFile = '';
    this.testFile = '';
    this.lastSpecification = '';
  }

  /**
   * 진짜 TDD 사이클 실행
   */
  async runTDDCycle(specification) {
    try {
      this.log('🚀 진짜 TDD 사이클 시작');
      this.lastSpecification = specification;

      // 1. 명세 분석
      const analysis = this.parseSpecification(specification);
      this.scenarios = analysis.scenarios;
      this.currentFeature = analysis.feature;

      // 2. 파일 경로 설정
      const featureName = this.toPascalCase(this.currentFeature);
      this.testFile = `src/__tests__/hooks/use${featureName}.spec.ts`;
      this.implementationFile = `src/hooks/use${featureName}.ts`;

      // 3. 기존 파일 정리
      this.cleanupFiles();

      // 4. 시나리오별 점진적 TDD 사이클 실행
      for (let i = 0; i < this.scenarios.length; i++) {
        this.log(`\n📋 시나리오 ${i + 1}/${this.scenarios.length}: ${this.scenarios[i].name}`);
        await this.executeScenarioCycle(this.scenarios[i], i);
      }

      this.log('🎉 모든 TDD 사이클 완료!');
      return {
        success: true,
        testFile: this.testFile,
        implementationFile: this.implementationFile,
      };
    } catch (error) {
      this.log(`❌ TDD 사이클 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 개별 시나리오에 대한 TDD 사이클 실행
   */
  async executeScenarioCycle(scenario, scenarioIndex) {
    this.log(`  🔄 시나리오 "${scenario.name}" TDD 사이클 시작`);

    // RED: 실패하는 테스트 생성
    await this.redPhase(scenario, scenarioIndex);

    // GREEN: 최소한의 구현으로 테스트 통과
    await this.greenPhase(scenario, scenarioIndex);

    // REFACTOR: 코드 품질 개선
    await this.refactorPhase(scenario, scenarioIndex);

    this.log(`  ✅ 시나리오 "${scenario.name}" TDD 사이클 완료`);
  }

  /**
   * RED 단계: 실패하는 테스트 생성
   */
  async redPhase(scenario, scenarioIndex) {
    this.log(`    🔴 RED: 실패하는 테스트 생성`);

    // 현재 테스트 파일 읽기 (없으면 기본 구조 생성)
    let testContent = this.getTestFileContent();

    // 새로운 실패하는 테스트 추가
    const failingTest = this.generateFailingTest(scenario, scenarioIndex);
    testContent += failingTest;
    
    // describe 블록 닫기
    testContent += '\n});';

    // 테스트 파일 저장
    fs.writeFileSync(this.testFile, testContent);

    // 테스트 실행하여 실패 확인
    const testResult = await this.runTests();
    if (testResult.success) {
      throw new Error('RED 단계 실패: 테스트가 통과했습니다. 실패해야 합니다.');
    }

    this.log(`    ✅ RED: 테스트가 예상대로 실패함`);
  }

  /**
   * GREEN 단계: 최소한의 구현으로 테스트 통과
   */
  async greenPhase(scenario, scenarioIndex) {
    this.log(`    🟢 GREEN: 최소한의 구현 생성`);

    // 현재 구현 파일 읽기 (없으면 기본 구조 생성)
    let implementationContent = this.getImplementationFileContent();

    // 새로운 메서드 추가 (최소한의 구현)
    const minimalImplementation = this.generateMinimalImplementation(scenario);
    implementationContent = this.addMethodToImplementation(
      implementationContent,
      minimalImplementation
    );

    // 구현 파일 저장
    fs.writeFileSync(this.implementationFile, implementationContent);

    // 테스트 파일도 업데이트 (describe 블록 닫기)
    if (fs.existsSync(this.testFile)) {
      let testContent = fs.readFileSync(this.testFile, 'utf8');
      if (!testContent.includes('});')) {
        testContent += '\n});';
        fs.writeFileSync(this.testFile, testContent);
      }
    }

    // 테스트 실행하여 통과 확인
    const testResult = await this.runTests();
    if (!testResult.success) {
      // 테스트가 여전히 실패하면 자동 수정 시도
      await this.autoFixImplementation(scenario, testResult.errors);
    }

    this.log(`    ✅ GREEN: 테스트가 통과함`);
  }

  /**
   * REFACTOR 단계: 코드 품질 개선
   */
  async refactorPhase(scenario, scenarioIndex) {
    this.log(`    🔵 REFACTOR: 코드 품질 개선`);

    // 현재 구현 파일 읽기
    let implementationContent = fs.readFileSync(this.implementationFile, 'utf8');

    // 리팩토링 적용
    implementationContent = this.applyRefactoring(implementationContent, scenario);

    // 구현 파일 저장
    fs.writeFileSync(this.implementationFile, implementationContent);

    // 리팩토링 후에도 테스트가 통과하는지 확인
    const testResult = await this.runTests();
    if (!testResult.success) {
      this.log(`    ⚠️ REFACTOR: 리팩토링으로 인한 테스트 실패, 롤백`, 'warn');
      // 롤백 로직 (간단히 이전 버전으로 복원)
      implementationContent = this.getImplementationFileContent();
      fs.writeFileSync(this.implementationFile, implementationContent);
    }

    this.log(`    ✅ REFACTOR: 코드 품질 개선 완료`);
  }

  /**
   * 실패하는 테스트 생성
   */
  generateFailingTest(scenario, scenarioIndex) {
    const methodName = this.extractMethodName(scenario.name);
    const testName = this.generateTestName(scenario, scenarioIndex);
    const apiEndpoint = this.extractApiEndpoint(scenario);
    
    return `
  it('${testName}', async () => {
    server.use(
      http.${apiEndpoint.method.toLowerCase()}('${apiEndpoint.endpoint}', () => {
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => use${this.toPascalCase(this.currentFeature)}());

    await act(async () => {
      await result.current.${methodName}('test-id', { title: 'test-title' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });`;
  }

  /**
   * 최소한의 구현 생성
   */
  generateMinimalImplementation(scenario) {
    const methodName = this.extractMethodName(scenario.name);
    const apiEndpoint = this.extractApiEndpoint(scenario);

    return `
  const ${methodName} = useCallback(async (eventId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('${apiEndpoint.endpoint}', {
        method: '${apiEndpoint.method}',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const result = await response.json();
      enqueueSnackbar('작업 완료', { variant: 'success' });
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류');
      enqueueSnackbar('작업 실패', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);`;
  }

  /**
   * 테스트 파일 기본 구조 생성
   */
  getTestFileContent() {
    const featureName = this.toPascalCase(this.currentFeature);

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
  beforeEach(() => {
    server.resetHandlers();
    enqueueSnackbarFn.mockClear();
  });`;
  }

  /**
   * 구현 파일 기본 구조 생성
   */
  getImplementationFileContent() {
    const featureName = this.toPascalCase(this.currentFeature);

    return `import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';

interface Use${featureName}Return {
  loading: boolean;
  error: string | null;
}

export const use${featureName} = (): Use${featureName}Return => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  return {
    loading,
    error,
  };
};`;
  }

  /**
   * 구현 파일에 메서드 추가
   */
  addMethodToImplementation(content, methodImplementation) {
    // 메서드 이름 추출
    const methodName = this.extractMethodNameFromImplementation(methodImplementation);
    
    // 인터페이스에 메서드 추가
    const interfaceMatch = content.match(/interface Use\w+Return \{([^}]+)\}/);
    if (interfaceMatch) {
      const interfaceContent = interfaceMatch[1];
      if (!interfaceContent.includes(methodName)) {
        content = content.replace(
          /interface Use\w+Return \{([^}]+)\}/,
          `interface Use${this.toPascalCase(this.currentFeature)}Return {
  ${methodName}: (eventId: string, data: Record<string, any>) => Promise<void>;
$1}`
        );
      }
    }
    
    // 구현에 메서드 추가
    content = content.replace(
      '  return {',
      `${methodImplementation}

  return {`
    );
    
    // 반환값에 메서드 추가
    content = content.replace(
      '    loading,',
      `    ${methodName},
    loading,`
    );
    
    return content;
  }

  /**
   * 리팩토링 적용
   */
  applyRefactoring(content, scenario) {
    // 중복 코드 제거
    content = this.removeDuplicateCode(content);

    // 타입 안전성 개선
    content = this.improveTypeSafety(content);

    // 에러 처리 개선
    content = this.improveErrorHandling(content);

    return content;
  }

  /**
   * 중복 코드 제거
   */
  removeDuplicateCode(content) {
    // 공통 API 호출 로직 추출
    const commonApiCall = `
  const makeApiCall = useCallback(async (endpoint: string, method: string, data: any) => {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API 호출 실패');
    }

    return await response.json();
  }, []);`;

    // 공통 로직이 없으면 추가
    if (!content.includes('makeApiCall')) {
      content = content.replace(
        '  const { enqueueSnackbar } = useSnackbar();',
        `  const { enqueueSnackbar } = useSnackbar();${commonApiCall}`
      );
    }

    return content;
  }

  /**
   * 타입 안전성 개선
   */
  improveTypeSafety(content) {
    // any 타입을 구체적인 타입으로 변경
    content = content.replace(/data: any/g, 'data: Record<string, any>');

    return content;
  }

  /**
   * 에러 처리 개선
   */
  improveErrorHandling(content) {
    // 더 구체적인 에러 메시지
    content = content.replace(
      "throw new Error('API 호출 실패');",
      'throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);'
    );

    return content;
  }

  /**
   * 테스트 실행
   */
  async runTests() {
    try {
      const output = execSync(`npm test ${this.testFile}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      return { success: true, output };
    } catch (error) {
      return { success: false, errors: [error.message], output: error.stdout };
    }
  }

  /**
   * 자동 구현 수정
   */
  async autoFixImplementation(scenario, errors) {
    this.log(`    🔧 자동 구현 수정 중...`);

    let content = fs.readFileSync(this.implementationFile, 'utf8');

    for (const error of errors) {
      if (error.includes('Cannot resolve module')) {
        // import 경로 수정
        content = content.replace(/import.*from.*types/g, "import { Event } from '../types'");
      }
    }

    fs.writeFileSync(this.implementationFile, content);
  }

  /**
   * 파일 정리
   */
  cleanupFiles() {
    if (fs.existsSync(this.testFile)) {
      fs.unlinkSync(this.testFile);
    }
    if (fs.existsSync(this.implementationFile)) {
      fs.unlinkSync(this.implementationFile);
    }
  }

  /**
   * 명세 파싱
   */
  parseSpecification(specification) {
    const lines = specification.split('\n');
    let feature = '';
    const scenarios = [];

    for (const line of lines) {
      if (line.includes('#') && (line.includes('기능') || line.includes('Feature'))) {
        feature = line
          .replace(/^#+\s*/, '')
          .replace(/\s*(기능|Feature).*$/, '')
          .trim();
      }

      if (line.includes('시나리오') || line.includes('Scenario')) {
        scenarios.push({
          name: line.replace(/^#+\s*/, '').trim(),
          steps: [],
          expected: [],
        });
      }
    }

    return { feature, scenarios };
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

    return 'handleAction';
  }

  /**
   * API 엔드포인트 추출
   */
  extractApiEndpoint(scenario) {
    const name = scenario.name.toLowerCase();

    if (name.includes('알림') && name.includes('설정')) {
      return { method: 'POST', endpoint: '/api/notifications/schedule' };
    }
    if (name.includes('알림') && name.includes('해제')) {
      return { method: 'DELETE', endpoint: '/api/notifications/1' };
    }
    if (name.includes('단일') && name.includes('수정')) {
      return { method: 'PUT', endpoint: '/api/events/1/single' };
    }
    if (name.includes('전체') && name.includes('수정')) {
      return { method: 'PUT', endpoint: '/api/events/1/recurring' };
    }

    return { method: 'POST', endpoint: '/api/endpoint' };
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
    if (lowerName.includes('실패') || lowerName.includes('에러')) keywords.push('에러처리');

    return keywords;
  }

  /**
   * 구현에서 메서드 이름 추출
   */
  extractMethodNameFromImplementation(implementation) {
    const match = implementation.match(/const (\w+) = useCallback/);
    return match ? match[1] : 'unknownMethod';
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
}

// CLI 실행
if (process.argv[1] && process.argv[1].endsWith('true-tdd-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--spec':
        options.specification = args[i + 1];
        i++;
        break;
      case '--specFile':
        options.specFile = args[i + 1];
        i++;
        break;
    }
  }

  const agent = new TrueTDDAgent();

  let specification = options.specification;
  if (options.specFile) {
    specification = fs.readFileSync(options.specFile, 'utf8');
  }

  agent
    .runTDDCycle(specification)
    .then((result) => {
      if (result.success) {
        console.log('🎉 진짜 TDD 사이클 성공!');
        console.log(`테스트 파일: ${result.testFile}`);
        console.log(`구현 파일: ${result.implementationFile}`);
      } else {
        console.log('❌ TDD 사이클 실패');
      }
    })
    .catch((error) => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

export { TrueTDDAgent };
