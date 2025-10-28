import fs from 'fs';
import { execSync } from 'child_process';
import FeatureDesignAgent from './feature-design-agent.js';
import TestDesignAgent from './test-design-agent.js';
import ImprovedTestWritingAgent from './improved-test-writing-agent.js';
import ImprovedCodeWritingAgent from './improved-code-writing-agent.js';
import ImprovedRefactoringAgent from './improved-refactoring-agent.js';
import SpecificationQualityAgent from './specification-quality-agent.js';
import TestExecutionAgent from './test-execution-agent.js';

/**
 * Auto TDD Agent
 * RED → GREEN 사이클이 완벽하게 작동할 때까지 자동 반복하는 에이전트
 */
class AutoTDDAgent {
  constructor() {
    this.agents = {
      specificationQuality: new SpecificationQualityAgent(),
      featureDesign: new FeatureDesignAgent(),
      testDesign: new TestDesignAgent(),
      testWriting: new ImprovedTestWritingAgent(),
      codeWriting: new ImprovedCodeWritingAgent(),
      refactoring: new ImprovedRefactoringAgent(),
      testExecution: new TestExecutionAgent(),
    };

    this.maxRetries = 10; // 최대 재시도 횟수
    this.currentAttempt = 0;
  }

  /**
   * 입력 요구사항을 파싱하여 구조화된 데이터로 변환
   */
  parseRequirement(requirement) {
    this.log('📋 요구사항 파싱 시작');

    const lines = requirement
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsed = {
      title: '',
      describeBlocks: [],
      scenarios: [],
    };

    let currentDescribe = null;
    let currentScenario = null;

    for (const line of lines) {
      // 제목 추출
      if (!parsed.title && line && !line.includes('describe') && !line.includes('it')) {
        parsed.title = line;
      }

      // describe 블록 파싱
      if (line.includes('describe(')) {
        const title = line
          .replace(/describe\(['"]/, '')
          .replace(/['"].*/, '')
          .trim();
        
        currentDescribe = {
          title,
          scenarios: [],
        };
        parsed.describeBlocks.push(currentDescribe);
      }

      // it 블록 파싱
      if (line.includes('it(')) {
        const title = line
          .replace(/it\(['"]/, '')
          .replace(/['"].*/, '')
          .trim();
        
        currentScenario = {
          title,
          given: '',
          when: '',
          then: '',
          describe: currentDescribe?.title || '',
        };
        
        if (currentDescribe) {
          currentDescribe.scenarios.push(currentScenario);
        }
        parsed.scenarios.push(currentScenario);
      }

      // Given-When-Then 파싱
      if (currentScenario) {
        if (line.startsWith('Given')) {
          currentScenario.given = line.replace(/^Given\s*/, '').trim();
        } else if (line.startsWith('When')) {
          currentScenario.when = line.replace(/^When\s*/, '').trim();
        } else if (line.startsWith('Then')) {
          currentScenario.then = line.replace(/^Then\s*/, '').trim();
        }
      }
    }

    this.log(`✅ 파싱 완료: 제목="${parsed.title}", describe 블록 ${parsed.describeBlocks.length}개, 시나리오 ${parsed.scenarios.length}개`);
    
    // 각 describe 블록과 시나리오 상세 로그
    parsed.describeBlocks.forEach((block, index) => {
      this.log(`  📁 describe[${index}]: "${block.title}" (시나리오 ${block.scenarios.length}개)`);
      block.scenarios.forEach((scenario, sIndex) => {
        this.log(`    🧪 it[${sIndex}]: "${scenario.title}"`);
        if (scenario.given) this.log(`      Given: ${scenario.given}`);
        if (scenario.when) this.log(`      When: ${scenario.when}`);
        if (scenario.then) this.log(`      Then: ${scenario.then}`);
      });
    });

    return parsed;
  }

  /**
   * 로그 출력
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levelEmoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    };
    
    console.log(`${timestamp} [${level.toUpperCase()}] ${levelEmoji[level]} ${message}`);
  }

  /**
   * RED 단계: 테스트 작성 및 실행 (실패해야 함)
   */
  async redPhase(requirement) {
    this.log('🔴 RED 단계: 테스트 작성 시작');
    
    try {
      // 1. 기능 설계
      this.log('📋 기능 설계 중...');
      const featureSpec = await this.agents.featureDesign.designFeature(JSON.stringify(this.parseRequirement(requirement)));
      
      // 2. 테스트 설계
      this.log('📋 테스트 설계 중...');
      const testSpec = await this.agents.testDesign.designTests(JSON.stringify(this.parseRequirement(requirement)));
      
      // 3. 테스트 작성
      this.log('📝 테스트 작성 중...');
      const testResult = await this.agents.testWriting.generateTestCode(requirement);
      
      if (!testResult.success) {
        throw new Error(`테스트 작성 실패: ${testResult.error}`);
      }

      // 테스트 파일 저장
      const testFilePath = `src/__tests__/hooks/${testResult.hookName.toLowerCase()}.spec.ts`;
      fs.writeFileSync(testFilePath, testResult.testCode);
      this.log(`✅ 테스트 파일 저장: ${testFilePath}`);

      // 테스트 실행 (실패해야 함)
      this.log('🧪 테스트 실행 중... (실패 예상)');
      try {
        execSync(`npm test -- --run ${testFilePath}`, { stdio: 'pipe' });
        this.log('⚠️ 테스트가 통과했습니다. 이는 예상과 다릅니다.', 'warn');
        return { success: false, message: '테스트가 예상과 달리 통과했습니다.' };
      } catch (error) {
        this.log('✅ 테스트 실패 확인 (예상된 결과)', 'success');
        return { success: true, testFilePath, testCode: testResult.testCode };
      }
      
    } catch (error) {
      this.log(`❌ RED 단계 실패: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * GREEN 단계: 최소 구현으로 테스트 통과
   */
  async greenPhase(testFilePath, testCode) {
    this.log('🟢 GREEN 단계: 최소 구현 시작');
    
    try {
      // 코드 작성
      this.log('💻 구현 코드 작성 중...');
      const codeResult = await this.agents.codeWriting.generateImplementationCode(testCode);
      
      if (!codeResult.success) {
        throw new Error(`코드 작성 실패: ${codeResult.error}`);
      }

      // 구현 파일 저장
      const implementationFilePath = `src/hooks/${codeResult.hookName.toLowerCase()}.ts`;
      fs.writeFileSync(implementationFilePath, codeResult.implementationCode);
      this.log(`✅ 구현 파일 저장: ${implementationFilePath}`);

      // 테스트 실행 (통과해야 함)
      this.log('🧪 테스트 실행 중... (통과 예상)');
      try {
        execSync(`npm test -- --run ${testFilePath}`, { stdio: 'pipe' });
        this.log('✅ 테스트 통과 확인', 'success');
        return { success: true, implementationFilePath, implementationCode: codeResult.implementationCode };
      } catch (error) {
        this.log(`❌ 테스트 실패: ${error.message}`, 'error');
        return { success: false, error: error.message, implementationFilePath };
      }
      
    } catch (error) {
      this.log(`❌ GREEN 단계 실패: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * REFACTOR 단계: 코드 개선
   */
  async refactorPhase(implementationFilePath) {
    this.log('🔵 REFACTOR 단계: 코드 개선 시작');
    
    try {
      // 리팩토링
      this.log('🔧 리팩토링 중...');
      const refactorResult = await this.agents.refactoring.refactorCode(implementationFilePath);
      
      if (!refactorResult.success) {
        this.log(`⚠️ 리팩토링 실패: ${refactorResult.error}`, 'warn');
        return { success: false, error: refactorResult.error };
      }

      this.log('✅ 리팩토링 완료', 'success');
      return { success: true, refactoredCode: refactorResult.refactoredCode };
      
    } catch (error) {
      this.log(`❌ REFACTOR 단계 실패: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * 자동 TDD 사이클 실행
   */
  async executeAutoTDD(requirement) {
    this.log('🚀 자동 TDD 사이클 시작');
    this.currentAttempt = 0;

    while (this.currentAttempt < this.maxRetries) {
      this.currentAttempt++;
      this.log(`\n🔄 시도 ${this.currentAttempt}/${this.maxRetries}`);
      
      try {
        // RED 단계
        const redResult = await this.redPhase(requirement);
        if (!redResult.success) {
          this.log(`❌ RED 단계 실패: ${redResult.message || redResult.error}`, 'error');
          continue;
        }

        // GREEN 단계
        const greenResult = await this.greenPhase(redResult.testFilePath, redResult.testCode);
        if (!greenResult.success) {
          this.log(`❌ GREEN 단계 실패: ${greenResult.error}`, 'error');
          
          // 구현 파일이 생성되었다면 삭제
          if (greenResult.implementationFilePath && fs.existsSync(greenResult.implementationFilePath)) {
            fs.unlinkSync(greenResult.implementationFilePath);
            this.log(`🗑️ 실패한 구현 파일 삭제: ${greenResult.implementationFilePath}`);
          }
          continue;
        }

        // REFACTOR 단계
        const refactorResult = await this.refactorPhase(greenResult.implementationFilePath);
        if (!refactorResult.success) {
          this.log(`⚠️ REFACTOR 단계 실패하지만 계속 진행: ${refactorResult.error}`, 'warn');
        }

        // 최종 검증
        this.log('🔍 최종 검증 중...');
        try {
          execSync(`npm test -- --run ${redResult.testFilePath}`, { stdio: 'pipe' });
          this.log('🎉 TDD 사이클 완료! 모든 테스트가 통과합니다.', 'success');
          return {
            success: true,
            attempt: this.currentAttempt,
            testFilePath: redResult.testFilePath,
            implementationFilePath: greenResult.implementationFilePath,
            message: 'TDD 사이클이 성공적으로 완료되었습니다.'
          };
        } catch (error) {
          this.log(`❌ 최종 검증 실패: ${error.message}`, 'error');
          continue;
        }

      } catch (error) {
        this.log(`❌ 시도 ${this.currentAttempt} 실패: ${error.message}`, 'error');
        continue;
      }
    }

    this.log(`❌ 최대 재시도 횟수(${this.maxRetries})를 초과했습니다.`, 'error');
    return {
      success: false,
      attempts: this.currentAttempt,
      message: '최대 재시도 횟수를 초과했습니다.'
    };
  }

  /**
   * CLI 실행
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('사용법: node auto-tdd-agent.js --requirement "요구사항"');
      process.exit(1);
    }

    let requirement = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--requirement') {
        requirement = args.slice(i + 1).join(' ');
        break;
      }
    }

    if (!requirement) {
      console.log('❌ 요구사항이 제공되지 않았습니다.');
      process.exit(1);
    }

    try {
      const result = await this.executeAutoTDD(requirement);
      
      if (result.success) {
        this.log(`\n🎉 성공! ${result.attempt}번째 시도에서 완료`, 'success');
        this.log(`📁 테스트 파일: ${result.testFilePath}`);
        this.log(`📁 구현 파일: ${result.implementationFilePath}`);
      } else {
        this.log(`\n❌ 실패: ${result.message}`, 'error');
        process.exit(1);
      }
    } catch (error) {
      this.log(`❌ 실행 중 오류: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new AutoTDDAgent();
  agent.run();
}

export default AutoTDDAgent;
