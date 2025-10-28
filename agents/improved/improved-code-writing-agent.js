import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Improved Code Writing Agent
 * 테스트 코드를 기반으로 완전한 구현 코드를 생성하는 에이전트
 */
class ImprovedCodeWritingAgent {
  constructor() {
    this.codingStandards = this.loadCodingStandards();
    this.reactPatterns = this.loadReactPatterns();
    this.typescriptPatterns = this.loadTypeScriptPatterns();
  }

  /**
   * 테스트 코드를 바탕으로 완전한 구현 코드 생성
   */
  async generateImplementationCode(testCode, featureSpec) {
    try {
      this.log('💻 구현 코드 생성 시작');

      // 1. 테스트 코드 분석
      const testAnalysis = this.analyzeTestCode(testCode);
      
      // 2. 기능 명세 분석
      const featureAnalysis = this.parseFeatureSpec(featureSpec);
      
      // 3. 필요한 메서드 추출
      const requiredMethods = this.extractRequiredMethods(testAnalysis);
      
      // 4. TypeScript 인터페이스 생성
      const interfaces = this.generateInterfaces(requiredMethods, featureAnalysis);
      
      // 5. React Hook 구현
      const hookImplementation = this.generateHookImplementation(requiredMethods, featureAnalysis);
      
      // 6. 완전한 구현 코드 조합
      const completeImplementation = this.combineImplementationCode(interfaces, hookImplementation);
      
      this.log('✅ 구현 코드 생성 완료');
      return completeImplementation;
      
    } catch (error) {
      this.log(`❌ 구현 코드 생성 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 테스트 코드 분석
   */
  analyzeTestCode(testCode) {
    this.log('🔍 테스트 코드 분석 중...');
    
    const analysis = {
      hookName: this.extractHookName(testCode),
      methods: this.extractMethods(testCode),
      imports: this.extractImports(testCode),
      apiEndpoints: this.extractApiEndpoints(testCode),
      testCases: this.extractTestCases(testCode)
    };
    
    this.log(`📊 분석 완료: ${analysis.methods.length}개 메서드, ${analysis.apiEndpoints.length}개 API`);
    return analysis;
  }

  /**
   * Hook 이름 추출
   */
  extractHookName(testCode) {
    const match = testCode.match(/describe\('use(\w+)'/);
    return match ? `use${match[1]}` : 'useFeature';
  }

  /**
   * 메서드 추출
   */
  extractMethods(testCode) {
    const methods = [];
    const methodRegex = /result\.current\.(\w+)\(/g;
    let match;
    
    while ((match = methodRegex.exec(testCode)) !== null) {
      if (!methods.includes(match[1])) {
        methods.push(match[1]);
      }
    }
    
    return methods;
  }

  /**
   * Import 구문 추출
   */
  extractImports(testCode) {
    const imports = [];
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(testCode)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * API 엔드포인트 추출
   */
  extractApiEndpoints(testCode) {
    const endpoints = [];
    const endpointRegex = /http\.(get|post|put|delete)\('([^']+)'/g;
    let match;
    
    while ((match = endpointRegex.exec(testCode)) !== null) {
      endpoints.push({
        method: match[1].toUpperCase(),
        endpoint: match[2]
      });
    }
    
    return endpoints;
  }

  /**
   * 테스트 케이스 추출
   */
  extractTestCases(testCode) {
    const testCases = [];
    const testRegex = /it\('([^']+)',\s*async\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/g;
    let match;
    
    while ((match = testRegex.exec(testCode)) !== null) {
      testCases.push({
        name: match[1],
        body: match[2]
      });
    }
    
    return testCases;
  }

  /**
   * 기능 명세 파싱
   */
  parseFeatureSpec(featureSpec) {
    this.log('📋 기능 명세 파싱 중...');
    
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
   * 필요한 메서드 추출
   */
  extractRequiredMethods(testAnalysis) {
    this.log('🔧 필요한 메서드 추출 중...');
    
    const methods = [];
    
    testAnalysis.methods.forEach(methodName => {
      const apiEndpoint = this.findApiEndpointForMethod(methodName, testAnalysis.apiEndpoints);
      const methodInfo = this.generateMethodInfo(methodName, apiEndpoint);
      methods.push(methodInfo);
    });
    
    return methods;
  }

  /**
   * 메서드에 대한 API 엔드포인트 찾기 (개선된 버전)
   */
  findApiEndpointForMethod(methodName, apiEndpoints) {
    const methodToEndpoint = {
      // 알림 관련
      'scheduleNotification': { method: 'POST', endpoint: '/api/events/:id/notifications' },
      'cancelNotification': { method: 'DELETE', endpoint: '/api/events/:id/notifications' },
      'showNotification': { method: 'GET', endpoint: '/api/events/:id/notifications' },
      
      // 검색 관련
      'searchByTitle': { method: 'GET', endpoint: '/api/events/search?q=:query' },
      'searchByCategory': { method: 'GET', endpoint: '/api/events/search?category=:category' },
      'handleEmptyResults': { method: 'GET', endpoint: '/api/events/search?q=:query' },
      
      // 즐겨찾기 관련
      'addToFavorites': { method: 'POST', endpoint: '/api/events/:id/favorite' },
      'removeFromFavorites': { method: 'DELETE', endpoint: '/api/events/:id/favorite' },
      'getFavorites': { method: 'GET', endpoint: '/api/events/favorites' },
      
      // 이벤트 관련
      'createEvent': { method: 'POST', endpoint: '/api/events' },
      'updateEvent': { method: 'PUT', endpoint: '/api/events/:id' },
      'deleteEvent': { method: 'DELETE', endpoint: '/api/events/:id' },
      'fetchEvents': { method: 'GET', endpoint: '/api/events' },
      
      // 다이얼로그 관련 (UI 상태만 관리)
      'openDialog': { method: 'NONE', endpoint: 'NONE' },
      'closeDialog': { method: 'NONE', endpoint: 'NONE' },
      'showDialog': { method: 'NONE', endpoint: 'NONE' },
      
      // 폼 관련
      'submitForm': { method: 'POST', endpoint: '/api/events' },
      'resetForm': { method: 'NONE', endpoint: 'NONE' },
      'validateForm': { method: 'NONE', endpoint: 'NONE' },
      
      // 기본 액션들
      'save': { method: 'POST', endpoint: '/api/events' },
      'cancel': { method: 'NONE', endpoint: 'NONE' },
      'confirm': { method: 'POST', endpoint: '/api/events/:id/confirm' },
      'delete': { method: 'DELETE', endpoint: '/api/events/:id' },
      'update': { method: 'PUT', endpoint: '/api/events/:id' },
      'create': { method: 'POST', endpoint: '/api/events' },
      'fetch': { method: 'GET', endpoint: '/api/events' }
    };
    
    // 명시적으로 정의된 엔드포인트가 있으면 사용
    if (methodToEndpoint[methodName]) {
      return methodToEndpoint[methodName];
    }
    
    // API 엔드포인트에서 매칭 시도
    for (const api of apiEndpoints) {
      if (methodName.toLowerCase().includes(api.method.toLowerCase()) || 
          methodName.toLowerCase().includes(api.endpoint.split('/').pop())) {
        return api;
      }
    }
    
    // 기본값 반환
    return { method: 'POST', endpoint: '/api/endpoint' };
  }

  /**
   * 메서드 정보 생성
   */
  generateMethodInfo(methodName, apiEndpoint) {
    return {
      name: methodName,
      method: apiEndpoint.method,
      endpoint: apiEndpoint.endpoint,
      parameters: this.generateMethodParameters(methodName),
      returnType: 'Promise<void>'
    };
  }

  /**
   * 메서드 파라미터 생성
   */
  generateMethodParameters(methodName) {
    const parameterMap = {
      'scheduleNotification': ['eventId: string', 'data: NotificationData'],
      'cancelNotification': ['eventId: string', 'data: Record<string, any>'],
      'editSingleEvent': ['eventId: string', 'data: EditEventData'],
      'editRecurringEvent': ['eventId: string', 'data: EditEventData'],
      'createEvent': ['eventData: EventForm'],
      'deleteEvent': ['eventId: string'],
      'fetchEvents': []
    };
    
    return parameterMap[methodName] || ['eventId: string', 'data: Record<string, any>'];
  }

  /**
   * TypeScript 인터페이스 생성
   */
  generateInterfaces(requiredMethods, featureAnalysis) {
    this.log('🏗️ TypeScript 인터페이스 생성 중...');
    
    const featureName = this.toPascalCase(featureAnalysis.feature);
    const hookName = `use${featureName}`;
    
    let interfaces = `interface EditEventData {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
}

interface NotificationData {
  notificationTime: number;
  message?: string;
}

interface Use${featureName}Return {
  // 상태
  loading: boolean;
  error: string | null;
  
  // 메서드들
`;

    requiredMethods.forEach(method => {
      interfaces += `  ${method.name}: (${method.parameters.join(', ')}) => ${method.returnType};\n`;
    });

    interfaces += `}`;

    return interfaces;
  }

  /**
   * React Hook 구현 생성
   */
  generateHookImplementation(requiredMethods, featureAnalysis) {
    this.log('⚛️ React Hook 구현 생성 중...');
    
    const featureName = this.toPascalCase(featureAnalysis.feature);
    const hookName = `use${featureName}`;
    
    let implementation = `export const ${hookName} = (): Use${featureName}Return => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // 공통 API 호출 함수
  const makeApiCall = useCallback(async (endpoint: string, method: string, data?: any) => {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(\`API 호출 실패: \${response.status} \${response.statusText}\`);
    }

    return await response.json();
  }, []);

`;

    // 각 메서드 구현
    requiredMethods.forEach(method => {
      implementation += this.generateMethodImplementation(method);
    });

    // 반환값 생성
    implementation += `
  return {
    loading,
    error,`;

    requiredMethods.forEach(method => {
      implementation += `
    ${method.name},`;
    });

    implementation += `
  };
};`;

    return implementation;
  }

  /**
   * 개별 메서드 구현 생성
   */
  generateMethodImplementation(method) {
    const methodName = method.name;
    const parameters = method.parameters.join(', ');
    
    return `
  const ${methodName} = useCallback(async (${parameters}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await makeApiCall('${method.endpoint}', '${method.method}', ${this.getDataParameter(method)});
      
      enqueueSnackbar('${this.getSuccessMessage(methodName)}', { variant: 'success' });
      
    } catch (error) {
      console.error('Error in ${methodName}:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setError(errorMessage);
      enqueueSnackbar('${this.getErrorMessage(methodName)}', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [makeApiCall, enqueueSnackbar]);

`;
  }

  /**
   * 데이터 파라미터 추출
   */
  getDataParameter(method) {
    if (method.parameters.includes('data: NotificationData') || 
        method.parameters.includes('data: EditEventData') ||
        method.parameters.includes('data: Record<string, any>')) {
      return 'data';
    }
    if (method.parameters.includes('eventData: EventForm')) {
      return 'eventData';
    }
    return 'undefined';
  }

  /**
   * 성공 메시지 생성
   */
  getSuccessMessage(methodName) {
    const messageMap = {
      'scheduleNotification': '알림이 설정되었습니다.',
      'cancelNotification': '알림이 해제되었습니다.',
      'editSingleEvent': '일정이 수정되었습니다.',
      'editRecurringEvent': '반복 일정이 수정되었습니다.',
      'createEvent': '일정이 생성되었습니다.',
      'deleteEvent': '일정이 삭제되었습니다.',
      'fetchEvents': '일정을 불러왔습니다.'
    };
    
    return messageMap[methodName] || '작업이 완료되었습니다.';
  }

  /**
   * 에러 메시지 생성
   */
  getErrorMessage(methodName) {
    const messageMap = {
      'scheduleNotification': '알림 설정 실패',
      'cancelNotification': '알림 해제 실패',
      'editSingleEvent': '일정 수정 실패',
      'editRecurringEvent': '반복 일정 수정 실패',
      'createEvent': '일정 생성 실패',
      'deleteEvent': '일정 삭제 실패',
      'fetchEvents': '일정 불러오기 실패'
    };
    
    return messageMap[methodName] || '작업 실패';
  }

  /**
   * 완전한 구현 코드 조합
   */
  combineImplementationCode(interfaces, hookImplementation) {
    return `import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { Event, EventForm } from '../types';

${interfaces}

${hookImplementation}`;
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
   * 코딩 표준 로드
   */
  loadCodingStandards() {
    return {
      framework: 'React',
      language: 'TypeScript',
      styling: 'Material-UI',
      stateManagement: 'React Hooks',
      testing: 'Vitest + React Testing Library'
    };
  }

  /**
   * React 패턴 로드
   */
  loadReactPatterns() {
    return {
      hooks: ['useState', 'useCallback', 'useEffect'],
      patterns: ['Custom Hooks', 'State Management', 'API Integration']
    };
  }

  /**
   * TypeScript 패턴 로드
   */
  loadTypeScriptPatterns() {
    return {
      interfaces: ['Component Props', 'API Responses', 'State Types'],
      types: ['Union Types', 'Generic Types', 'Utility Types']
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
if (process.argv[1] && process.argv[1].endsWith('improved-code-writing-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--testCode':
        options.testCode = args[i + 1];
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

  const agent = new ImprovedCodeWritingAgent();
  
  if (options.testCode && options.featureSpec) {
    agent.generateImplementationCode(options.testCode, options.featureSpec)
      .then(implementationCode => {
        if (options.output) {
          fs.writeFileSync(options.output, implementationCode);
          console.log(`✅ 구현 코드가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(implementationCode);
        }
      })
      .catch(error => {
        console.error('에이전트 실행 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node improved-code-writing-agent.js --testCode "테스트 코드" --featureSpec "기능 명세" [--output 파일경로]');
  }
}

export { ImprovedCodeWritingAgent };
