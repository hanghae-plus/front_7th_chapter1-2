#!/usr/bin/env node

/**
 * Test Writing Agent
 * 테스트 설계를 바탕으로 실제 테스트 코드를 작성하는 에이전트
 */

const fs = require('fs');
const path = require('path');

class TestWritingAgent {
  constructor() {
    this.testFramework = 'vitest';
    this.testingLibrary = '@testing-library/react';
    this.mockingFramework = 'msw';
  }

  parseTestDesign(testDesign) {
    // 테스트 설계 파싱
    const parsed = {
      testCases: this.extractTestCases(testDesign),
      testData: this.extractTestData(testDesign),
      mockingStrategy: this.extractMockingStrategy(testDesign)
    };

    return parsed;
  }

  extractTestCases(testDesign) {
    // 테스트 케이스 추출
    const testCases = [];
    const testCaseRegex = /### (.+?)\n- \*\*타입\*\*: (.+?)\n- \*\*우선순위\*\*: (.+?)\n- \*\*설명\*\*: (.+?)\n- \*\*단계\*\*:\n((?:  - .+\n?)+)/gs;
    let match;

    while ((match = testCaseRegex.exec(testDesign)) !== null) {
      const steps = match[5].split('\n')
        .map(step => step.replace(/^\s*-\s*/, '').trim())
        .filter(step => step);

      testCases.push({
        name: match[1],
        type: match[2],
        priority: match[3],
        description: match[4],
        steps: steps
      });
    }

    return testCases;
  }

  extractTestData(testDesign) {
    // 테스트 데이터 추출
    const testData = {};
    const dataRegex = /const mock(.+?) = ({[\s\S]*?});/g;
    let match;

    while ((match = dataRegex.exec(testDesign)) !== null) {
      try {
        testData[match[1]] = JSON.parse(match[2]);
      } catch (error) {
        console.warn(`테스트 데이터 파싱 실패: ${match[1]}`);
      }
    }

    return testData;
  }

