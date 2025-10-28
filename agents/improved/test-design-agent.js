import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Test Design Agent
 * 기능 명세를 분석하고 체계적인 테스트 설계를 생성하는 에이전트
 */
class TestDesignAgent {
  constructor() {
    this.testStrategies = this.loadTestStrategies();
    this.testPatterns = this.loadTestPatterns();
    this.kentBeckPrinciples = this.loadKentBeckPrinciples();
  }

  /**
   * 테스트 설계 실행
   */
  async designTests(featureSpec, options = {}) {
    try {
      this.log('🧪 테스트 설계 시작');

      // 1. 기능 명세 분석
      const featureAnalysis = this.analyzeFeatureSpecification(featureSpec);
      
      // 2. 테스트 전략 수립
      const testStrategy = this.establishTestStrategy(featureAnalysis);
      
      // 3. 테스트 케이스 설계
      const testCases = this.designTestCases(featureAnalysis, testStrategy);
      
      // 4. 테스트 데이터 설계
      const testData = this.designTestData(featureAnalysis);
      
      // 5. 모킹 전략 수립
      const mockingStrategy = this.establishMockingStrategy(featureAnalysis);
      
      // 6. 테스트 우선순위 설정
      const testPriorities = this.setTestPriorities(testCases);
      
      // 7. 테스트 명세서 생성
      const testSpecification = this.generateTestSpecification(
        featureAnalysis, 
        testStrategy, 
        testCases, 
        testData, 
        mockingStrategy, 
        testPriorities
      );
      
      this.log('✅ 테스트 설계 완료');
      
      return {
        success: true,
        testSpecification,
        testStrategy,
        testCases,
        testData,
        mockingStrategy,
        testPriorities
      };
      
    } catch (error) {
      this.log(`❌ 테스트 설계 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 기능 명세 분석
   */
  analyzeFeatureSpecification(featureSpec) {
    this.log('📋 기능 명세 분석 중...');
    
    const analysis = {
      title: this.extractFeatureTitle(featureSpec),
      userStories: this.extractUserStories(featureSpec),
      apiEndpoints: this.extractAPIEndpoints(featureSpec),
      scenarios: this.extractScenarios(featureSpec),
      acceptanceCriteria: this.extractAcceptanceCriteria(featureSpec),
      complexity: this.assessTestComplexity(featureSpec),
      riskAreas: this.identifyRiskAreas(featureSpec)
    };
    
    this.log(`📊 분석 완료: ${analysis.userStories.length}개 사용자 스토리, ${analysis.apiEndpoints.length}개 API`);
    return analysis;
  }

  /**
   * 테스트 전략 수립
   */
  establishTestStrategy(featureAnalysis) {
    this.log('🎯 테스트 전략 수립 중...');
    
    const strategy = {
      testPyramid: this.defineTestPyramid(featureAnalysis),
      coverageGoals: this.defineCoverageGoals(featureAnalysis),
      testTypes: this.identifyTestTypes(featureAnalysis),
      testingApproach: this.determineTestingApproach(featureAnalysis)
    };
    
    this.log(`📈 전략 수립 완료: ${strategy.testTypes.length}개 테스트 타입`);
    return strategy;
  }

  /**
   * 테스트 케이스 설계
   */
  designTestCases(featureAnalysis, testStrategy) {
    this.log('📝 테스트 케이스 설계 중...');
    
    const testCases = [];
    
    // 사용자 스토리별 테스트 케이스
    featureAnalysis.userStories.forEach(story => {
      const storyTestCases = this.generateStoryTestCases(story, featureAnalysis);
      testCases.push(...storyTestCases);
    });
    
    // API 엔드포인트별 테스트 케이스
    featureAnalysis.apiEndpoints.forEach(endpoint => {
      const apiTestCases = this.generateAPITestCases(endpoint, featureAnalysis);
      testCases.push(...apiTestCases);
    });
    
    // 통합 테스트 케이스
    const integrationTestCases = this.generateIntegrationTestCases(featureAnalysis);
    testCases.push(...integrationTestCases);
    
    this.log(`✅ 테스트 케이스 설계 완료: ${testCases.length}개 케이스`);
    return testCases;
  }

  /**
   * 테스트 데이터 설계
   */
  designTestData(featureAnalysis) {
    this.log('📊 테스트 데이터 설계 중...');
    
    const testData = {
      mockData: this.generateMockData(featureAnalysis),
      testFixtures: this.generateTestFixtures(featureAnalysis),
      edgeCases: this.identifyEdgeCases(featureAnalysis),
      boundaryValues: this.identifyBoundaryValues(featureAnalysis)
    };
    
    this.log('✅ 테스트 데이터 설계 완료');
    return testData;
  }

  /**
   * 모킹 전략 수립
   */
  establishMockingStrategy(featureAnalysis) {
    this.log('🎭 모킹 전략 수립 중...');
    
    const strategy = {
      apiMocks: this.designAPIMocks(featureAnalysis),
      componentMocks: this.designComponentMocks(featureAnalysis),
      hookMocks: this.designHookMocks(featureAnalysis),
      externalServiceMocks: this.designExternalServiceMocks(featureAnalysis)
    };
    
    this.log('✅ 모킹 전략 수립 완료');
    return strategy;
  }

  /**
   * 테스트 우선순위 설정
   */
  setTestPriorities(testCases) {
    this.log('⚡ 테스트 우선순위 설정 중...');
    
    const priorities = {
      high: testCases.filter(testCase => this.isHighPriority(testCase)),
      medium: testCases.filter(testCase => this.isMediumPriority(testCase)),
      low: testCases.filter(testCase => this.isLowPriority(testCase))
    };
    
    this.log(`📊 우선순위 설정 완료: High ${priorities.high.length}개, Medium ${priorities.medium.length}개, Low ${priorities.low.length}개`);
    return priorities;
  }

  /**
   * 테스트 명세서 생성
   */
  generateTestSpecification(featureAnalysis, testStrategy, testCases, testData, mockingStrategy, testPriorities) {
    this.log('📄 테스트 명세서 생성 중...');
    
    const specContent = `# ${featureAnalysis.title} 테스트 명세서

## 1. 테스트 개요
- **기능**: ${featureAnalysis.title}
- **테스트 목표**: 기능의 정확성과 안정성 검증
- **테스트 범위**: ${testStrategy.testTypes.join(', ')}

## 2. 테스트 전략
### 테스트 피라미드
- **단위 테스트**: ${testStrategy.testPyramid.unit}% (Hook, 유틸리티 함수)
- **통합 테스트**: ${testStrategy.testPyramid.integration}% (API 통합, 컴포넌트 통합)
- **E2E 테스트**: ${testStrategy.testPyramid.e2e}% (사용자 시나리오)

### 커버리지 목표
- **라인 커버리지**: ${testStrategy.coverageGoals.line}% 이상
- **브랜치 커버리지**: ${testStrategy.coverageGoals.branch}% 이상
- **함수 커버리지**: ${testStrategy.coverageGoals.function}% 이상

## 3. 테스트 케이스

### 3.1 단위 테스트
${this.generateUnitTestCases(testCases)}

### 3.2 통합 테스트
${this.generateIntegrationTestCases(testCases)}

### 3.3 E2E 테스트
${this.generateE2ETestCases(testCases)}

## 4. 테스트 데이터
### Mock 데이터
\`\`\`typescript
${this.generateMockDataCode(testData.mockData)}
\`\`\`

### 테스트 픽스처
\`\`\`typescript
${this.generateTestFixturesCode(testData.testFixtures)}
\`\`\`

## 5. 모킹 전략
### API 모킹
${this.generateAPIMockingCode(mockingStrategy.apiMocks)}

### 컴포넌트 모킹
${this.generateComponentMockingCode(mockingStrategy.componentMocks)}

## 6. 테스트 우선순위
### High Priority (${testPriorities.high.length}개)
${testPriorities.high.map(testCase => `- ${testCase.name}`).join('\n')}

### Medium Priority (${testPriorities.medium.length}개)
${testPriorities.medium.map(testCase => `- ${testCase.name}`).join('\n')}

### Low Priority (${testPriorities.low.length}개)
${testPriorities.low.map(testCase => `- ${testCase.name}`).join('\n')}

## 7. Kent Beck 테스트 원칙
${this.generateKentBeckPrinciples()}
`;
    
    this.log('✅ 테스트 명세서 생성 완료');
    return specContent;
  }

  /**
   * 기능 제목 추출
   */
  extractFeatureTitle(featureSpec) {
    const lines = featureSpec.split('\n');
    for (const line of lines) {
      if (line.startsWith('#') && line.includes('기능')) {
        return line.replace('#', '').trim();
      }
    }
    return '새로운 기능';
  }

  /**
   * 사용자 스토리 추출
   */
  extractUserStories(featureSpec) {
    const stories = [];
    const lines = featureSpec.split('\n');
    
    for (const line of lines) {
      if (line.includes('###') && line.includes('사용자')) {
        stories.push({
          title: line.replace('###', '').trim(),
          description: line.replace('###', '').trim()
        });
      }
    }
    
    return stories;
  }

  /**
   * API 엔드포인트 추출
   */
  extractAPIEndpoints(featureSpec) {
    const endpoints = [];
    const lines = featureSpec.split('\n');
    
    for (const line of lines) {
      if (line.includes('POST') || line.includes('GET') || line.includes('PUT') || line.includes('DELETE')) {
        const parts = line.split(' - ');
        if (parts.length >= 2) {
          const methodPath = parts[0].trim();
          const description = parts[1].trim();
          
          const method = methodPath.split(' ')[0];
          const path = methodPath.split(' ')[1];
          
          endpoints.push({
            method,
            path,
            description
          });
        }
      }
    }
    
    return endpoints;
  }

  /**
   * 시나리오 추출
   */
  extractScenarios(featureSpec) {
    const scenarios = [];
    const lines = featureSpec.split('\n');
    
    for (const line of lines) {
      if (line.includes('- 사용자가')) {
        scenarios.push(line.replace('-', '').trim());
      }
    }
    
    return scenarios;
  }

  /**
   * 수용 기준 추출
   */
  extractAcceptanceCriteria(featureSpec) {
    const criteria = [];
    const lines = featureSpec.split('\n');
    
    for (const line of lines) {
      if (line.includes('- ') && !line.includes('사용자') && !line.includes('API')) {
        criteria.push(line.replace('-', '').trim());
      }
    }
    
    return criteria;
  }

  /**
   * 테스트 복잡도 평가
   */
  assessTestComplexity(featureSpec) {
    const userStories = this.extractUserStories(featureSpec);
    const apiEndpoints = this.extractAPIEndpoints(featureSpec);
    
    if (userStories.length <= 3 && apiEndpoints.length <= 3) return 'low';
    if (userStories.length <= 6 && apiEndpoints.length <= 6) return 'medium';
    return 'high';
  }

  /**
   * 위험 영역 식별
   */
  identifyRiskAreas(featureSpec) {
    const risks = [];
    
    if (featureSpec.includes('API')) {
      risks.push('API 통신 실패');
    }
    if (featureSpec.includes('데이터')) {
      risks.push('데이터 무결성');
    }
    if (featureSpec.includes('사용자')) {
      risks.push('사용자 경험');
    }
    
    return risks;
  }

  /**
   * 테스트 피라미드 정의
   */
  defineTestPyramid(featureAnalysis) {
    return {
      unit: 70,
      integration: 20,
      e2e: 10
    };
  }

  /**
   * 커버리지 목표 정의
   */
  defineCoverageGoals(featureAnalysis) {
    return {
      line: 90,
      branch: 85,
      function: 95
    };
  }

  /**
   * 테스트 타입 식별
   */
  identifyTestTypes(featureAnalysis) {
    const types = ['단위 테스트'];
    
    if (featureAnalysis.apiEndpoints.length > 0) {
      types.push('통합 테스트');
    }
    if (featureAnalysis.userStories.length > 2) {
      types.push('E2E 테스트');
    }
    
    return types;
  }

  /**
   * 테스트 접근법 결정
   */
  determineTestingApproach(featureAnalysis) {
    return 'TDD (Test-Driven Development)';
  }

  /**
   * 사용자 스토리별 테스트 케이스 생성
   */
  generateStoryTestCases(story, featureAnalysis) {
    const testCases = [];
    
    // 기본 Hook 초기화 테스트
    testCases.push({
      name: `${story.title} Hook 초기화`,
      description: 'Hook이 올바르게 초기화되는지 테스트',
      steps: [
        'Hook을 렌더링한다',
        '초기 상태를 확인한다',
        '로딩 상태가 false인지 확인한다',
        '에러 상태가 null인지 확인한다'
      ],
      expectedResult: 'Hook이 올바른 초기 상태로 초기화됨',
      priority: 'high',
      type: 'unit'
    });
    
    return testCases;
  }

  /**
   * API 엔드포인트별 테스트 케이스 생성
   */
  generateAPITestCases(endpoint, featureAnalysis) {
    const testCases = [];
    
    testCases.push({
      name: `${endpoint.method} ${endpoint.path} 메서드 테스트`,
      description: `${endpoint.method} ${endpoint.path} API 호출 메서드 테스트`,
      steps: [
        'MSW 핸들러를 설정한다',
        '메서드를 호출한다',
        '로딩 상태 변화를 확인한다',
        'API 응답을 확인한다',
        '에러 상태를 확인한다'
      ],
      expectedResult: '메서드가 올바르게 동작함',
      priority: 'high',
      type: 'integration'
    });
    
    return testCases;
  }

  /**
   * 통합 테스트 케이스 생성
   */
  generateIntegrationTestCases(featureAnalysis) {
    const testCases = [];
    
    if (featureAnalysis.apiEndpoints.length > 0) {
      testCases.push({
        name: 'API 통합 테스트',
        description: 'API와 Hook의 통합 동작 테스트',
        steps: [
          'MSW 핸들러를 설정한다',
          'Hook을 렌더링한다',
          'API 호출을 실행한다',
          '상태 변화를 확인한다',
          '결과를 검증한다'
        ],
        expectedResult: 'API와 Hook이 올바르게 통합됨',
        priority: 'medium',
        type: 'integration'
      });
    }
    
    return testCases;
  }

  /**
   * Mock 데이터 생성
   */
  generateMockData(featureAnalysis) {
    const mockData = [];
    
    featureAnalysis.apiEndpoints.forEach(endpoint => {
      mockData.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        response: this.generateMockResponse(endpoint)
      });
    });
    
    return mockData;
  }

