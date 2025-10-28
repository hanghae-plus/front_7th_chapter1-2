#!/usr/bin/env node

/**
 * Code Writing Agent
 * 테스트 코드를 바탕으로 실제 구현 코드를 작성하는 에이전트
 */

const fs = require('fs');
const path = require('path');

class CodeWritingAgent {
  constructor() {
    this.codingStandards = {
      framework: 'React',
      language: 'TypeScript',
      styling: 'Material-UI',
      stateManagement: 'React Hooks',
      testing: 'Vitest + React Testing Library'
    };
  }

  parseTestCode(testCode) {
    // 테스트 코드 분석
    const parsed = {
      testCases: this.extractTestCases(testCode),
      imports: this.extractImports(testCode),
      mocks: this.extractMocks(testCode),
      assertions: this.extractAssertions(testCode)
    };

    return parsed;
  }

  extractTestCases(testCode) {
    // 테스트 케이스 추출
    const testCases = [];
    const testRegex = /\bit\(['"`](.+?)['"`],\s*async?\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/g;
    let match;

    while ((match = testRegex.exec(testCode)) !== null) {
      testCases.push({
        name: match[1],
        body: match[2]
      });
    }

    return testCases;
  }

  extractImports(testCode) {
    // Import 문 추출
    const imports = [];
    const importRegex = /import\s+(.+?)\s+from\s+['"`](.+?)['"`];/g;
    let match;

    while ((match = importRegex.exec(testCode)) !== null) {
      imports.push({
        module: match[1],
        source: match[2]
      });
    }

    return imports;
  }

  extractMocks(testCode) {
    // Mock 데이터 추출
    const mocks = [];
    const mockRegex = /const\s+(.+?)\s*=\s*({[\s\S]*?});/g;
    let match;

    while ((match = mockRegex.exec(testCode)) !== null) {
      try {
        mocks.push({
          name: match[1],
          data: JSON.parse(match[2])
        });
      } catch (error) {
        // JSON 파싱 실패 시 문자열로 저장
        mocks.push({
          name: match[1],
          data: match[2]
        });
      }
    }

    return mocks;
  }

  extractAssertions(testCode) {
    // 어설션 추출
    const assertions = [];
    const assertionRegex = /expect\((.+?)\)\.(.+?)\((.+?)\);/g;
    let match;

    while ((match = assertionRegex.exec(testCode)) !== null) {
      assertions.push({
        target: match[1],
        matcher: match[2],
        expected: match[3]
      });
    }

    return assertions;
  }

  generateHookImplementation(testCases, imports) {
    // Hook 구현 코드 생성
    const hookCode = [];

    // Import 문
    hookCode.push("import { useState, useCallback, useEffect } from 'react';");
    hookCode.push("import { useSnackbar } from 'notistack';");
    
    // 타입 정의
    hookCode.push("interface UseRecurringEventOperationsReturn {");
    hookCode.push("  events: Event[];");
    hookCode.push("  editSingleEvent: (eventId: string, updates: Partial<EventForm>) => Promise<void>;");
    hookCode.push("  editRecurringEvent: (eventId: string, updates: Partial<EventForm>) => Promise<void>;");
    hookCode.push("  showEditDialog: (event: Event) => void;");
    hookCode.push("}");
    hookCode.push("");

    // Hook 함수 시작
    hookCode.push("export const useRecurringEventOperations = (): UseRecurringEventOperationsReturn => {");
    hookCode.push("  const [events, setEvents] = useState<Event[]>([]);");
    hookCode.push("  const { enqueueSnackbar } = useSnackbar();");
    hookCode.push("");

    // API 호출 함수들
    hookCode.push("  const editSingleEvent = useCallback(async (eventId: string, updates: Partial<EventForm>) => {");
    hookCode.push("    try {");
    hookCode.push("      const response = await fetch(`/api/events/${eventId}/single`, {");
    hookCode.push("        method: 'PUT',");
    hookCode.push("        headers: { 'Content-Type': 'application/json' },");
    hookCode.push("        body: JSON.stringify(updates),");
    hookCode.push("      });");
    hookCode.push("");
    hookCode.push("      if (!response.ok) {");
    hookCode.push("        if (response.status === 404) {");
    hookCode.push("          throw new Error('Event not found');");
    hookCode.push("        }");
    hookCode.push("        throw new Error('Network error');");
    hookCode.push("      }");
    hookCode.push("");
    hookCode.push("      const updatedEvent = await response.json();");
    hookCode.push("      ");
    hookCode.push("      setEvents(prevEvents => ");
    hookCode.push("        prevEvents.map(event => ");
    hookCode.push("          event.id === eventId ");
    hookCode.push("            ? { ...updatedEvent, repeat: { type: 'none', interval: 0 } }");
    hookCode.push("            : event");
    hookCode.push("        )");
    hookCode.push("      );");
    hookCode.push("");
    hookCode.push("      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });");
    hookCode.push("    } catch (error) {");
    hookCode.push("      console.error('Error editing single event:', error);");
    hookCode.push("      enqueueSnackbar('일정 수정 실패', { variant: 'error' });");
    hookCode.push("      throw error;");
    hookCode.push("    }");
    hookCode.push("  }, [enqueueSnackbar]);");
    hookCode.push("");

    hookCode.push("  const editRecurringEvent = useCallback(async (eventId: string, updates: Partial<EventForm>) => {");
    hookCode.push("    try {");
    hookCode.push("      const response = await fetch(`/api/events/${eventId}/recurring`, {");
    hookCode.push("        method: 'PUT',");
    hookCode.push("        headers: { 'Content-Type': 'application/json' },");
    hookCode.push("        body: JSON.stringify(updates),");
    hookCode.push("      });");
    hookCode.push("");
    hookCode.push("      if (!response.ok) {");
    hookCode.push("        if (response.status === 404) {");
    hookCode.push("          throw new Error('Event not found');");
    hookCode.push("        }");
    hookCode.push("        throw new Error('Network error');");
    hookCode.push("      }");
    hookCode.push("");
    hookCode.push("      const updatedEvents = await response.json();");
    hookCode.push("      ");
    hookCode.push("      setEvents(prevEvents => ");
    hookCode.push("        prevEvents.map(event => {");
    hookCode.push("          const updatedEvent = updatedEvents.find((e: Event) => e.id === event.id);");
    hookCode.push("          return updatedEvent || event;");
    hookCode.push("        })");
    hookCode.push("      );");
    hookCode.push("");
    hookCode.push("      enqueueSnackbar('반복 일정이 수정되었습니다.', { variant: 'success' });");
    hookCode.push("    } catch (error) {");
    hookCode.push("      console.error('Error editing recurring event:', error);");
    hookCode.push("      enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });");
    hookCode.push("      throw error;");
    hookCode.push("    }");
    hookCode.push("  }, [enqueueSnackbar]);");
    hookCode.push("");

    hookCode.push("  const showEditDialog = useCallback((event: Event) => {");
    hookCode.push("    // 다이얼로그 표시 로직");
    hookCode.push("    console.log('Show edit dialog for event:', event.id);");
    hookCode.push("  }, []);");
    hookCode.push("");

    hookCode.push("  return {");
    hookCode.push("    events,");
    hookCode.push("    editSingleEvent,");
    hookCode.push("    editRecurringEvent,");
    hookCode.push("    showEditDialog,");
    hookCode.push("  };");
    hookCode.push("};");

    return hookCode.join('\n');
  }

  generateComponentImplementation(testCases, imports) {
    // 컴포넌트 구현 코드 생성
    const componentCode = [];

    // Import 문
    componentCode.push("import React from 'react';");
    componentCode.push("import {");
    componentCode.push("  Dialog,");
    componentCode.push("  DialogTitle,");
    componentCode.push("  DialogContent,");
    componentCode.push("  DialogContentText,");
    componentCode.push("  DialogActions,");
    componentCode.push("  Button,");
    componentCode.push("  Stack,");
    componentCode.push("} from '@mui/material';");
    componentCode.push("import { Event } from '../types';");
    componentCode.push("");

    // Props 타입 정의
    componentCode.push("interface RecurringEventDialogProps {");
    componentCode.push("  open: boolean;");
    componentCode.push("  onClose: () => void;");
    componentCode.push("  event: Event | null;");
    componentCode.push("  onSingleEdit: () => void;");
    componentCode.push("  onRecurringEdit: () => void;");
    componentCode.push("}");
    componentCode.push("");

    // 컴포넌트 구현
    componentCode.push("export const RecurringEventDialog: React.FC<RecurringEventDialogProps> = ({");
    componentCode.push("  open,");
    componentCode.push("  onClose,");
    componentCode.push("  event,");
    componentCode.push("  onSingleEdit,");
    componentCode.push("  onRecurringEdit,");
    componentCode.push("}) => {");
    componentCode.push("  if (!event) return null;");
    componentCode.push("");
    componentCode.push("  return (");
    componentCode.push("    <Dialog open={open} onClose={onClose} maxWidth=\"sm\" fullWidth>");
    componentCode.push("      <DialogTitle>일정 수정 옵션</DialogTitle>");
    componentCode.push("      <DialogContent>");
    componentCode.push("        <DialogContentText>");
    componentCode.push("          \"{event.title}\" 일정을 수정하시겠습니까?");
    componentCode.push("        </DialogContentText>");
    componentCode.push("        <Stack spacing={2} sx={{ mt: 2 }}>");
    componentCode.push("          <Button");
    componentCode.push("            variant=\"outlined\"");
    componentCode.push("            onClick={() => {");
    componentCode.push("              onSingleEdit();");
    componentCode.push("              onClose();");
    componentCode.push("            }}");
    componentCode.push("            fullWidth");
    componentCode.push("          >");
    componentCode.push("            해당 일정만 수정");
    componentCode.push("          </Button>");
    componentCode.push("          <Button");
    componentCode.push("            variant=\"outlined\"");
    componentCode.push("            onClick={() => {");
    componentCode.push("              onRecurringEdit();");
    componentCode.push("              onClose();");
    componentCode.push("            }}");
    componentCode.push("            fullWidth");
    componentCode.push("          >");
    componentCode.push("            전체 반복 일정 수정");
    componentCode.push("          </Button>");
    componentCode.push("        </Stack>");
    componentCode.push("      </DialogContent>");
    componentCode.push("      <DialogActions>");
    componentCode.push("        <Button onClick={onClose}>취소</Button>");
    componentCode.push("      </DialogActions>");
    componentCode.push("    </Dialog>");
    componentCode.push("  );");
    componentCode.push("};");

    return componentCode.join('\n');
  }

  generateImplementationCode(testCode, targetFile) {
    // 구현 코드 생성
    const parsed = this.parseTestCode(testCode);
    
    if (targetFile.includes('hook')) {
      return this.generateHookImplementation(parsed.testCases, parsed.imports);
    } else if (targetFile.includes('component')) {
      return this.generateComponentImplementation(parsed.testCases, parsed.imports);
    } else {
      // 일반적인 구현 코드
      return this.generateGenericImplementation(parsed.testCases, parsed.imports);
    }
  }

  generateGenericImplementation(testCases, imports) {
    // 일반적인 구현 코드 생성
    const implementation = [];

    implementation.push("// Generated implementation code");
    implementation.push("export const implementation = () => {");
    implementation.push("  // Implementation logic based on test cases");
    implementation.push("  ");
    implementation.push("  return {");
    implementation.push("    // Return values");
    implementation.push("  };");
    implementation.push("};");

    return implementation.join('\n');
  }

  validateImplementationCode(implementationCode) {
    // 구현 코드 검증
    const validation = {
      isValid: true,
      issues: []
    };

    // TypeScript 문법 확인
    if (implementationCode.includes('any')) {
      validation.issues.push('any 타입 사용을 피하세요');
    }

    // 에러 처리 확인
    if (!implementationCode.includes('try') && !implementationCode.includes('catch')) {
      validation.issues.push('에러 처리가 없습니다');
    }

    // 접근성 확인
    if (implementationCode.includes('Dialog') && !implementationCode.includes('aria-')) {
      validation.issues.push('접근성 속성이 부족합니다');
    }

    return validation;
  }

  async generateImplementation(input) {
    try {
      const { testCode, targetFile, featureSpec, existingCodebase } = input;
      
      if (!testCode) {
        throw new Error('테스트 코드가 필요합니다.');
      }

      if (!targetFile) {
        throw new Error('대상 파일이 필요합니다.');
      }

      // 구현 코드 생성
      const implementationCode = this.generateImplementationCode(testCode, targetFile);
      
      // 구현 코드 검증
      const validation = this.validateImplementationCode(implementationCode);
      
      if (validation.issues.length > 0) {
        console.warn('구현 코드 검증 경고:', validation.issues);
      }

      return {
        implementationCode,
        validation
      };
    } catch (error) {
      throw new Error(`구현 코드 생성 실패: ${error.message}`);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
        input.testCode = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--target':
        input.targetFile = args[++i];
        break;
      case '--spec':
        input.featureSpec = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--existing-code':
        input.existingCodebase = fs.readFileSync(args[++i], 'utf8');
        break;
      case '--output':
        input.output = args[++i];
        break;
    }
  }

  if (!input.testCode || !input.targetFile) {
    console.error('--test와 --target 옵션이 필요합니다.');
    process.exit(1);
  }

  const agent = new CodeWritingAgent();
  agent.generateImplementation(input)
    .then(result => {
      if (input.output) {
        fs.writeFileSync(input.output, result.implementationCode);
        console.log(`구현 코드가 생성되었습니다: ${input.output}`);
      } else {
        console.log(result.implementationCode);
      }
    })
    .catch(error => {
      console.error('에이전트 실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = CodeWritingAgent;
