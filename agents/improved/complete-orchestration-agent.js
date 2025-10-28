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
 * Complete Orchestration Agent
 * 전체 TDD 워크플로우를 오케스트레이션하는 에이전트
 */
class CompleteOrchestrationAgent {
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

    this.workflowSteps = [
      {
        name: 'specification-quality',
        agent: 'specificationQuality',
        description: '명세 품질 검증',
      },
      { name: 'feature-design', agent: 'featureDesign', description: '기능 설계' },
      { name: 'test-design', agent: 'testDesign', description: '테스트 설계' },
      { name: 'test-writing', agent: 'testWriting', description: '테스트 작성' },
      { name: 'code-writing', agent: 'codeWriting', description: '코드 작성' },
      { name: 'test-execution', agent: 'testExecution', description: '테스트 실행' },
      { name: 'refactoring', agent: 'refactoring', description: '리팩토링' },
    ];
  }

  /**
   * 완전한 TDD 워크플로우 실행
   */
  async executeCompleteWorkflow(requirement, options = {}) {
    try {
      this.log('🚀 완전한 TDD 워크플로우 시작');

      // 워크플로우 시작 커밋 (비활성화)
      // await this.commitChanges('feat: TDD 워크플로우 시작', 'workflow-start');

      let previousOutput = requirement;
      const results = {};

      // 각 단계별 실행
      for (let i = 0; i < this.workflowSteps.length; i++) {
        const step = this.workflowSteps[i];
        this.log(`📋 ${i + 1}단계: ${step.description} 시작`);

        try {
          // 각 단계에 맞는 입력 데이터 전달
          let stepInput = previousOutput;
          if (step.name === 'feature-design' || step.name === 'test-design') {
            // 기능 설계와 테스트 설계는 원본 requirement 사용
            stepInput = requirement;
          } else if (step.name === 'test-writing') {
            // 테스트 작성은 이전 단계(test-design)의 출력 사용
            stepInput = results['test-design']?.output || previousOutput;
          } else if (step.name === 'code-writing') {
            // 코드 작성은 이전 단계(test-writing)의 출력 사용
            stepInput = results['test-writing']?.output || previousOutput;
          } else if (step.name === 'test-execution') {
            // 테스트 실행은 test-writing 결과 사용
            stepInput = results['test-writing']?.result?.testCode || previousOutput;
          } else if (step.name === 'refactoring') {
            // 리팩토링은 code-writing 결과 사용
            stepInput = results['code-writing']?.result?.implementationCode || previousOutput;
          }

          const stepResult = await this.executeStep(step, stepInput, options, results);
          results[step.name] = stepResult;
          previousOutput = stepResult.output;

          // 단계별 커밋 (비활성화)
          // await this.commitChanges(`feat: ${step.description} 완료`, step.name);

          this.log(`✅ ${i + 1}단계: ${step.description} 완료`);
        } catch (error) {
          this.log(`❌ ${step.description} 단계 실패: ${error.message}`, 'error');
          throw error;
        }
      }

      // 최종 검증
      await this.performFinalValidation();

      // 워크플로우 완료 커밋 (비활성화)
      // await this.commitChanges('feat: 워크플로우 완료', 'workflow-complete');

      this.log('🎉 완전한 TDD 워크플로우 완료');

      return {
        success: true,
        results,
        summary: this.generateWorkflowSummary(results),
      };
    } catch (error) {
      this.log(`❌ 워크플로우 실패: ${error.message}`, 'error');
      await this.handleWorkflowError(error);
      throw error;
    }
  }

  /**
   * 개별 단계 실행
   */
  async executeStep(step, input, options, results = {}) {
    this.log(`🎯 ${step.description} 단계 실행`);

    const agent = this.agents[step.agent];
    let result;

    switch (step.name) {
      case 'specification-quality':
        result = await agent.validateSpecificationQuality(input, options);
        // 품질 검증 보고서 저장
        const qualityReportPath = `specs/quality-report-${Date.now()}.json`;
        fs.writeFileSync(qualityReportPath, JSON.stringify(result.analysis, null, 2));
        this.log(`✅ 품질 검증 보고서 저장: ${qualityReportPath}`);

        // 품질이 낮으면 경고
        if (result.analysis.overallScore < 70) {
          this.log(
            `⚠️ 명세 품질이 낮습니다 (${result.analysis.overallScore}/100). 개선을 권장합니다.`,
            'warn'
          );
        }

        return { output: JSON.stringify(result.analysis), result };

      case 'feature-design':
        result = await agent.designFeature(input, options);
        // PRD 문서 저장
        const prdPath = `specs/${this.toKebabCase(result.specification.overview.title)}-prd.md`;
        fs.writeFileSync(prdPath, result.prdDocument);
        this.log(`✅ PRD 문서 저장: ${prdPath}`);
        return { output: result.prdDocument, result };

      case 'test-design':
        result = await agent.designTests(input, options);
        // 테스트 명세서 저장
        const testSpecPath = `specs/${this.toKebabCase(
          result.testSpecification.split('\n')[0].replace('#', '').trim()
        )}-test-spec.md`;
        fs.writeFileSync(testSpecPath, result.testSpecification);
        this.log(`✅ 테스트 명세서 저장: ${testSpecPath}`);
        return { output: result.testSpecification, result };

      case 'test-writing':
        result = await agent.generateTestCode(input, input, options);
        // 테스트 파일 저장
        const testFilePath = `src/__tests__/hooks/${this.toKebabCase(result.hookName)}.spec.ts`;
        fs.writeFileSync(testFilePath, result.testCode);
        this.log(`✅ 테스트 파일 저장: ${testFilePath}`);
        return { output: result.testCode, result };

      case 'code-writing':
        // 이전 단계(test-writing)의 Hook 이름을 전달
        const testWritingResult = results['test-writing'];
        const hookNameFromTest = testWritingResult?.result?.hookName;
        
        result = await agent.generateImplementationCode(input, input, { ...options, hookName: hookNameFromTest });
        // 구현 파일 저장
        const implFilePath = `src/hooks/${this.toKebabCase(result.hookName)}.ts`;
        fs.writeFileSync(implFilePath, result.implementationCode);
        this.log(`✅ 구현 파일 저장: ${implFilePath}`);
        return { output: result.implementationCode, result };

      case 'test-execution':
        // 테스트 파일 경로 찾기
        const hookName = this.extractHookNameFromCode(input);
        const testFile = `src/__tests__/hooks/${this.toKebabCase(hookName)}.spec.ts`;

        if (fs.existsSync(testFile)) {
          result = await agent.executeAndValidateTests(testFile, { autoFix: true });
          this.log(`✅ 테스트 실행 완료: ${result.analysis.passed}/${result.analysis.total} 통과`);

          if (!result.success) {
            this.log(`⚠️ ${result.analysis.failed}개의 테스트가 실패했습니다.`, 'warn');
          }

          return { output: JSON.stringify(result.analysis), result };
        } else {
          this.log('⚠️ 테스트 파일을 찾을 수 없습니다', 'warn');
          return {
            output: '테스트 실행 건너뜀',
            result: { success: true, analysis: { passed: 0, total: 0 } },
          };
        }

      case 'refactoring':
        // 구현 파일 경로 찾기
        const refactorHookName = this.extractHookNameFromCode(input);
        const refactorFilePath = `src/hooks/${this.toKebabCase(refactorHookName)}.ts`;

        if (fs.existsSync(refactorFilePath)) {
          result = await agent.refactorCode(refactorFilePath, options);
          this.log(`✅ 리팩토링 완료: ${result.changes}개 변경사항`);
          return { output: '리팩토링 완료', result };
        } else {
          this.log('⚠️ 리팩토링할 파일을 찾을 수 없습니다', 'warn');
          return { output: '리팩토링 건너뜀', result: { success: true, changes: 0 } };
        }

      default:
        throw new Error(`알 수 없는 단계: ${step.name}`);
    }
  }

  /**
   * 최종 검증 수행
   */
  async performFinalValidation() {
    this.log('🔍 최종 검증 수행');

    try {
      // TypeScript 컴파일 검사
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ TypeScript 컴파일: 통과');

      // 테스트 실행
      execSync('npm test -- --run', { stdio: 'pipe' });
      this.log('✅ 테스트 실행: 통과');

      // ESLint 검사
      try {
        execSync('npx eslint src/ --ext .ts,.tsx', { stdio: 'pipe' });
        this.log('✅ ESLint 검사: 통과');
      } catch (eslintError) {
        this.log('❌ ESLint 검사: 실패', 'error');
        this.log(`ESLint 오류: ${eslintError.message}`, 'error');
      }
    } catch (error) {
      this.log(`❌ 검증 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 워크플로우 에러 처리
   */
  async handleWorkflowError(error) {
    this.log('🆘 워크플로우 에러 처리');

    // 에러 커밋 (비활성화)
    // await this.commitChanges('fix: 워크플로우 에러', 'workflow-error');

    // 롤백 안내
    this.log('💡 롤백을 원하시면 다음 명령어를 실행하세요:');
    this.log('   git reset --hard HEAD~1');
  }

  /**
   * 워크플로우 요약 생성
   */
  generateWorkflowSummary(results) {
    const summary = {
      'feature-design': results['feature-design'] ? '완료' : '실패',
      'test-design': results['test-design'] ? '완료' : '실패',
      'test-writing': results['test-writing'] ? '완료' : '실패',
      'code-writing': results['code-writing'] ? '완료' : '실패',
      refactoring: results['refactoring'] ? '완료' : '실패',
    };

    return summary;
  }

  /**
   * 커밋 실행
   */
  async commitChanges(message, stepName) {
    try {
      // 변경사항이 있는지 확인
      const stagedChanges = execSync('git diff --cached --quiet', { stdio: 'pipe' });

      if (stagedChanges.status === 0) {
        this.log(`⚠️ 커밋할 변경사항이 없습니다: ${stepName}`, 'warn');
        return;
      }

      // 커밋 실행
      execSync(`git commit -m "${message}"`, { stdio: 'pipe' });

      // 커밋 해시 가져오기
      const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

      this.log(`✅ 커밋 완료: ${message}`);
      this.log(`📝 커밋 해시: ${commitHash}`);
    } catch (error) {
      this.log(`❌ 커밋 실패: ${error.message}`, 'error');
    }
  }

  /**
   * Hook 이름 추출
   */
  extractHookNameFromCode(code) {
    const hookMatch = code.match(/export const use(\w+)/);
    if (hookMatch) {
      return hookMatch[1];
    }

    // 기본값
    return 'NewHook';
  }

  /**
   * kebab-case 변환
   */
  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
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
if (process.argv[1] && process.argv[1].endsWith('complete-orchestration-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--requirement':
        options.requirement = args[i + 1];
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  if (options.requirement) {
    const agent = new CompleteOrchestrationAgent();
    agent
      .executeCompleteWorkflow(options.requirement, options)
      .then((result) => {
        console.log('🎉 워크플로우 완료!');
        console.log('📊 결과 요약:');
        Object.entries(result.summary).forEach(([step, status]) => {
          console.log(`  - ${step}: ${status}`);
        });
      })
      .catch((error) => {
        console.error('워크플로우 실행 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log(
      '사용법: node complete-orchestration-agent.js --requirement "요구사항" [--dry-run]'
    );
  }
}

export default CompleteOrchestrationAgent;