  /**
   * Mock 응답 생성
   */
  generateMockResponse(endpoint) {
    if (endpoint.path.includes('favorite')) {
      return { success: true, favoriteId: 'fav-1' };
    }
    if (endpoint.path.includes('notifications')) {
      return { success: true, notificationId: 'notif-1' };
    }
    if (endpoint.path.includes('search')) {
      return { success: true, results: [] };
    }
    return { success: true };
  }

  /**
   * 테스트 픽스처 생성
   */
  generateTestFixtures(featureAnalysis) {
    return [
      {
        name: 'mockEvent',
        data: {
          id: '1',
          title: '테스트 이벤트',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '10:00'
        }
      }
    ];
  }

  /**
   * 엣지 케이스 식별
   */
  identifyEdgeCases(featureAnalysis) {
    return [
      '빈 데이터 처리',
      '네트워크 오류 처리',
      '잘못된 입력값 처리'
    ];
  }

  /**
   * 경계값 식별
   */
  identifyBoundaryValues(featureAnalysis) {
    return [
      '최소값',
      '최대값',
      'null 값',
      'undefined 값'
    ];
  }

  /**
   * API 모킹 설계
   */
  designAPIMocks(featureAnalysis) {
    return featureAnalysis.apiEndpoints.map(endpoint => ({
      endpoint: endpoint.path,
      method: endpoint.method,
      handler: `http.${endpoint.method.toLowerCase()}('${endpoint.path}', () => HttpResponse.json({ success: true }))`
    }));
  }

