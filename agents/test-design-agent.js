#!/usr/bin/env node

/**
 * Test Design Agent
 * 기능 명세를 바탕으로 포괄적이고 체계적인 테스트 케이스를 설계하는 에이전트
 */

const fs = require('fs');
const path = require('path');

class TestDesignAgent {
  constructor() {
    this.testFramework = 'vitest';
    this.testingLibrary = '@testing-library/react';
    this.testCategories = ['unit', 'integration', 'e2e'];
  }

  analyzeFeatureSpec(spec) {
    // 기능 명세 분석
    const analysis = {
      scenarios: this.extractScenarios(spec),
      components: this.extractComponents(spec),
      apis: this.extractAPIs(spec),
      dataModels: this.extractDataModels(spec)
    };

    return analysis;
  }

  extractScenarios(spec) {
    // 시나리오 추출
    const scenarios = [];
    const scenarioRegex = /### 시나리오 \d+: (.+?)\n- (.+?)\n- 사용자 행동: (.+?)\n- 예상 결과: (.+?)/gs;
    let match;

    while ((match = scenarioRegex.exec(spec)) !== null) {
      scenarios.push({
        name: match[1],
        description: match[2],
        userAction: match[3],
        expectedResult: match[4]
      });
    }

    return scenarios;
  }

