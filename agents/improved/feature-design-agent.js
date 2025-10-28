import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Feature Design Agent
 * 기능 요구사항을 분석하고 상세 명세를 생성하는 에이전트
 */
class FeatureDesignAgent {
  constructor() {
    this.analysisPatterns = this.loadAnalysisPatterns();
    this.specificationTemplates = this.loadSpecificationTemplates();
    this.qualityStandards = this.loadQualityStandards();
  }

  /**
   * 기능 설계 실행
   */
  async designFeature(requirement, options = {}) {
    try {
      this.log('🎯 기능 설계 시작');

      // 1. 요구사항 분석
      const requirementAnalysis = this.analyzeRequirement(requirement);
      
      // 2. 프로젝트 영향도 분석
      const impactAnalysis = this.analyzeProjectImpact(requirementAnalysis);
      
      // 3. 작업 범위 정의
      const scopeDefinition = this.defineScope(requirementAnalysis, impactAnalysis);
      
      // 4. 상세 명세 작성
      const detailedSpecification = this.createDetailedSpecification(requirementAnalysis, scopeDefinition);
      
      // 5. 체크리스트 생성
      const checklists = this.createChecklists(detailedSpecification);
      
      // 6. PRD 문서 생성
      const prdDocument = this.generatePRDDocument(detailedSpecification, checklists);
      
      this.log('✅ 기능 설계 완료');
      
      return {
        success: true,
        prdDocument,
        specification: detailedSpecification,
        checklists,
        impactAnalysis,
        scopeDefinition
      };
      
    } catch (error) {
      this.log(`❌ 기능 설계 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 요구사항 분석
   */
  analyzeRequirement(requirement) {
    this.log('📋 요구사항 분석 중...');
    
    const analysis = {
      title: this.extractFeatureName(requirement),
      description: this.extractDescription(requirement),
      scenarios: this.extractScenarios(requirement),
      userStories: this.extractUserStories(requirement),
      acceptanceCriteria: this.extractAcceptanceCriteria(requirement),
      apiEndpoints: this.extractAPIEndpoints(requirement),
      complexity: this.assessComplexity(requirement),
      dependencies: this.identifyDependencies(requirement)
    };
    
    this.log(`📊 분석 완료: 복잡도 ${analysis.complexity}, 의존성 ${analysis.dependencies.length}개`);
    return analysis;
  }

  /**
   * 프로젝트 영향도 분석
   */
  analyzeProjectImpact(requirementAnalysis) {
    this.log('🔍 프로젝트 영향도 분석 중...');
    
    const impact = {
      affectedFiles: this.identifyAffectedFiles(requirementAnalysis),
      newFiles: this.identifyNewFiles(requirementAnalysis),
      modifiedComponents: this.identifyModifiedComponents(requirementAnalysis),
      riskLevel: this.assessRiskLevel(requirementAnalysis)
    };
    
    this.log(`📈 영향도 분석 완료: ${impact.affectedFiles.length}개 파일 영향`);
    return impact;
  }

  /**
   * 작업 범위 정의
   */
  defineScope(requirementAnalysis, impactAnalysis) {
    this.log('📏 작업 범위 정의 중...');
    
    const scope = {
      coreFeatures: this.identifyCoreFeatures(requirementAnalysis),
      optionalFeatures: this.identifyOptionalFeatures(requirementAnalysis),
      technicalRequirements: this.identifyTechnicalRequirements(requirementAnalysis),
      deliverables: this.defineDeliverables(requirementAnalysis, impactAnalysis)
    };
    
    this.log(`📋 범위 정의 완료: ${scope.coreFeatures.length}개 핵심 기능`);
    return scope;
  }

  /**
   * 상세 명세 작성
   */
  createDetailedSpecification(requirementAnalysis, scopeDefinition) {
    this.log('📝 상세 명세 작성 중...');
    
    const specification = {
      overview: {
        title: requirementAnalysis.title,
        description: requirementAnalysis.description,
        goals: this.defineGoals(requirementAnalysis)
      },
      userStories: this.createDetailedUserStories(requirementAnalysis),
      apiSpecification: this.createAPISpecification(requirementAnalysis),
      dataModel: this.createDataModel(requirementAnalysis),
      technicalSpecification: this.createTechnicalSpecification(requirementAnalysis, scopeDefinition),
      acceptanceCriteria: requirementAnalysis.acceptanceCriteria
    };
    
    this.log('✅ 상세 명세 작성 완료');
    return specification;
  }

  /**
   * 체크리스트 생성
   */
  createChecklists(specification) {
    this.log('✅ 체크리스트 생성 중...');
    
    const checklists = {
      requirements: this.createRequirementsChecklist(specification),
      design: this.createDesignChecklist(specification),
      implementation: this.createImplementationChecklist(specification),
      testing: this.createTestingChecklist(specification)
    };
    
    this.log('✅ 체크리스트 생성 완료');
    return checklists;
  }

  /**
   * PRD 문서 생성
   */
  generatePRDDocument(specification, checklists) {
    this.log('📄 PRD 문서 생성 중...');
    
    const prdContent = `# ${specification.overview.title} - Product Requirements Document

## 1. 개요
${specification.overview.description}

## 2. 목표
${specification.overview.goals.join(',')}

## 3. 사용자 스토리
${specification.userStories.map(story => `### ${story.title}
- **As a** ${story.asA}
- **I want** ${story.iWant}
- **So that** ${story.soThat}

**Acceptance Criteria:**
${story.acceptanceCriteria.map(criteria => `- ${criteria}`).join('\n')}
`).join('\n')}

## 4. API 명세
${specification.apiSpecification.endpoints.map(endpoint => `### ${endpoint.method} ${endpoint.path}
- **설명**: ${endpoint.description}
- **요청**: ${endpoint.request}
- **응답**: ${endpoint.response}
`).join('\n')}

## 5. 데이터 모델
${specification.dataModel.map(model => `### ${model.name}
\`\`\`typescript
${model.definition}
\`\`\`
`).join('\n')}

## 6. 체크리스트
### 요구사항 체크리스트
${checklists.requirements.map(item => `- [ ] ${item}`).join('\n')}

### 설계 체크리스트
${checklists.design.map(item => `- [ ] ${item}`).join('\n')}

### 구현 체크리스트
${checklists.implementation.map(item => `- [ ] ${item}`).join('\n')}

### 테스트 체크리스트
${checklists.testing.map(item => `- [ ] ${item}`).join('\n')}
`;
    
    this.log('✅ PRD 문서 생성 완료');
    return prdContent;
  }

  /**
   * 기능명 추출
   */
  extractFeatureName(requirement) {
    const lines = requirement.split('\n');
    for (const line of lines) {
      if (line.startsWith('#') && line.includes('기능')) {
        return line.replace('#', '').trim();
      }
    }
    return '새로운 기능';
  }

  /**
   * 설명 추출
   */
  extractDescription(requirement) {
    const lines = requirement.split('\n');
    for (const line of lines) {
      if (line.includes('기능입니다') || line.includes('기능을')) {
        return line.trim();
      }
    }
    return '사용자 요구사항을 충족하는 기능입니다.';
  }

  /**
   * 시나리오 추출
   */
  extractScenarios(requirement) {
    const scenarios = [];
    const lines = requirement.split('\n');
    
    for (const line of lines) {
      if (line.includes('- 사용자가') || line.includes('- 사용자가')) {
        scenarios.push(line.replace('-', '').trim());
      }
    }
    
    return scenarios;
  }

  /**
   * 사용자 스토리 추출
   */
  extractUserStories(requirement) {
    const stories = [];
    const scenarios = this.extractScenarios(requirement);
    
    scenarios.forEach(scenario => {
      stories.push({
        title: scenario,
        description: scenario
      });
    });
    
    return stories;
  }

  /**
   * 수용 기준 추출
   */
  extractAcceptanceCriteria(requirement) {
    const criteria = [];
    const lines = requirement.split('\n');
    
    for (const line of lines) {
      if (line.includes('API') || line.includes('설계')) {
        criteria.push('API가 정상적으로 동작한다');
      }
    }
    
    return criteria.length > 0 ? criteria : ['기능이 정상적으로 동작한다'];
  }

  /**
   * API 엔드포인트 추출
   */
  extractAPIEndpoints(requirement) {
    const endpoints = [];
    const lines = requirement.split('\n');
    
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
   * 복잡도 평가
   */
  assessComplexity(requirement) {
    const scenarios = this.extractScenarios(requirement);
    const apiEndpoints = this.extractAPIEndpoints(requirement);
    
    if (scenarios.length <= 2 && apiEndpoints.length <= 2) return 'low';
    if (scenarios.length <= 5 && apiEndpoints.length <= 5) return 'medium';
    return 'high';
  }

  /**
   * 의존성 식별
   */
  identifyDependencies(requirement) {
    const dependencies = [];
    
    if (requirement.includes('API')) {
      dependencies.push('API 서버');
    }
    if (requirement.includes('데이터베이스') || requirement.includes('저장')) {
      dependencies.push('데이터베이스');
    }
    if (requirement.includes('UI') || requirement.includes('화면')) {
      dependencies.push('UI 컴포넌트');
    }
    
    return dependencies;
  }

  /**
   * 영향받는 파일 식별
   */
  identifyAffectedFiles(requirementAnalysis) {
    const files = [];
    
    if (requirementAnalysis.apiEndpoints.length > 0) {
      files.push('src/hooks/useEventOperations.ts');
    }
    if (requirementAnalysis.scenarios.some(s => s.includes('UI') || s.includes('화면'))) {
      files.push('src/App.tsx');
    }
    
    return files;
  }

  /**
   * 새 파일 식별
   */
  identifyNewFiles(requirementAnalysis) {
    const featureName = this.toKebabCase(requirementAnalysis.title);
    return [`src/hooks/use${this.toPascalCase(featureName)}.ts`];
  }

  /**
   * 수정될 컴포넌트 식별
   */
  identifyModifiedComponents(requirementAnalysis) {
    const components = [];
    
    if (requirementAnalysis.scenarios.some(s => s.includes('UI') || s.includes('화면'))) {
      components.push('App', 'EventForm', 'EventList');
    }
    
    return components;
  }

  /**
   * 위험도 평가
   */
  assessRiskLevel(requirementAnalysis) {
    if (requirementAnalysis.complexity === 'high') return 'high';
    if (requirementAnalysis.dependencies.length > 2) return 'medium';
    return 'low';
  }

  /**
   * 핵심 기능 식별
   */
  identifyCoreFeatures(requirementAnalysis) {
    return requirementAnalysis.scenarios.map(scenario => ({
      name: scenario,
      priority: 'high',
      description: scenario
    }));
  }

  /**
   * 선택적 기능 식별
   */
  identifyOptionalFeatures(requirementAnalysis) {
    return [];
  }

  /**
   * 기술적 요구사항 식별
   */
  identifyTechnicalRequirements(requirementAnalysis) {
    const requirements = [];
    
    if (requirementAnalysis.apiEndpoints.length > 0) {
      requirements.push('REST API 통신');
    }
    requirements.push('TypeScript 타입 안전성');
    requirements.push('React Hook 패턴');
    
    return requirements;
  }

  /**
   * 산출물 정의
   */
  defineDeliverables(requirementAnalysis, impactAnalysis) {
    return [
      'PRD 문서',
      '테스트 명세서',
      '구현 코드',
      '테스트 코드'
    ];
  }

  /**
   * 목표 정의
   */
  defineGoals(requirementAnalysis) {
    return [
      '사용자 요구사항 충족',
      '안정적인 기능 제공',
      '확장 가능한 구조 구현'
    ];
  }

  /**
   * 상세 사용자 스토리 생성 (개선된 버전)
   */
  createDetailedUserStories(requirementAnalysis) {
    return requirementAnalysis.userStories.map(story => {
      const storyLower = story.title.toLowerCase();
      
      // 시나리오별 맞춤형 스토리 생성
      let iWant = story.description;
      let soThat = '효율적으로 작업할 수 있다';
      let acceptanceCriteria = requirementAnalysis.acceptanceCriteria;
      
      if (storyLower.includes('알림') && storyLower.includes('설정')) {
        iWant = '이벤트 시작 전에 알림을 받고 싶다';
        soThat = '이벤트를 놓치지 않고 준비할 수 있다';
        acceptanceCriteria = [
          '사용자가 알림 시간을 설정할 수 있다',
          '설정된 시간에 알림이 표시된다',
          '알림 설정이 저장된다'
        ];
      } else if (storyLower.includes('알림') && storyLower.includes('해제')) {
        iWant = '설정된 알림을 해제하고 싶다';
        soThat = '불필요한 알림을 받지 않을 수 있다';
        acceptanceCriteria = [
          '사용자가 알림을 해제할 수 있다',
          '해제된 알림은 더 이상 표시되지 않는다'
        ];
      } else if (storyLower.includes('검색') && storyLower.includes('제목')) {
        iWant = '이벤트 제목으로 검색하고 싶다';
        soThat = '원하는 이벤트를 빠르게 찾을 수 있다';
        acceptanceCriteria = [
          '검색어를 입력할 수 있다',
          '검색 결과가 표시된다',
          '검색 결과가 없을 때 안내 메시지가 표시된다'
        ];
      } else if (storyLower.includes('검색') && storyLower.includes('카테고리')) {
        iWant = '카테고리별로 이벤트를 검색하고 싶다';
        soThat = '특정 카테고리의 이벤트만 볼 수 있다';
        acceptanceCriteria = [
          '카테고리를 선택할 수 있다',
          '선택된 카테고리의 이벤트가 표시된다'
        ];
      } else if (storyLower.includes('즐겨찾기') && storyLower.includes('추가')) {
        iWant = '중요한 이벤트를 즐겨찾기에 추가하고 싶다';
        soThat = '중요한 이벤트에 빠르게 접근할 수 있다';
        acceptanceCriteria = [
          '이벤트를 즐겨찾기에 추가할 수 있다',
          '즐겨찾기 목록을 조회할 수 있다'
        ];
      } else if (storyLower.includes('즐겨찾기') && storyLower.includes('제거')) {
        iWant = '즐겨찾기에서 이벤트를 제거하고 싶다';
        soThat = '더 이상 중요하지 않은 이벤트를 정리할 수 있다';
        acceptanceCriteria = [
          '즐겨찾기에서 이벤트를 제거할 수 있다',
          '제거된 이벤트는 즐겨찾기 목록에서 사라진다'
        ];
      }
      
      return {
        title: story.title,
        asA: '사용자',
        iWant: iWant,
        soThat: soThat,
        acceptanceCriteria: acceptanceCriteria
      };
    });
  }

  /**
   * API 명세 생성
   */
  createAPISpecification(requirementAnalysis) {
    return {
      endpoints: requirementAnalysis.apiEndpoints.map(endpoint => ({
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        request: 'JSON body',
        response: 'JSON response'
      }))
    };
  }

  /**
   * 데이터 모델 생성
   */
  createDataModel(requirementAnalysis) {
    const featureName = this.toPascalCase(this.extractFeatureName(requirementAnalysis.title));
    
    return [{
      name: `${featureName}Data`,
      definition: `interface ${featureName}Data {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}`
    }];
  }

  /**
   * 기술 명세 생성
   */
  createTechnicalSpecification(requirementAnalysis, scopeDefinition) {
    return {
      architecture: 'React Hook 기반',
      patterns: ['Custom Hook', 'API Integration'],
      technologies: ['TypeScript', 'React', 'MSW'],
      performance: '최적화된 상태 관리'
    };
  }

  /**
   * 요구사항 체크리스트 생성
   */
  createRequirementsChecklist(specification) {
    return [
      '요구사항 명확성 확인',
      '사용자 스토리 검증',
      '수용 기준 정의',
      '기술적 제약사항 확인'
    ];
  }

  /**
   * 설계 체크리스트 생성
   */
  createDesignChecklist(specification) {
    return [
      '아키텍처 설계 검토',
      'API 설계 검증',
      '데이터 모델 설계',
      '사용자 경험 설계'
    ];
  }

  /**
   * 구현 체크리스트 생성
   */
  createImplementationChecklist(specification) {
    return [
      '코드 품질 기준 준수',
      '타입 안전성 보장',
      '에러 처리 구현',
      '성능 최적화'
    ];
  }

  /**
   * 테스트 체크리스트 생성
   */
  createTestingChecklist(specification) {
    return [
      '단위 테스트 작성',
      '통합 테스트 구현',
      '테스트 커버리지 확인',
      '품질 검증'
    ];
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
   * kebab-case 변환
   */
  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * 분석 패턴 로드
   */
  loadAnalysisPatterns() {
    return {
      userStoryPattern: /as a (.+?) i want (.+?) so that (.+)/i,
      acceptanceCriteriaPattern: /given (.+?) when (.+?) then (.+)/i,
      apiPattern: /(GET|POST|PUT|DELETE)\s+([^\s]+)/i
    };
  }

  /**
   * 명세 템플릿 로드
   */
  loadSpecificationTemplates() {
    return {
      prdTemplate: 'docs/templates/prd-template.md',
      userStoryTemplate: 'docs/templates/user-story-template.md'
    };
  }

  /**
   * 품질 기준 로드
   */
  loadQualityStandards() {
    return {
      userStoryQuality: {
        asA: '명확한 사용자 역할',
        iWant: '구체적인 기능 요구사항',
        soThat: '명확한 비즈니스 가치'
      },
      acceptanceCriteria: {
        testable: true,
        measurable: true,
        achievable: true
      }
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
if (process.argv[1] && process.argv[1].endsWith('feature-design-agent.js')) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--requirement':
        options.requirement = args[i + 1];
        i++;
        break;
      case '--output':
        options.output = args[i + 1];
        i++;
        break;
    }
  }
  
  if (options.requirement) {
    const agent = new FeatureDesignAgent();
    agent.designFeature(options.requirement, options)
      .then(result => {
        if (options.output) {
          fs.writeFileSync(options.output, result.prdDocument);
          console.log(`✅ PRD 문서가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(result.prdDocument);
        }
      })
      .catch(error => {
        console.error('❌ 기능 설계 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node feature-design-agent.js --requirement "요구사항" --output 파일명');
  }
}

export default FeatureDesignAgent;