  /**
   * 컴포넌트 모킹 설계
   */
  designComponentMocks(featureAnalysis) {
    return [
      {
        component: 'notistack',
        mock: 'useSnackbar hook mock'
      }
    ];
  }

  /**
   * Hook 모킹 설계
   */
  designHookMocks(featureAnalysis) {
    return [
      {
        hook: 'useSnackbar',
        mock: 'enqueueSnackbar function mock'
      }
    ];
  }

  /**
   * 외부 서비스 모킹 설계
   */
  designExternalServiceMocks(featureAnalysis) {
    return [
      {
        service: 'fetch API',
        mock: 'MSW handlers'
      }
    ];
  }

  /**
   * 높은 우선순위 테스트 판단
   */
  isHighPriority(testCase) {
    return testCase.type === 'unit' || testCase.priority === 'high';
  }

  /**
   * 중간 우선순위 테스트 판단
   */
  isMediumPriority(testCase) {
    return testCase.type === 'integration' || testCase.priority === 'medium';
  }

  /**
   * 낮은 우선순위 테스트 판단
   */
  isLowPriority(testCase) {
    return testCase.type === 'e2e' || testCase.priority === 'low';
  }

  /**
   * 단위 테스트 케이스 생성
   */
  generateUnitTestCases(testCases) {
    const unitTests = testCases.filter(testCase => testCase.type === 'unit');
    
    return unitTests.map(testCase => `#### ${testCase.name}
- **설명**: ${testCase.description}
- **단계**:
${testCase.steps.map(step => `  - ${step}`).join('\n')}
- **예상 결과**: ${testCase.expectedResult}
- **우선순위**: ${testCase.priority}
`).join('\n');
  }

