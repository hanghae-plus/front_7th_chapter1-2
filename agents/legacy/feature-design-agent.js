#!/usr/bin/env node

/**
 * Feature Design Agent
 * 기능 요구사항을 구체적이고 명확한 명세로 변환하는 에이전트
 */

const fs = require('fs');
const path = require('path');

class FeatureDesignAgent {
  constructor() {
    this.specTemplate = this.loadSpecTemplate();
  }

  loadSpecTemplate() {
    return `# {FEATURE_NAME} 기능 명세

## 개요
{FEATURE_DESCRIPTION}

## 시나리오

### 시나리오 1: {SCENARIO_1_NAME}
- {SCENARIO_1_DESCRIPTION}
- 사용자 행동: {USER_ACTION_1}
- 예상 결과: {EXPECTED_RESULT_1}

### 시나리오 2: {SCENARIO_2_NAME}
- {SCENARIO_2_DESCRIPTION}
- 사용자 행동: {USER_ACTION_2}
- 예상 결과: {EXPECTED_RESULT_2}

## API 설계

### 엔드포인트
- {API_ENDPOINT_1}: {API_DESCRIPTION_1}
- {API_ENDPOINT_2}: {API_DESCRIPTION_2}

### 데이터 모델
\`\`\`typescript
interface {DATA_MODEL_NAME} {
  {FIELD_1}: {FIELD_1_TYPE};
  {FIELD_2}: {FIELD_2_TYPE};
}
\`\`\`

## 컴포넌트 설계

### React 컴포넌트
- {COMPONENT_NAME}: {COMPONENT_DESCRIPTION}

### Hook 설계
- {HOOK_NAME}: {HOOK_DESCRIPTION}

## 상태 관리
- {STATE_1}: {STATE_1_DESCRIPTION}
- {STATE_2}: {STATE_2_DESCRIPTION}

## 에러 처리
- {ERROR_CASE_1}: {ERROR_HANDLING_1}
- {ERROR_CASE_2}: {ERROR_HANDLING_2}

## 접근성 고려사항
- 키보드 네비게이션 지원
- 스크린 리더 지원
- ARIA 속성 적용
`;
  }

  generateFeatureSpec(featureName, requirements) {
    // 실제 구현에서는 AI API를 호출하여 명세 생성
    // 여기서는 템플릿 기반으로 시뮬레이션
    
    const spec = this.specTemplate
      .replace(/{FEATURE_NAME}/g, featureName)
      .replace(/{FEATURE_DESCRIPTION}/g, requirements.description || `${featureName} 기능에 대한 상세 명세`)
      .replace(/{SCENARIO_1_NAME}/g, '기본 시나리오')
      .replace(/{SCENARIO_1_DESCRIPTION}/g, '사용자가 기본적인 기능을 사용하는 시나리오')
      .replace(/{USER_ACTION_1}/g, '사용자가 기능을 실행')
      .replace(/{EXPECTED_RESULT_1}/g, '기대하는 결과가 정상적으로 표시됨')
      .replace(/{SCENARIO_2_NAME}/g, '에러 케이스')
      .replace(/{SCENARIO_2_DESCRIPTION}/g, '에러 상황에서의 처리')
      .replace(/{USER_ACTION_2}/g, '잘못된 입력 또는 네트워크 오류')
      .replace(/{EXPECTED_RESULT_2}/g, '적절한 에러 메시지 표시')
      .replace(/{API_ENDPOINT_1}/g, 'POST /api/feature')
      .replace(/{API_DESCRIPTION_1}/g, '기능 실행 API')
      .replace(/{API_ENDPOINT_2}/g, 'GET /api/feature/:id')
      .replace(/{API_DESCRIPTION_2}/g, '기능 조회 API')
      .replace(/{DATA_MODEL_NAME}/g, 'FeatureData')
      .replace(/{FIELD_1}/g, 'id')
      .replace(/{FIELD_1_TYPE}/g, 'string')
      .replace(/{FIELD_2}/g, 'name')
      .replace(/{FIELD_2_TYPE}/g, 'string')
      .replace(/{COMPONENT_NAME}/g, 'FeatureComponent')
      .replace(/{COMPONENT_DESCRIPTION}/g, '기능을 담당하는 메인 컴포넌트')
      .replace(/{HOOK_NAME}/g, 'useFeature')
      .replace(/{HOOK_DESCRIPTION}/g, '기능 관련 로직을 담당하는 커스텀 훅')
      .replace(/{STATE_1}/g, 'loading')
      .replace(/{STATE_1_DESCRIPTION}/g, '로딩 상태 관리')
      .replace(/{STATE_2}/g, 'error')
      .replace(/{STATE_2_DESCRIPTION}/g, '에러 상태 관리')
      .replace(/{ERROR_CASE_1}/g, '네트워크 오류')
      .replace(/{ERROR_HANDLING_1}/g, '사용자에게 에러 메시지 표시')
      .replace(/{ERROR_CASE_2}/g, '유효성 검증 실패')
      .replace(/{ERROR_HANDLING_2}/g, '입력 필드에 에러 표시');

    return spec;
  }

