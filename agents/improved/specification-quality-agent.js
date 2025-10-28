import fs from 'fs';

/**
 * Specification Quality Agent
 * 명세의 품질을 검증하고 개선 제안을 하는 에이전트
 */
class SpecificationQualityAgent {
  constructor() {
    this.qualityCriteria = this.loadQualityCriteria();
    this.improvementSuggestions = this.loadImprovementSuggestions();
  }

  /**
   * 명세 품질 검증
   */
  async validateSpecificationQuality(requirement) {
    try {
      this.log('🔍 명세 품질 검증 시작');

      const analysis = {
        completeness: this.checkCompleteness(requirement),
        clarity: this.checkClarity(requirement),
        testability: this.checkTestability(requirement),
        apiSpecification: this.checkAPISpecification(requirement),
        userStories: this.checkUserStories(requirement),
        dataModel: this.checkDataModel(requirement),
        errorHandling: this.checkErrorHandling(requirement),
        overallScore: 0,
        improvements: []
      };

      // 전체 점수 계산
      analysis.overallScore = this.calculateOverallScore(analysis);
      
      // 개선 제안 생성
      analysis.improvements = this.generateImprovements(analysis);

      this.log(`✅ 명세 품질 검증 완료: ${analysis.overallScore}/100점`);
      
      return {
        success: true,
        analysis,
        recommendations: this.generateRecommendations(analysis)
      };
      
    } catch (error) {
      this.log(`❌ 명세 품질 검증 실패: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 완성도 검사
   */
  checkCompleteness(requirement) {
    const checks = {
      hasTitle: requirement.includes('#') && requirement.includes('기능'),
      hasScenarios: requirement.includes('시나리오') || requirement.includes('사용자'),
      hasAPI: requirement.includes('API') || requirement.includes('POST') || requirement.includes('GET'),
      hasDescription: requirement.split('\n').some(line => line.length > 20),
      hasAcceptanceCriteria: requirement.includes('수용') || requirement.includes('기준')
    };

    const score = Object.values(checks).filter(Boolean).length * 20;
    
    return {
      score,
      details: checks,
      missing: Object.entries(checks)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key)
    };
  }

  /**
   * 명확성 검사
   */
  checkClarity(requirement) {
    const lines = requirement.split('\n');
    const checks = {
      hasConcreteScenarios: lines.some(line => 
        line.includes('사용자가') && line.includes('할 때')
      ),
      hasSpecificActions: lines.some(line => 
        line.includes('클릭') || line.includes('입력') || line.includes('선택')
      ),
      hasExpectedResults: lines.some(line => 
        line.includes('표시') || line.includes('생성') || line.includes('저장')
      ),
      hasClearAPIEndpoints: lines.some(line => 
        /(GET|POST|PUT|DELETE)\s+\/api\/[^\s]+/.test(line)
      )
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      suggestions: this.generateClaritySuggestions(checks)
    };
  }

  /**
   * 테스트 가능성 검사
   */
  checkTestability(requirement) {
    const checks = {
      hasTestableScenarios: requirement.includes('Given') || requirement.includes('When') || requirement.includes('Then'),
      hasSpecificInputs: requirement.includes('입력') || requirement.includes('데이터'),
      hasExpectedOutputs: requirement.includes('결과') || requirement.includes('응답'),
      hasErrorCases: requirement.includes('에러') || requirement.includes('실패') || requirement.includes('예외')
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      testableElements: this.extractTestableElements(requirement)
    };
  }

  /**
   * API 명세 검사
   */
  checkAPISpecification(requirement) {
    const apiLines = requirement.split('\n').filter(line => 
      line.includes('POST') || line.includes('GET') || line.includes('PUT') || line.includes('DELETE')
    );

    const checks = {
      hasMethodAndPath: apiLines.some(line => /(GET|POST|PUT|DELETE)\s+\/api\/[^\s]+/.test(line)),
      hasDescription: apiLines.some(line => line.includes(' - ')),
      hasRequestStructure: requirement.includes('요청') || requirement.includes('Request'),
      hasResponseStructure: requirement.includes('응답') || requirement.includes('Response')
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      apiEndpoints: this.extractAPIEndpoints(requirement)
    };
  }

  /**
   * 사용자 스토리 검사
   */
  checkUserStories(requirement) {
    const storyLines = requirement.split('\n').filter(line => 
      line.includes('사용자') || line.includes('User')
    );

    const checks = {
      hasUserRole: storyLines.some(line => line.includes('As a')),
      hasUserGoal: storyLines.some(line => line.includes('I want')),
      hasBusinessValue: storyLines.some(line => line.includes('So that')),
      hasAcceptanceCriteria: requirement.includes('수용 기준') || requirement.includes('Acceptance Criteria')
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      userStories: this.extractUserStories(requirement)
    };
  }

  /**
   * 데이터 모델 검사
   */
  checkDataModel(requirement) {
    const checks = {
      hasDataStructure: requirement.includes('interface') || requirement.includes('type'),
      hasFieldTypes: requirement.includes('string') || requirement.includes('number') || requirement.includes('boolean'),
      hasRequiredFields: requirement.includes('required') || requirement.includes('필수'),
      hasOptionalFields: requirement.includes('optional') || requirement.includes('선택')
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      dataModels: this.extractDataModels(requirement)
    };
  }

  /**
   * 에러 처리 검사
   */
  checkErrorHandling(requirement) {
    const checks = {
      hasErrorCases: requirement.includes('에러') || requirement.includes('실패') || requirement.includes('오류'),
      hasErrorMessages: requirement.includes('메시지') || requirement.includes('알림'),
      hasFallbackBehavior: requirement.includes('대체') || requirement.includes('fallback'),
      hasValidation: requirement.includes('검증') || requirement.includes('validation')
    };

    const score = Object.values(checks).filter(Boolean).length * 25;
    
    return {
      score,
      details: checks,
      errorScenarios: this.extractErrorScenarios(requirement)
    };
  }

  /**
   * 전체 점수 계산
   */
  calculateOverallScore(analysis) {
    const weights = {
      completeness: 0.25,
      clarity: 0.20,
      testability: 0.20,
      apiSpecification: 0.15,
      userStories: 0.10,
      dataModel: 0.05,
      errorHandling: 0.05
    };

    let totalScore = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      totalScore += analysis[key].score * weight;
    });

    return Math.round(totalScore);
  }

  /**
   * 개선 제안 생성
   */
  generateImprovements(analysis) {
    const improvements = [];

    if (analysis.completeness.score < 80) {
      improvements.push({
        category: '완성도',
        priority: 'high',
        suggestion: '기능 제목, 시나리오, API 명세, 설명, 수용 기준을 모두 포함하세요.',
        example: '# 이벤트 즐겨찾기 기능\n\n## 주요 시나리오\n- 사용자가 이벤트를 즐겨찾기에 추가\n\n## API 설계\n- POST /api/events/:id/favorite'
      });
    }

    if (analysis.clarity.score < 80) {
      improvements.push({
        category: '명확성',
        priority: 'high',
        suggestion: '구체적인 사용자 행동과 예상 결과를 명시하세요.',
        example: '사용자가 이벤트 카드의 별표 아이콘을 클릭하면 해당 이벤트가 즐겨찾기에 추가되고 별표가 채워진 상태로 표시됩니다.'
      });
    }

    if (analysis.testability.score < 80) {
      improvements.push({
        category: '테스트 가능성',
        priority: 'medium',
        suggestion: 'Given-When-Then 패턴을 사용하여 테스트 가능한 시나리오를 작성하세요.',
        example: 'Given: 사용자가 이벤트 목록을 보고 있을 때\nWhen: 이벤트의 별표 아이콘을 클릭하면\nThen: 해당 이벤트가 즐겨찾기에 추가되고 성공 메시지가 표시된다'
      });
    }

    if (analysis.apiSpecification.score < 80) {
      improvements.push({
        category: 'API 명세',
        priority: 'high',
        suggestion: 'API 엔드포인트의 메서드, 경로, 요청/응답 구조를 명확히 정의하세요.',
        example: 'POST /api/events/:id/favorite\nRequest: { eventId: string }\nResponse: { success: boolean, favoriteId: string }'
      });
    }

    return improvements;
  }

  /**
   * 권장사항 생성
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallScore >= 90) {
      recommendations.push('🎉 훌륭한 명세입니다! AI Agent가 완벽하게 처리할 수 있습니다.');
    } else if (analysis.overallScore >= 80) {
      recommendations.push('✅ 좋은 명세입니다. 몇 가지 개선사항을 적용하면 더욱 완벽해집니다.');
    } else if (analysis.overallScore >= 70) {
      recommendations.push('⚠️ 명세가 부족합니다. 개선사항을 적용한 후 다시 시도하세요.');
    } else {
      recommendations.push('❌ 명세가 매우 부족합니다. 템플릿을 참고하여 완전히 다시 작성하세요.');
    }

    return recommendations;
  }

  /**
   * 명확성 개선 제안 생성
   */
  generateClaritySuggestions(checks) {
    const suggestions = [];

    if (!checks.hasConcreteScenarios) {
      suggestions.push('구체적인 사용자 시나리오를 추가하세요. (예: "사용자가 이벤트를 생성할 때")');
    }

    if (!checks.hasSpecificActions) {
      suggestions.push('구체적인 사용자 행동을 명시하세요. (예: "클릭", "입력", "선택")');
    }

    if (!checks.hasExpectedResults) {
      suggestions.push('예상 결과를 명확히 정의하세요. (예: "표시", "생성", "저장")');
    }

    if (!checks.hasClearAPIEndpoints) {
      suggestions.push('API 엔드포인트를 명확한 형식으로 작성하세요. (예: "POST /api/events")');
    }

    return suggestions;
  }

  /**
   * 테스트 가능한 요소 추출
   */
  extractTestableElements(requirement) {
    const elements = [];
    const lines = requirement.split('\n');

    lines.forEach(line => {
      if (line.includes('사용자가') && line.includes('할 때')) {
        elements.push({
          type: 'scenario',
          content: line.trim(),
          testable: true
        });
      }

      if (/(GET|POST|PUT|DELETE)\s+\/api\/[^\s]+/.test(line)) {
        elements.push({
          type: 'api',
          content: line.trim(),
          testable: true
        });
      }
    });

    return elements;
  }

  /**
   * API 엔드포인트 추출
   */
  extractAPIEndpoints(requirement) {
    const endpoints = [];
    const lines = requirement.split('\n');

    lines.forEach(line => {
      const match = line.match(/(GET|POST|PUT|DELETE)\s+(\/api\/[^\s]+)/);
      if (match) {
        endpoints.push({
          method: match[1],
          path: match[2],
          description: line.split(' - ')[1]?.trim() || ''
        });
      }
    });

    return endpoints;
  }

  /**
   * 사용자 스토리 추출
   */
  extractUserStories(requirement) {
    const stories = [];
    const lines = requirement.split('\n');

    lines.forEach(line => {
      if (line.includes('사용자가') || line.includes('User')) {
        stories.push({
          content: line.trim(),
          hasRole: line.includes('As a'),
          hasGoal: line.includes('I want'),
          hasValue: line.includes('So that')
        });
      }
    });

    return stories;
  }

  /**
   * 데이터 모델 추출
   */
  extractDataModels(requirement) {
    const models = [];
    const lines = requirement.split('\n');

    lines.forEach(line => {
      if (line.includes('interface') || line.includes('type')) {
        models.push({
          content: line.trim(),
          hasTypes: line.includes('string') || line.includes('number'),
          hasRequired: line.includes('required'),
          hasOptional: line.includes('optional')
        });
      }
    });

    return models;
  }

  /**
   * 에러 시나리오 추출
   */
  extractErrorScenarios(requirement) {
    const scenarios = [];
    const lines = requirement.split('\n');

    lines.forEach(line => {
      if (line.includes('에러') || line.includes('실패') || line.includes('오류')) {
        scenarios.push({
          content: line.trim(),
          hasMessage: line.includes('메시지'),
          hasHandling: line.includes('처리')
        });
      }
    });

    return scenarios;
  }

  /**
   * 품질 기준 로드
   */
  loadQualityCriteria() {
    return {
      completeness: {
        required: ['title', 'scenarios', 'api', 'description', 'acceptanceCriteria'],
        weight: 0.25
      },
      clarity: {
        required: ['concreteScenarios', 'specificActions', 'expectedResults', 'clearAPIEndpoints'],
        weight: 0.20
      },
      testability: {
        required: ['testableScenarios', 'specificInputs', 'expectedOutputs', 'errorCases'],
        weight: 0.20
      }
    };
  }

  /**
   * 개선 제안 로드
   */
  loadImprovementSuggestions() {
    return {
      lowScore: '명세를 더 구체적이고 상세하게 작성하세요.',
      mediumScore: '몇 가지 항목을 보완하면 더욱 완벽해집니다.',
      highScore: '훌륭한 명세입니다!'
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
if (process.argv[1] && process.argv[1].endsWith('specification-quality-agent.js')) {
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
    const agent = new SpecificationQualityAgent();
    agent.validateSpecificationQuality(options.requirement)
      .then(result => {
        if (options.output) {
          const report = this.generateQualityReport(result);
          fs.writeFileSync(options.output, report);
          console.log(`✅ 품질 검증 보고서가 ${options.output}에 저장되었습니다.`);
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      })
      .catch(error => {
        console.error('❌ 품질 검증 실패:', error.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node specification-quality-agent.js --requirement "요구사항" --output 파일명');
  }
}

export default SpecificationQualityAgent;