  /**
   * 통합 테스트 케이스 생성
   */
  generateIntegrationTestCases(testCases) {
    const integrationTests = testCases.filter(testCase => testCase.type === 'integration');
    
    return integrationTests.map(testCase => `#### ${testCase.name}
- **설명**: ${testCase.description}
- **단계**:
${testCase.steps.map(step => `  - ${step}`).join('\n')}
- **예상 결과**: ${testCase.expectedResult}
- **우선순위**: ${testCase.priority}
`).join('\n');
  }

  /**
   * E2E 테스트 케이스 생성
   */
  generateE2ETestCases(testCases) {
    const e2eTests = testCases.filter(testCase => testCase.type === 'e2e');
    
    return e2eTests.map(testCase => `#### ${testCase.name}
- **설명**: ${testCase.description}
- **단계**:
${testCase.steps.map(step => `  - ${step}`).join('\n')}
- **예상 결과**: ${testCase.expectedResult}
- **우선순위**: ${testCase.priority}
`).join('\n');
  }

  /**
   * Mock 데이터 코드 생성
   */
  generateMockDataCode(mockData) {
    return mockData.map(data => 
      `const mock${data.method}Response = ${JSON.stringify(data.response, null, 2)};`
    ).join('\n');
  }

  /**
   * 테스트 픽스처 코드 생성
   */
  generateTestFixturesCode(testFixtures) {
    return testFixtures.map(fixture => 
      `const ${fixture.name} = ${JSON.stringify(fixture.data, null, 2)};`
    ).join('\n');
  }