  extractComponents(spec) {
    // 컴포넌트 추출
    const components = [];
    const componentRegex = /- (.+?): (.+?)(?=\n-|\n##|$)/gs;
    const componentSection = spec.match(/## 컴포넌트 설계([\s\S]*?)(?=##|$)/);
    
    if (componentSection) {
      let match;
      while ((match = componentRegex.exec(componentSection[1])) !== null) {
        components.push({
          name: match[1],
          description: match[2]
        });
      }
    }

    return components;
  }

  extractAPIs(spec) {
    // API 추출
    const apis = [];
    const apiRegex = /- (.+?): (.+?)(?=\n-|\n###|$)/gs;
    const apiSection = spec.match(/## API 설계([\s\S]*?)(?=##|$)/);
    
    if (apiSection) {
      let match;
      while ((match = apiRegex.exec(apiSection[1])) !== null) {
        apis.push({
          endpoint: match[1],
          description: match[2]
        });
      }
    }

    return apis;
  }

  extractDataModels(spec) {
    // 데이터 모델 추출
    const dataModels = [];
    const modelRegex = /interface (.+?) \{([\s\S]*?)\}/g;
    let match;

    while ((match = modelRegex.exec(spec)) !== null) {
      dataModels.push({
        name: match[1],
        fields: match[2].trim()
      });
    }

    return dataModels;
  }

  generateTestCases(scenarios, components, apis) {
    // 테스트 케이스 생성
    const testCases = [];

    // 시나리오 기반 테스트 케이스
    scenarios.forEach((scenario, index) => {
      testCases.push({
        id: `scenario-${index + 1}`,
        name: scenario.name,
        type: 'integration',
        description: scenario.description,
        steps: [
          `Given: ${scenario.description}`,
          `When: ${scenario.userAction}`,
          `Then: ${scenario.expectedResult}`
        ],
        priority: 'high'
      });
    });

    // 컴포넌트 기반 테스트 케이스
    components.forEach((component, index) => {
      testCases.push({
        id: `component-${index + 1}`,
        name: `${component.name} 컴포넌트 테스트`,
        type: 'unit',
        description: `${component.name} 컴포넌트의 기본 동작 테스트`,
        steps: [
          'Given: 컴포넌트가 렌더링됨',
          'When: 기본 props가 전달됨',
          'Then: 컴포넌트가 정상적으로 렌더링됨'
        ],
        priority: 'medium'
      });
    });

    // API 기반 테스트 케이스
    apis.forEach((api, index) => {
      testCases.push({
        id: `api-${index + 1}`,
        name: `${api.endpoint} API 테스트`,
        type: 'integration',
        description: `${api.endpoint} API의 동작 테스트`,
        steps: [
          'Given: API 요청 데이터 준비',
          'When: API 호출 실행',
          'Then: 예상 응답 반환'
        ],
        priority: 'high'
      });
    });

    return testCases;
  }

  generateTestData(dataModels) {
    // 테스트 데이터 생성
    const testData = {};

    dataModels.forEach(model => {
      const mockData = this.createMockData(model);
      testData[model.name] = mockData;
    });

    return testData;
  }

  createMockData(model) {
    // Mock 데이터 생성
    const mockData = {};
    const fields = model.fields.split('\n').filter(line => line.trim());

    fields.forEach(field => {
      const [fieldName, fieldType] = field.split(':').map(s => s.trim());
      if (fieldName && fieldType) {
        mockData[fieldName] = this.generateMockValue(fieldType);
      }
    });

    return mockData;
  }

  generateMockValue(fieldType) {
    // 필드 타입에 따른 Mock 값 생성
    const typeMap = {
      'string': 'mock-string',
      'number': 123,
      'boolean': true,
      'Date': '2025-01-01',
      'string[]': ['item1', 'item2'],
      'number[]': [1, 2, 3]
    };

    return typeMap[fieldType] || 'mock-value';
  }

  generateMockingStrategy(apis) {
    // 모킹 전략 생성
    const mockingStrategy = {
      api: {
        framework: 'MSW (Mock Service Worker)',
        handlers: []
      },
      components: {
        framework: 'React Testing Library',
        utilities: []
      }
    };

    apis.forEach(api => {
      mockingStrategy.api.handlers.push({
        endpoint: api.endpoint,
        method: this.extractMethod(api.endpoint),
        response: 'mock-response',
        errorResponse: 'mock-error-response'
      });
    });

    return mockingStrategy;
  }

  extractMethod(endpoint) {
    // 엔드포인트에서 HTTP 메서드 추출
    if (endpoint.includes('POST')) return 'POST';
    if (endpoint.includes('PUT')) return 'PUT';
    if (endpoint.includes('DELETE')) return 'DELETE';
    return 'GET';
  }

  generateTestDesign(featureSpec) {
    // 테스트 설계 문서 생성
    const analysis = this.analyzeFeatureSpec(featureSpec);
    const testCases = this.generateTestCases(analysis.scenarios, analysis.components, analysis.apis);
    const testData = this.generateTestData(analysis.dataModels);
    const mockingStrategy = this.generateMockingStrategy(analysis.apis);

    const testDesign = `# ${this.extractFeatureName(featureSpec)} 테스트 설계

## 테스트 범위

### 단위 테스트
${analysis.components.map(comp => `- ${comp.name}: ${comp.description}`).join('\n')}

### 통합 테스트
${analysis.apis.map(api => `- ${api.endpoint}: ${api.description}`).join('\n')}

### E2E 테스트
${analysis.scenarios.map(scenario => `- ${scenario.name}: ${scenario.description}`).join('\n')}

## 테스트 케이스

${testCases.map(testCase => `
### ${testCase.name}
- **타입**: ${testCase.type}
- **우선순위**: ${testCase.priority}
- **설명**: ${testCase.description}
- **단계**:
${testCase.steps.map(step => `  - ${step}`).join('\n')}
`).join('\n')}

## 테스트 데이터

\`\`\`typescript
${Object.entries(testData).map(([name, data]) => 
  `const mock${name} = ${JSON.stringify(data, null, 2)};`
).join('\n\n')}
\`\`\`

## 모킹 전략

### API 모킹
- **프레임워크**: ${mockingStrategy.api.framework}
- **핸들러**:
${mockingStrategy.api.handlers.map(handler => 
  `  - ${handler.method} ${handler.endpoint}: ${handler.response}`
).join('\n')}

### 컴포넌트 모킹
- **프레임워크**: ${mockingStrategy.components.framework}
- **유틸리티**: React Testing Library 기본 유틸리티 사용

## 테스트 실행 순서

1. 단위 테스트 (빠른 피드백)
2. 통합 테스트 (기능 검증)
3. E2E 테스트 (전체 플로우)

## 검증 기준

- [ ] 모든 테스트 케이스가 실행됨
- [ ] 테스트 결과가 일관됨
- [ ] 테스트 실행 시간이 적절함
- [ ] 테스트 코드가 유지보수 가능함
`;

    return testDesign;
  }

  extractFeatureName(spec) {
    // 명세에서 기능 이름 추출
    const match = spec.match(/# (.+?) 기능 명세/);
    return match ? match[1] : 'Unknown Feature';
  }

  validateTestDesign(testDesign) {
    // 테스트 설계 검증
    const validation = {
      isValid: true,
      issues: []
    };

    // 필수 섹션 확인
    const requiredSections = ['테스트 범위', '테스트 케이스', '테스트 데이터', '모킹 전략'];
    for (const section of requiredSections) {
      if (!testDesign.includes(section)) {
        validation.isValid = false;
        validation.issues.push(`필수 섹션 누락: ${section}`);
      }
    }

    // 테스트 케이스 개수 확인
    const testCaseCount = (testDesign.match(/### .+?테스트/g) || []).length;
    if (testCaseCount < 3) {
      validation.isValid = false;
      validation.issues.push('테스트 케이스가 부족합니다 (최소 3개 필요)');
    }

    return validation;
  }

  async generateTestDesign(input) {
    try {
      const { featureSpec, existingTests = [] } = input;
      
      if (!featureSpec) {
        throw new Error('기능 명세가 필요합니다.');
      }

      // 테스트 설계 생성
      const testDesign = this.generateTestDesign(featureSpec);
      
      // 테스트 설계 검증
      const validation = this.validateTestDesign(testDesign);
      
      if (!validation.isValid) {
        throw new Error(`테스트 설계 검증 실패: ${validation.issues.join(', ')}`);
      }

      return {
        testDesign,
        validation
      };
    } catch (error) {
      throw new Error(`테스트 설계 생성 실패: ${error.message}`);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--spec':
        input.featureSpec = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--existing-tests':
        input.existingTests = args[++i].split(',');
        break;
      case '--output':
        input.output = args[++i];
        break;
    }
  }

  if (!input.featureSpec) {
    console.error('--spec 옵션이 필요합니다.');
    process.exit(1);
  }

  const agent = new TestDesignAgent();
  agent.generateTestDesign(input)
    .then(result => {
      if (input.output) {
        fs.writeFileSync(input.output, result.testDesign);
        console.log(`테스트 설계가 생성되었습니다: ${input.output}`);
      } else {
        console.log(result.testDesign);
      }
    })
    .catch(error => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = TestDesignAgent;