  extractMockingStrategy(testDesign) {
    // 모킹 전략 추출
    const strategy = {
      api: { handlers: [] },
      components: { utilities: [] }
    };

    const apiSection = testDesign.match(/### API 모킹([\s\S]*?)(?=###|$)/);
    if (apiSection) {
      const handlerRegex = /- (.+?) (.+?): (.+?)(?=\n|$)/g;
      let match;
      while ((match = handlerRegex.exec(apiSection[1])) !== null) {
        strategy.api.handlers.push({
          method: match[1],
          endpoint: match[2],
          response: match[3]
        });
      }
    }

    return strategy;
  }

  generateTestImports(testType, targetFile) {
    // 테스트 파일에 필요한 import 문 생성
    const imports = [];

    if (testType === 'unit' || testType === 'integration') {
      imports.push("import { renderHook, act } from '@testing-library/react';");
      imports.push("import { http, HttpResponse } from 'msw';");
    }

    if (testType === 'integration') {
      imports.push("import { render, screen, within } from '@testing-library/react';");
      imports.push("import { userEvent } from '@testing-library/user-event';");
    }

    // 대상 파일에 따른 import 추가
    if (targetFile.includes('hook')) {
      imports.push(`import { ${this.extractHookName(targetFile)} } from '../${this.extractRelativePath(targetFile)}';`);
    }

    if (targetFile.includes('component')) {
      imports.push(`import { ${this.extractComponentName(targetFile)} } from '../${this.extractRelativePath(targetFile)}';`);
    }

    imports.push("import { server } from '../../setupTests';");

    return imports.join('\n');
  }

  extractHookName(targetFile) {
    // Hook 이름 추출
    const match = targetFile.match(/(.+?)\.spec\.ts$/);
    return match ? `use${match[1].charAt(0).toUpperCase() + match[1].slice(1)}` : 'useTargetHook';
  }

  extractComponentName(targetFile) {
    // 컴포넌트 이름 추출
    const match = targetFile.match(/(.+?)\.spec\.ts$/);
    return match ? `${match[1].charAt(0).toUpperCase() + match[1].slice(1)}` : 'TargetComponent';
  }

  extractRelativePath(targetFile) {
    // 상대 경로 추출
    const pathParts = targetFile.split('/');
    const fileName = pathParts[pathParts.length - 1].replace('.spec.ts', '');
    return `${fileName}`;
  }

  generateTestSetup(testType, mockingStrategy) {
    // 테스트 설정 코드 생성
    const setup = [];

    if (mockingStrategy.api.handlers.length > 0) {
      setup.push('beforeEach(() => {');
      setup.push('  server.use(');
      
      mockingStrategy.api.handlers.forEach((handler, index) => {
        const comma = index < mockingStrategy.api.handlers.length - 1 ? ',' : '';
        setup.push(`    http.${handler.method.toLowerCase()}('${handler.endpoint}', () => {`);
        setup.push(`      return HttpResponse.json(${handler.response});`);
        setup.push(`    })${comma}`);
      });
      
      setup.push('  );');
      setup.push('});');
      setup.push('');
    }

    setup.push('afterEach(() => {');
    setup.push('  server.resetHandlers();');
    setup.push('});');
    setup.push('');

    return setup.join('\n');
  }

  generateTestFunction(testCase, testData) {
    // 개별 테스트 함수 생성
    const testName = testCase.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
    const testFunction = [];

    testFunction.push(`it('${testName}', async () => {`);
    
    // Given-When-Then 구조로 테스트 작성
    const givenSteps = testCase.steps.filter(step => step.startsWith('Given:'));
    const whenSteps = testCase.steps.filter(step => step.startsWith('When:'));
    const thenSteps = testCase.steps.filter(step => step.startsWith('Then:'));

    // Given 섹션
    if (givenSteps.length > 0) {
      testFunction.push('  // Given');
      givenSteps.forEach(step => {
        const content = step.replace('Given: ', '');
        testFunction.push(`  // ${content}`);
        
        // 테스트 데이터 설정
        if (content.includes('mock') || content.includes('데이터')) {
          testFunction.push(`  const mockData = ${JSON.stringify(testData, null, 4)};`);
        }
      });
      testFunction.push('');
    }

    // When 섹션
    if (whenSteps.length > 0) {
      testFunction.push('  // When');
      whenSteps.forEach(step => {
        const content = step.replace('When: ', '');
        testFunction.push(`  // ${content}`);
        
        // 실제 테스트 로직 생성
        if (content.includes('렌더링')) {
          testFunction.push('  const { result } = renderHook(() => useTargetHook());');
        } else if (content.includes('클릭') || content.includes('입력')) {
          testFunction.push('  await user.click(screen.getByRole("button"));');
        } else if (content.includes('API') || content.includes('호출')) {
          testFunction.push('  await act(async () => {');
          testFunction.push('    await result.current.someAction();');
          testFunction.push('  });');
        }
      });
      testFunction.push('');
    }

    // Then 섹션
    if (thenSteps.length > 0) {
      testFunction.push('  // Then');
      thenSteps.forEach(step => {
        const content = step.replace('Then: ', '');
        testFunction.push(`  // ${content}`);
        
        // 어설션 생성
        if (content.includes('표시') || content.includes('렌더링')) {
          testFunction.push('  expect(screen.getByText("Expected Text")).toBeInTheDocument();');
        } else if (content.includes('상태') || content.includes('값')) {
          testFunction.push('  expect(result.current.someValue).toBe(expectedValue);');
        } else if (content.includes('에러')) {
          testFunction.push('  expect(screen.getByText("Error Message")).toBeInTheDocument();');
        }
      });
    }

    testFunction.push('});');
    testFunction.push('');

    return testFunction.join('\n');
  }

  generateTestFile(testDesign, targetFile) {
    // 전체 테스트 파일 생성
    const parsed = this.parseTestDesign(testDesign);
    const testType = parsed.testCases[0]?.type || 'unit';
    
    const testFile = [];

    // Import 문
    testFile.push(this.generateTestImports(testType, targetFile));
    testFile.push('');

    // Describe 블록
    const featureName = this.extractFeatureName(testDesign);
    testFile.push(`describe('${featureName}', () => {`);

    // 테스트 설정
    const setup = this.generateTestSetup(testType, parsed.mockingStrategy);
    if (setup) {
      testFile.push(setup);
    }

    // 개별 테스트 함수들
    parsed.testCases.forEach(testCase => {
      const testFunction = this.generateTestFunction(testCase, parsed.testData);
      testFile.push(testFunction);
    });

    testFile.push('});');

    return testFile.join('\n');
  }

  extractFeatureName(testDesign) {
    // 기능 이름 추출
    const match = testDesign.match(/# (.+?) 테스트 설계/);
    return match ? match[1] : 'Feature';
  }

  validateTestCode(testCode) {
    // 테스트 코드 검증
    const validation = {
      isValid: true,
      issues: []
    };

    // 필수 요소 확인
    const requiredElements = ['describe', 'it', 'expect'];
    for (const element of requiredElements) {
      if (!testCode.includes(element)) {
        validation.isValid = false;
        validation.issues.push(`필수 요소 누락: ${element}`);
      }
    }

    // 테스트 함수 개수 확인
    const testCount = (testCode.match(/\bit\(/g) || []).length;
    if (testCount < 1) {
      validation.isValid = false;
      validation.issues.push('테스트 함수가 없습니다');
    }

    return validation;
  }

  async generateTestCode(input) {
    try {
      const { testDesign, targetFile, existingCode } = input;
      
      if (!testDesign) {
        throw new Error('테스트 설계가 필요합니다.');
      }

      if (!targetFile) {
        throw new Error('대상 파일이 필요합니다.');
      }

      // 테스트 코드 생성
      const testCode = this.generateTestFile(testDesign, targetFile);
      
      // 테스트 코드 검증
      const validation = this.validateTestCode(testCode);
      
      if (!validation.isValid) {
        throw new Error(`테스트 코드 검증 실패: ${validation.issues.join(', ')}`);
      }

      return {
        testCode,
        validation
      };
    } catch (error) {
      throw new Error(`테스트 코드 생성 실패: ${error.message}`);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--design':
        input.testDesign = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--target':
        input.targetFile = args[++i];
        break;
      case '--existing-code':
        input.existingCode = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--output':
        input.output = args[++i];
        break;
    }
  }

  if (!input.testDesign || !input.targetFile) {
    console.error('--design과 --target 옵션이 필요합니다.');
    process.exit(1);
  }

  const agent = new TestWritingAgent();
  agent.generateTestCode(input)
    .then(result => {
      if (input.output) {
        fs.writeFileSync(input.output, result.testCode);
        console.log(`테스트 코드가 생성되었습니다: ${input.output}`);
      } else {
        console.log(result.testCode);
      }
    })
    .catch(error => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = TestWritingAgent;