  /**
   * API 모킹 코드 생성
   */
  generateAPIMockingCode(apiMocks) {
    return apiMocks.map(mock => 
      `- **${mock.method} ${mock.endpoint}**: \`${mock.handler}\``
    ).join('\n');
  }

  /**
   * 컴포넌트 모킹 코드 생성
   */
  generateComponentMockingCode(componentMocks) {
    return componentMocks.map(mock => 
      `- **${mock.component}**: ${mock.mock}`
    ).join('\n');
  }

  /**
   * Kent Beck 테스트 원칙 생성
   */
  generateKentBeckPrinciples() {
    return `### 1. 작은 단계로 나누기
- 각 테스트는 하나의 기능만 검증
- 테스트는 독립적으로 실행 가능

### 2. 빨간 막대 (Red)
- 실패하는 테스트를 먼저 작성
- 구현이 없어도 테스트가 실패해야 함

### 3. 초록 막대 (Green)
- 최소한의 코드로 테스트 통과
- 깔끔한 코드보다는 동작하는 코드 우선

### 4. 리팩토링 (Refactor)
- 테스트 통과 후 코드 품질 개선
- 기능 변경 없이 구조 개선

### 5. 테스트 명명 규칙
- Given-When-Then 패턴 사용
- 명확하고 구체적인 테스트 이름`;
  }

  /**
   * 테스트 전략 로드
   */
  loadTestStrategies() {
    return {
      tdd: 'Test-Driven Development',
      bdd: 'Behavior-Driven Development',
      atdd: 'Acceptance Test-Driven Development'
    };
  }

  /**
   * 테스트 패턴 로드
   */
  loadTestPatterns() {
    return {
      arrangeActAssert: 'Arrange-Act-Assert',
      givenWhenThen: 'Given-When-Then',
      redGreenRefactor: 'Red-Green-Refactor'
    };
  }

  /**
   * Kent Beck 원칙 로드
   */
  loadKentBeckPrinciples() {
    return {
      smallSteps: '작은 단계로 나누기',
      redBar: '빨간 막대 (Red)',
      greenBar: '초록 막대 (Green)',
      refactor: '리팩토링 (Refactor)',
      naming: '테스트 명명 규칙'
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
if (process.argv[1] && process.argv[1].endsWith('test-design-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
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
  
  if (options.featureSpec) {
    const agent = new TestDesignAgent();
    agent.designTests(options.featureSpec, options)
      .then(result => {
        if (options.output) {
          fs.writeFileSync(options.output, result.testSpecification);
          console.log(`✅ 테스트 명세서가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(result.testSpecification);
        }
      })
      .catch(error => {
        console.error('❌ 테스트 설계 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node test-design-agent.js --featureSpec "기능명세" --output 파일명');
  }
}

export default TestDesignAgent;