  analyzeRequirements(featureName, context = {}) {
    // 요구사항 분석 로직
    const analysis = {
      featureName,
      complexity: this.assessComplexity(featureName),
      dependencies: this.identifyDependencies(context),
      risks: this.identifyRisks(featureName),
      estimatedEffort: this.estimateEffort(featureName)
    };

    return analysis;
  }

  assessComplexity(featureName) {
    // 기능 복잡도 평가
    const complexityKeywords = {
      low: ['simple', 'basic', 'view'],
      medium: ['edit', 'update', 'modify'],
      high: ['complex', 'advanced', 'integration']
    };

    const name = featureName.toLowerCase();
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return level;
      }
    }
    return 'medium';
  }

  identifyDependencies(context) {
    // 의존성 식별
    const dependencies = [];
    
    if (context.existingFeatures) {
      dependencies.push(...context.existingFeatures);
    }
    
    if (context.relatedComponents) {
      dependencies.push(...context.relatedComponents);
    }

    return dependencies;
  }

  identifyRisks(featureName) {
    // 위험 요소 식별
    const risks = [];
    
    if (featureName.includes('recurring')) {
      risks.push('반복 로직의 복잡성');
    }
    
    if (featureName.includes('edit')) {
      risks.push('기존 데이터 무결성');
    }

    return risks;
  }

  estimateEffort(featureName) {
    // 개발 공수 추정
    const complexity = this.assessComplexity(featureName);
    const effortMap = {
      low: '1-2일',
      medium: '3-5일', 
      high: '1-2주'
    };
    
    return effortMap[complexity] || '3-5일';
  }

  validateSpec(spec) {
    // 명세 검증
    const validation = {
      isValid: true,
      issues: []
    };

    // 필수 섹션 확인
    const requiredSections = ['개요', '시나리오', 'API 설계', '컴포넌트 설계'];
    for (const section of requiredSections) {
      if (!spec.includes(section)) {
        validation.isValid = false;
        validation.issues.push(`필수 섹션 누락: ${section}`);
      }
    }

    return validation;
  }

  async generateSpec(input) {
    try {
      const { feature, context = {} } = input;
      
      // 요구사항 분석
      const analysis = this.analyzeRequirements(feature, context);
      
      // 명세 생성
      const spec = this.generateFeatureSpec(feature, { description: analysis.description });
      
      // 명세 검증
      const validation = this.validateSpec(spec);
      
      if (!validation.isValid) {
        throw new Error(`명세 검증 실패: ${validation.issues.join(', ')}`);
      }

      return {
        spec,
        analysis,
        validation
      };
    } catch (error) {
      throw new Error(`명세 생성 실패: ${error.message}`);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--feature':
        input.feature = args[++i];
        break;
      case '--context':
        input.context = JSON.parse(args[++i]);
        break;
      case '--output':
        input.output = args[++i];
        break;
    }
  }

  if (!input.feature) {
    console.error('--feature 옵션이 필요합니다.');
    process.exit(1);
  }

  const agent = new FeatureDesignAgent();
  agent.generateSpec(input)
    .then(result => {
      if (input.output) {
        fs.writeFileSync(input.output, result.spec);
        console.log(`명세가 생성되었습니다: ${input.output}`);
      } else {
        console.log(result.spec);
      }
    })
    .catch(error => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = FeatureDesignAgent;
