#!/usr/bin/env node

/**
 * TDD Orchestrator Agent
 * 전체 TDD 워크플로우를 관리하고 각 단계별 에이전트를 조율하는 중앙 관리자
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TDDOrchestrator {
  constructor(options = {}) {
    this.feature = options.feature || '';
    this.commitMessage = options.commitMessage || '';
    this.step = options.step || 'all';
    this.verbose = options.verbose || false;
    
    this.agents = {
      'feature-design': './agents/feature-design-agent.js',
      'test-design': './agents/test-design-agent.js',
      'test-writing': './agents/test-writing-agent.js',
      'code-writing': './agents/code-writing-agent.js',
      'refactoring': './agents/refactoring-agent.js'
    };
    
    this.steps = [
      'feature-design',
      'test-design', 
      'test-writing',
      'code-writing',
      'refactoring'
    ];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async runCommand(command, options = {}) {
    try {
      this.log(`실행 중: ${command}`, 'debug');
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: this.verbose ? 'inherit' : 'pipe',
        ...options 
      });
      return result;
    } catch (error) {
      this.log(`명령 실행 실패: ${command}`, 'error');
      this.log(`에러: ${error.message}`, 'error');
      throw error;
    }
  }

  async runAgent(agentName, input) {
    try {
      this.log(`${agentName} 에이전트 실행 시작`);
      
      const agentPath = this.agents[agentName];
      if (!agentPath || !fs.existsSync(agentPath)) {
        throw new Error(`에이전트를 찾을 수 없습니다: ${agentName}`);
      }

      // 에이전트 실행 (실제 구현에서는 AI API 호출)
      const result = await this.simulateAgentExecution(agentName, input);
      
      this.log(`${agentName} 에이전트 실행 완료`);
      return result;
    } catch (error) {
      this.log(`${agentName} 에이전트 실행 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  async simulateAgentExecution(agentName, input) {
    // 실제 구현에서는 AI API를 호출하여 에이전트 실행
    // 여기서는 시뮬레이션으로 파일 생성
    
    const outputDir = `./output/${agentName}`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let outputFile = '';
    let content = '';

    switch (agentName) {
      case 'feature-design':
        outputFile = `${outputDir}/feature-spec.md`;
        content = this.generateFeatureSpec(input);
        break;
      case 'test-design':
        outputFile = `${outputDir}/test-design.md`;
        content = this.generateTestDesign(input);
        break;
      case 'test-writing':
        outputFile = `${outputDir}/test-code.spec.ts`;
        content = this.generateTestCode(input);
        break;
      case 'code-writing':
        outputFile = `${outputDir}/implementation.ts`;
        content = this.generateImplementation(input);
        break;
      case 'refactoring':
        outputFile = `${outputDir}/refactored-code.ts`;
        content = this.generateRefactoredCode(input);
        break;
    }

    fs.writeFileSync(outputFile, content);
    return { outputFile, content };
  }

  generateFeatureSpec(input) {
    return `# ${this.feature} 기능 명세

## 개요
${this.feature} 기능에 대한 상세 명세입니다.

## 시나리오
1. 기본 시나리오
2. 에지 케이스
3. 에러 처리

## API 설계
- 엔드포인트 정의
- 요청/응답 형식
- 에러 코드

## 컴포넌트 설계
- React 컴포넌트 구조
- Hook 설계
- 상태 관리
`;
  }

  generateTestDesign(input) {
    return `# ${this.feature} 테스트 설계

## 테스트 범위
- 단위 테스트
- 통합 테스트
- E2E 테스트

## 테스트 케이스
1. 긍정적 케이스
2. 부정적 케이스
3. 경계값 테스트
4. 에러 케이스

## 테스트 데이터
- Mock 데이터
- 테스트 시나리오
- 예상 결과
`;
  }

  generateTestCode(input) {
    return `import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';

describe('${this.feature}', () => {
  it('should work correctly', async () => {
    // Given
    // When  
    // Then
  });
});
`;
  }

  generateImplementation(input) {
    return `// ${this.feature} 구현 코드
export const implementation = () => {
  // 구현 로직
};
`;
  }

  generateRefactoredCode(input) {
    return `// 리팩토링된 ${this.feature} 코드
export const refactoredImplementation = () => {
  // 개선된 구현 로직
};
`;
  }

  async runTests() {
    try {
      this.log('테스트 실행 중...');
      const result = await this.runCommand('npm test');
      this.log('테스트 실행 완료');
      return result;
    } catch (error) {
      this.log('테스트 실행 실패', 'error');
      throw error;
    }
  }

  async commitChanges(message, step) {
    try {
      this.log(`커밋 중: ${message}`);
      await this.runCommand(`git add .`);
      await this.runCommand(`git commit -m "${message}"`);
      this.log(`커밋 완료: ${message}`);
    } catch (error) {
      this.log(`커밋 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  async executeStep(stepName) {
    this.log(`=== ${stepName} 단계 시작 ===`);
    
    try {
      let input = { feature: this.feature };
      
      // 이전 단계 결과를 다음 단계 입력으로 사용
      if (stepName !== 'feature-design') {
        const prevStep = this.steps[this.steps.indexOf(stepName) - 1];
        const prevOutput = `./output/${prevStep}`;
        if (fs.existsSync(prevOutput)) {
          input.previousOutput = prevOutput;
        }
      }

      const result = await this.runAgent(stepName, input);
      
      // 테스트 실행 (test-writing, code-writing 단계에서)
      if (['test-writing', 'code-writing'].includes(stepName)) {
        await this.runTests();
      }

      // 커밋
      const commitMsg = this.commitMessage || `${stepName}: ${this.feature} ${stepName} 단계 완료`;
      await this.commitChanges(commitMsg, stepName);
      
      this.log(`=== ${stepName} 단계 완료 ===`);
      return result;
    } catch (error) {
      this.log(`${stepName} 단계 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  async runTDDCycle() {
    this.log(`TDD 사이클 시작: ${this.feature}`);
    
    try {
      if (this.step === 'all') {
        // 전체 TDD 사이클 실행
        for (const step of this.steps) {
          await this.executeStep(step);
        }
      } else {
        // 특정 단계만 실행
        await this.executeStep(this.step);
      }
      
      this.log('TDD 사이클 완료');
    } catch (error) {
      this.log(`TDD 사이클 실패: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--feature':
        options.feature = args[++i];
        break;
      case '--step':
        options.step = args[++i];
        break;
      case '--commit-message':
        options.commitMessage = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  if (!options.feature) {
    console.error('--feature 옵션이 필요합니다.');
    process.exit(1);
  }

  const orchestrator = new TDDOrchestrator(options);
  orchestrator.runTDDCycle().catch(error => {
    console.error('오케스트레이터 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = TDDOrchestrator;
