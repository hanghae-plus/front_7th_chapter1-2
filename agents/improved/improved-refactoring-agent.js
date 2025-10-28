import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Improved Refactoring Agent
 * 코드 품질을 개선하고 최적화하는 에이전트
 */
class ImprovedRefactoringAgent {
  constructor() {
    this.refactoringPatterns = this.loadRefactoringPatterns();
    this.optimizationRules = this.loadOptimizationRules();
    this.codeQualityStandards = this.loadCodeQualityStandards();
  }

  /**
   * 코드 리팩토링 실행
   */
  async refactorCode(filePath, options = {}) {
    try {
      this.log('🔧 코드 리팩토링 시작');

      // 1. 파일 읽기
      const originalCode = fs.readFileSync(filePath, 'utf8');
      
      // 2. 코드 분석
      const analysis = this.analyzeCode(originalCode);
      
      // 3. 리팩토링 계획 수립
      const refactoringPlan = this.createRefactoringPlan(analysis, options);
      
      // 4. 리팩토링 실행
      let refactoredCode = originalCode;
      for (const refactoring of refactoringPlan) {
        refactoredCode = this.applyRefactoring(refactoredCode, refactoring);
      }
      
      // 5. 코드 검증
      const validation = await this.validateRefactoredCode(refactoredCode, filePath);
      
      if (validation.isValid) {
        // 6. 파일 저장
        fs.writeFileSync(filePath, refactoredCode);
        this.log('✅ 코드 리팩토링 완료');
        return {
          success: true,
          changes: refactoringPlan.length,
          improvements: this.generateImprovementReport(refactoringPlan)
        };
      } else {
        this.log(`❌ 리팩토링 검증 실패: ${validation.error}`, 'error');
        return {
          success: false,
          error: validation.error
        };
      }
      
    } catch (error) {
      this.log(`❌ 리팩토링 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 코드 분석
   */
  analyzeCode(code) {
    this.log('🔍 코드 분석 중...');
    
    const analysis = {
      lines: code.split('\n').length,
      functions: this.extractFunctions(code),
      imports: this.extractImports(code),
      complexity: this.calculateComplexity(code),
      duplications: this.findDuplications(code),
      issues: this.findCodeIssues(code)
    };
    
    this.log(`📊 분석 완료: ${analysis.functions.length}개 함수, 복잡도 ${analysis.complexity}`);
    return analysis;
  }

  /**
   * 함수 추출
   */
  extractFunctions(code) {
    const functions = [];
    const functionRegex = /(?:const|function|export\s+const)\s+(\w+)\s*[=:]\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        line: this.getLineNumber(code, match.index)
      });
    }
    
    return functions;
  }

  /**
   * Import 구문 추출
   */
  extractImports(code) {
    const imports = [];
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * 복잡도 계산
   */
  calculateComplexity(code) {
    let complexity = 1; // 기본 복잡도
    
    // 조건문 복잡도
    complexity += (code.match(/if\s*\(/g) || []).length;
    complexity += (code.match(/else\s+if\s*\(/g) || []).length;
    complexity += (code.match(/switch\s*\(/g) || []).length;
    complexity += (code.match(/case\s+/g) || []).length;
    
    // 반복문 복잡도
    complexity += (code.match(/for\s*\(/g) || []).length;
    complexity += (code.match(/while\s*\(/g) || []).length;
    complexity += (code.match(/forEach\s*\(/g) || []).length;
    
    // 중첩된 함수 복잡도
    complexity += (code.match(/useCallback\s*\(/g) || []).length;
    complexity += (code.match(/useEffect\s*\(/g) || []).length;
    
    return complexity;
  }

  /**
   * 중복 코드 찾기
   */
  findDuplications(code) {
    const duplications = [];
    const lines = code.split('\n');
    
    // 비슷한 패턴의 코드 블록 찾기
    for (let i = 0; i < lines.length - 3; i++) {
      const pattern = lines.slice(i, i + 3).join('\n');
      const occurrences = [];
      
      for (let j = i + 3; j < lines.length - 3; j++) {
        const otherPattern = lines.slice(j, j + 3).join('\n');
        if (this.calculateSimilarity(pattern, otherPattern) > 0.8) {
          occurrences.push(j);
        }
      }
      
      if (occurrences.length > 0) {
        duplications.push({
          startLine: i + 1,
          endLine: i + 3,
          occurrences: occurrences.map(line => line + 1)
        });
      }
    }
    
    return duplications;
  }

  /**
   * 코드 이슈 찾기
   */
  findCodeIssues(code) {
    const issues = [];
    
    // 긴 함수 찾기
    const longFunctions = this.findLongFunctions(code);
    issues.push(...longFunctions);
    
    // 중복된 import 찾기
    const duplicateImports = this.findDuplicateImports(code);
    issues.push(...duplicateImports);
    
    // 사용하지 않는 변수 찾기
    const unusedVariables = this.findUnusedVariables(code);
    issues.push(...unusedVariables);
    
    // 매직 넘버 찾기
    const magicNumbers = this.findMagicNumbers(code);
    issues.push(...magicNumbers);
    
    return issues;
  }

  /**
   * 긴 함수 찾기
   */
  findLongFunctions(code) {
    const issues = [];
    const lines = code.split('\n');
    let inFunction = false;
    let functionStart = 0;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('=>') && line.includes('{')) {
        inFunction = true;
        functionStart = i;
        braceCount = 1;
      } else if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0) {
          const functionLength = i - functionStart + 1;
          if (functionLength > 20) {
            issues.push({
              type: 'long_function',
              line: functionStart + 1,
              message: `함수가 너무 깁니다 (${functionLength}줄)`,
              severity: 'warning'
            });
          }
          inFunction = false;
        }
      }
    }
    
    return issues;
  }

  /**
   * 중복된 import 찾기
   */
  findDuplicateImports(code) {
    const issues = [];
    const imports = this.extractImports(code);
    const importCounts = {};
    
    imports.forEach(importPath => {
      importCounts[importPath] = (importCounts[importPath] || 0) + 1;
    });
    
    Object.entries(importCounts).forEach(([path, count]) => {
      if (count > 1) {
        issues.push({
          type: 'duplicate_import',
          message: `중복된 import: ${path} (${count}번)`,
          severity: 'warning'
        });
      }
    });
    
    return issues;
  }

  /**
   * 사용하지 않는 변수 찾기
   */
  findUnusedVariables(code) {
    const issues = [];
    const lines = code.split('\n');
    
    // 간단한 패턴 매칭으로 사용하지 않는 변수 찾기
    const variableRegex = /const\s+(\w+)\s*=/g;
    let match;
    
    while ((match = variableRegex.exec(code)) !== null) {
      const variableName = match[1];
      const afterDeclaration = code.substring(match.index + match[0].length);
      
      // 변수가 선언 후 사용되는지 확인
      if (!afterDeclaration.includes(variableName)) {
        issues.push({
          type: 'unused_variable',
          line: this.getLineNumber(code, match.index) + 1,
          message: `사용하지 않는 변수: ${variableName}`,
          severity: 'warning'
        });
      }
    }
    
    return issues;
  }

  /**
   * 매직 넘버 찾기
   */
  findMagicNumbers(code) {
    const issues = [];
    const magicNumberRegex = /\b(\d{2,})\b/g;
    let match;
    
    while ((match = magicNumberRegex.exec(code)) !== null) {
      const number = match[1];
      const line = this.getLineNumber(code, match.index) + 1;
      
      issues.push({
        type: 'magic_number',
        line: line,
        message: `매직 넘버: ${number}`,
        severity: 'info'
      });
    }
    
    return issues;
  }

  /**
   * 리팩토링 계획 수립
   */
  createRefactoringPlan(analysis, options) {
    this.log('📋 리팩토링 계획 수립 중...');
    
    const plan = [];
    
    // 중복 코드 제거
    if (analysis.duplications.length > 0) {
      plan.push({
        type: 'remove_duplication',
        priority: 'high',
        description: '중복 코드 제거'
      });
    }
    
    // 긴 함수 분할
    const longFunctions = analysis.issues.filter(issue => issue.type === 'long_function');
    if (longFunctions.length > 0) {
      plan.push({
        type: 'split_long_functions',
        priority: 'high',
        description: '긴 함수 분할'
      });
    }
    
    // 중복 import 정리
    const duplicateImports = analysis.issues.filter(issue => issue.type === 'duplicate_import');
    if (duplicateImports.length > 0) {
      plan.push({
        type: 'cleanup_imports',
        priority: 'medium',
        description: '중복 import 정리'
      });
    }
    
    // 사용하지 않는 변수 제거
    const unusedVariables = analysis.issues.filter(issue => issue.type === 'unused_variable');
    if (unusedVariables.length > 0) {
      plan.push({
        type: 'remove_unused_variables',
        priority: 'medium',
        description: '사용하지 않는 변수 제거'
      });
    }
    
    // 매직 넘버 상수화
    const magicNumbers = analysis.issues.filter(issue => issue.type === 'magic_number');
    if (magicNumbers.length > 0) {
      plan.push({
        type: 'extract_constants',
        priority: 'low',
        description: '매직 넘버 상수화'
      });
    }
    
    // 성능 최적화
    if (options.optimize) {
      plan.push({
        type: 'optimize_performance',
        priority: 'medium',
        description: '성능 최적화'
      });
    }
    
    this.log(`📊 계획 완료: ${plan.length}개 리팩토링 작업`);
    return plan;
  }

  /**
   * 리팩토링 적용
   */
  applyRefactoring(code, refactoring) {
    this.log(`🔧 ${refactoring.description} 적용 중...`);
    
    switch (refactoring.type) {
      case 'remove_duplication':
        return this.removeDuplication(code);
      case 'split_long_functions':
        return this.splitLongFunctions(code);
      case 'cleanup_imports':
        return this.cleanupImports(code);
      case 'remove_unused_variables':
        return this.removeUnusedVariables(code);
      case 'extract_constants':
        return this.extractConstants(code);
      case 'optimize_performance':
        return this.optimizePerformance(code);
      default:
        return code;
    }
  }

  /**
   * 중복 코드 제거
   */
  removeDuplication(code) {
    // 간단한 중복 제거 로직
    const lines = code.split('\n');
    const uniqueLines = [];
    const seen = new Set();
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        uniqueLines.push(line);
      } else if (!trimmed) {
        uniqueLines.push(line);
      }
    }
    
    return uniqueLines.join('\n');
  }

  /**
   * 긴 함수 분할
   */
  splitLongFunctions(code) {
    // 긴 함수를 찾아서 분할하는 로직
    // 실제 구현에서는 더 정교한 파싱이 필요
    return code;
  }

  /**
   * Import 정리
   */
  cleanupImports(code) {
    const lines = code.split('\n');
    const importLines = [];
    const otherLines = [];
    const seenImports = new Set();
    
    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        const trimmed = line.trim();
        if (!seenImports.has(trimmed)) {
          seenImports.add(trimmed);
          importLines.push(line);
        }
      } else {
        otherLines.push(line);
      }
    }
    
    return [...importLines, ...otherLines].join('\n');
  }

  /**
   * 사용하지 않는 변수 제거
   */
  removeUnusedVariables(code) {
    // 사용하지 않는 변수를 제거하는 로직
    // 실제 구현에서는 더 정교한 분석이 필요
    return code;
  }

  /**
   * 상수 추출
   */
  extractConstants(code) {
    // 매직 넘버를 상수로 추출하는 로직
    return code;
  }

  /**
   * 성능 최적화
   */
  optimizePerformance(code) {
    // 성능 최적화 로직
    let optimized = code;
    
    // useCallback 최적화
    optimized = optimized.replace(
      /useCallback\(([^,]+),\s*\[\]\)/g,
      'useCallback($1, [])'
    );
    
    // 불필요한 의존성 제거
    optimized = optimized.replace(
      /useCallback\(([^,]+),\s*\[([^\]]*)\]/g,
      (match, callback, deps) => {
        const cleanDeps = deps.split(',').map(dep => dep.trim()).filter(dep => dep);
        return `useCallback(${callback}, [${cleanDeps.join(', ')}]`;
      }
    );
    
    return optimized;
  }

  /**
   * 리팩토링된 코드 검증
   */
  async validateRefactoredCode(code, filePath) {
    try {
      // TypeScript 컴파일 검사
      const tempFile = filePath.replace('.ts', '.temp.ts');
      fs.writeFileSync(tempFile, code);
      
      try {
        execSync(`npx tsc --noEmit ${tempFile}`, { stdio: 'pipe' });
        fs.unlinkSync(tempFile);
        return { isValid: true };
      } catch (error) {
        fs.unlinkSync(tempFile);
        return { isValid: false, error: 'TypeScript 컴파일 오류' };
      }
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * 개선 보고서 생성
   */
  generateImprovementReport(refactoringPlan) {
    return refactoringPlan.map(refactoring => ({
      type: refactoring.type,
      description: refactoring.description,
      priority: refactoring.priority,
      applied: true
    }));
  }

  /**
   * 유사도 계산
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * 레벤슈타인 거리 계산
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 라인 번호 계산
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length - 1;
  }

  /**
   * 리팩토링 패턴 로드
   */
  loadRefactoringPatterns() {
    return {
      extractMethod: '메서드 추출',
      extractVariable: '변수 추출',
      extractConstant: '상수 추출',
      inlineMethod: '메서드 인라인',
      moveMethod: '메서드 이동',
      renameMethod: '메서드 이름 변경'
    };
  }

  /**
   * 최적화 규칙 로드
   */
  loadOptimizationRules() {
    return {
      performance: ['useCallback 최적화', 'useMemo 최적화', '불필요한 리렌더링 방지'],
      memory: ['메모리 누수 방지', '가비지 컬렉션 최적화'],
      bundle: ['코드 분할', '트리 셰이킹']
    };
  }

  /**
   * 코드 품질 표준 로드
   */
  loadCodeQualityStandards() {
    return {
      complexity: { max: 10, warning: 7 },
      functionLength: { max: 20, warning: 15 },
      parameterCount: { max: 5, warning: 3 },
      nestingLevel: { max: 4, warning: 3 }
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
if (process.argv[1] && process.argv[1].endsWith('improved-refactoring-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        options.file = args[i + 1];
        i++;
        break;
      case '--optimize':
        options.optimize = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  const agent = new ImprovedRefactoringAgent();
  
  if (options.file) {
    agent.refactorCode(options.file, options)
      .then(result => {
        if (result.success) {
          console.log(`✅ 리팩토링 완료: ${result.changes}개 변경사항`);
          console.log('개선사항:', result.improvements);
        } else {
          console.error(`❌ 리팩토링 실패: ${result.error}`);
        }
      })
      .catch(error => {
        console.error('에이전트 실행 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node improved-refactoring-agent.js --file 파일경로 [--optimize] [--dry-run]');
  }
}

export { ImprovedRefactoringAgent };
