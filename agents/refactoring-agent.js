#!/usr/bin/env node

/**
 * Refactoring Agent
 * 구현된 코드의 품질을 개선하고 최적화하는 에이전트
 */

const fs = require('fs');
const path = require('path');

class RefactoringAgent {
  constructor() {
    this.refactoringRules = {
      performance: [
        'useCallback 사용',
        'useMemo 사용',
        'React.memo 사용',
        '불필요한 리렌더링 방지'
      ],
      readability: [
        '함수 분리',
        '변수명 개선',
        '주석 추가',
        '코드 구조 개선'
      ],
      maintainability: [
        '중복 코드 제거',
        '타입 안전성 향상',
        '에러 처리 개선',
        '모듈화'
      ],
      accessibility: [
        'ARIA 속성 추가',
        '키보드 네비게이션',
        '스크린 리더 지원'
      ]
    };
  }

  analyzeCode(code) {
    // 코드 분석
    const analysis = {
      issues: this.identifyIssues(code),
      opportunities: this.identifyOpportunities(code),
      metrics: this.calculateMetrics(code)
    };

    return analysis;
  }

  identifyIssues(code) {
    // 코드 이슈 식별
    const issues = [];

    // 성능 이슈
    if (code.includes('useState') && !code.includes('useCallback')) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: 'useCallback을 사용하여 함수 재생성 방지',
        suggestion: '이벤트 핸들러에 useCallback 적용'
      });
    }

    // 가독성 이슈
    const longFunctions = this.findLongFunctions(code);
    if (longFunctions.length > 0) {
      issues.push({
        type: 'readability',
        severity: 'high',
        description: '긴 함수를 작은 함수로 분리',
        suggestion: '함수를 더 작은 단위로 분리'
      });
    }

    // 접근성 이슈
    if (code.includes('Dialog') && !code.includes('aria-')) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        description: '접근성 속성 부족',
        suggestion: 'ARIA 속성 추가'
      });
    }

    // 타입 안전성 이슈
    if (code.includes('any')) {
      issues.push({
        type: 'maintainability',
        severity: 'medium',
        description: 'any 타입 사용',
        suggestion: '구체적인 타입 정의'
      });
    }

    return issues;
  }

  findLongFunctions(code) {
    // 긴 함수 찾기
    const functions = [];
    const functionRegex = /(?:function|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|export\s+const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g;
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      const start = match.index;
      const end = this.findFunctionEnd(code, start);
      const functionBody = code.substring(start, end);
      
      if (this.countLines(functionBody) > 20) {
        functions.push({
          start,
          end,
          body: functionBody
        });
      }
    }

    return functions;
  }

  findFunctionEnd(code, start) {
    // 함수 끝 찾기
    let braceCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = start; i < code.length; i++) {
      const char = code[i];
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
      } else if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount === 0) return i + 1;
      }
    }

    return code.length;
  }

  countLines(text) {
    // 라인 수 계산
    return text.split('\n').length;
  }

  identifyOpportunities(code) {
    // 개선 기회 식별
    const opportunities = [];

    // 성능 최적화 기회
    if (code.includes('useState') && code.includes('useEffect')) {
      opportunities.push({
        type: 'performance',
        description: 'useMemo를 사용한 계산 최적화',
        impact: 'medium'
      });
    }

    // 코드 재사용 기회
    const duplicatePatterns = this.findDuplicatePatterns(code);
    if (duplicatePatterns.length > 0) {
      opportunities.push({
        type: 'maintainability',
        description: '중복 코드 제거',
        impact: 'high'
      });
    }

    return opportunities;
  }

  findDuplicatePatterns(code) {
    // 중복 패턴 찾기
    const patterns = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[i].trim() === lines[j].trim() && lines[i].trim().length > 10) {
          patterns.push({
            line1: i + 1,
            line2: j + 1,
            content: lines[i].trim()
          });
        }
      }
    }

    return patterns;
  }

  calculateMetrics(code) {
    // 코드 메트릭 계산
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      functions: (code.match(/function|const\s+\w+\s*=\s*(?:async\s+)?\(/g) || []).length,
      complexity: this.calculateComplexity(code)
    };
  }

  calculateComplexity(code) {
    // 순환 복잡도 계산 (간단한 버전)
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch'];
    let complexity = 1;

    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  applyRefactoring(code, refactoringType) {
    // 리팩토링 적용
    switch (refactoringType) {
      case 'performance':
        return this.applyPerformanceRefactoring(code);
      case 'readability':
        return this.applyReadabilityRefactoring(code);
      case 'maintainability':
        return this.applyMaintainabilityRefactoring(code);
      case 'accessibility':
        return this.applyAccessibilityRefactoring(code);
      default:
        return this.applyGeneralRefactoring(code);
    }
  }

  applyPerformanceRefactoring(code) {
    // 성능 최적화 리팩토링
    let refactoredCode = code;

    // useCallback 추가
    if (refactoredCode.includes('useState') && refactoredCode.includes('async')) {
      refactoredCode = refactoredCode.replace(
        /const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*{/g,
        'const $1 = useCallback(async ($2) => {'
      );
    }

    // React.memo 추가
    if (refactoredCode.includes('export const') && refactoredCode.includes('React.FC')) {
      refactoredCode = refactoredCode.replace(
        /export const (\w+): React.FC/g,
        'export const $1 = React.memo<React.FC'
      );
    }

    return refactoredCode;
  }

  applyReadabilityRefactoring(code) {
    // 가독성 개선 리팩토링
    let refactoredCode = code;

    // 함수 분리
    const longFunctions = this.findLongFunctions(refactoredCode);
    longFunctions.forEach(func => {
      // 긴 함수를 작은 함수로 분리하는 로직
      // 실제 구현에서는 더 정교한 분석이 필요
    });

    // 변수명 개선
    refactoredCode = refactoredCode.replace(/\bdata\b/g, 'eventData');
    refactoredCode = refactoredCode.replace(/\bres\b/g, 'response');

    return refactoredCode;
  }

  applyMaintainabilityRefactoring(code) {
    // 유지보수성 개선 리팩토링
    let refactoredCode = code;

    // 타입 정의 개선
    if (refactoredCode.includes('any')) {
      refactoredCode = refactoredCode.replace(/:\s*any/g, ': unknown');
    }

    // 에러 처리 개선
    if (refactoredCode.includes('catch') && !refactoredCode.includes('Error')) {
      refactoredCode = refactoredCode.replace(
        /catch\s*\([^)]*\)\s*{/g,
        'catch (error: unknown) {'
      );
    }

    return refactoredCode;
  }

  applyAccessibilityRefactoring(code) {
    // 접근성 개선 리팩토링
    let refactoredCode = code;

    // Dialog에 접근성 속성 추가
    if (refactoredCode.includes('<Dialog')) {
      refactoredCode = refactoredCode.replace(
        /<Dialog([^>]*)>/g,
        '<Dialog$1 aria-labelledby="dialog-title" aria-describedby="dialog-description">'
      );
    }

    // Button에 접근성 속성 추가
    if (refactoredCode.includes('<Button')) {
      refactoredCode = refactoredCode.replace(
        /<Button([^>]*)>/g,
        '<Button$1 aria-label="Action button">'
      );
    }

    return refactoredCode;
  }

  applyGeneralRefactoring(code) {
    // 일반적인 리팩토링
    let refactoredCode = code;

    // 공백 정리
    refactoredCode = refactoredCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 주석 개선
    refactoredCode = refactoredCode.replace(
      /\/\/ (.+)/g,
      (match, comment) => {
        if (comment.length < 50) {
          return `// ${comment}`;
        }
        return `// ${comment.substring(0, 47)}...`;
      }
    );

    return refactoredCode;
  }

  generateRefactoredCode(code, refactoringGoals = []) {
    // 리팩토링된 코드 생성
    let refactoredCode = code;

    if (refactoringGoals.length === 0) {
      refactoringGoals = ['performance', 'readability', 'maintainability', 'accessibility'];
    }

    refactoringGoals.forEach(goal => {
      refactoredCode = this.applyRefactoring(refactoredCode, goal);
    });

    return refactoredCode;
  }

  validateRefactoredCode(originalCode, refactoredCode) {
    // 리팩토링된 코드 검증
    const validation = {
      isValid: true,
      issues: []
    };

    // 기능 보존 확인
    const originalFunctions = (originalCode.match(/export\s+const\s+\w+/g) || []).length;
    const refactoredFunctions = (refactoredCode.match(/export\s+const\s+\w+/g) || []).length;
    
    if (originalFunctions !== refactoredFunctions) {
      validation.isValid = false;
      validation.issues.push('함수 개수가 변경되었습니다');
    }

    // 타입 안전성 확인
    if (refactoredCode.includes('any')) {
      validation.issues.push('any 타입이 여전히 존재합니다');
    }

    return validation;
  }

  async refactorCode(input) {
    try {
      const { targetFiles, testFiles, refactoringGoals, constraints } = input;
      
      if (!targetFiles || targetFiles.length === 0) {
        throw new Error('대상 파일이 필요합니다.');
      }

      const results = [];

      for (const targetFile of targetFiles) {
        const code = fs.readFileSync(targetFile, 'utf8');
        
        // 코드 분석
        const analysis = this.analyzeCode(code);
        
        // 리팩토링 적용
        const refactoredCode = this.generateRefactoredCode(code, refactoringGoals);
        
        // 검증
        const validation = this.validateRefactoredCode(code, refactoredCode);
        
        results.push({
          file: targetFile,
          originalCode: code,
          refactoredCode,
          analysis,
          validation
        });
      }

      return results;
    } catch (error) {
      throw new Error(`리팩토링 실패: ${error.message}`);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target':
        input.targetFiles = args[++i].split(',');
        break;
      case '--test':
        input.testFiles = args[++i].split(',');
        break;
      case '--goals':
        input.refactoringGoals = args[++i].split(',');
        break;
      case '--constraints':
        input.constraints = args[++i].split(',');
        break;
      case '--output':
        input.output = args[++i];
        break;
    }
  }

  if (!input.targetFiles) {
    console.error('--target 옵션이 필요합니다.');
    process.exit(1);
  }

  const agent = new RefactoringAgent();
  agent.refactorCode(input)
    .then(results => {
      results.forEach(result => {
        if (input.output) {
          const outputFile = input.output.replace('*', path.basename(result.file));
          fs.writeFileSync(outputFile, result.refactoredCode);
          console.log(`리팩토링된 코드가 생성되었습니다: ${outputFile}`);
        } else {
          console.log(`=== ${result.file} ===`);
          console.log(result.refactoredCode);
        }
      });
    })
    .catch(error => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = RefactoringAgent;
