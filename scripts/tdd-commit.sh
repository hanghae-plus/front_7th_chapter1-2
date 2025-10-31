#!/bin/bash

# TDD 자동 커밋 스크립트
# 사용법: ./scripts/tdd-commit.sh [red|green|refactor] "[커밋 메시지 (선택)]"

STAGE=$1
CUSTOM_MESSAGE=$2

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 실행
echo -e "${YELLOW}테스트 실행 중...${NC}"
npm test -- --run 2>&1 | tee /tmp/test-output.txt
TEST_EXIT_CODE=${PIPESTATUS[0]}

case $STAGE in
  red)
    # RED 단계: 테스트가 실패해야 함
    if [ $TEST_EXIT_CODE -ne 0 ]; then
      echo -e "${RED}✓ RED 단계: 테스트 실패 확인됨${NC}"
      
      # 커밋 메시지 생성
      if [ -z "$CUSTOM_MESSAGE" ]; then
        COMMIT_MESSAGE="test: 🔴 RED - Add failing test"
      else
        COMMIT_MESSAGE="test: 🔴 RED - $CUSTOM_MESSAGE"
      fi
      
      # 변경사항 스테이징 및 커밋
      git add -A
      git commit -m "$COMMIT_MESSAGE"
      
      echo -e "${GREEN}✓ RED 단계 커밋 완료${NC}"
      exit 0
    else
      echo -e "${YELLOW}✗ RED 단계 실패: 테스트가 통과했습니다. RED 단계에서는 테스트가 실패해야 합니다.${NC}"
      exit 1
    fi
    ;;
    
  green)
    # GREEN 단계: 테스트가 성공해야 함
    if [ $TEST_EXIT_CODE -eq 0 ]; then
      echo -e "${GREEN}✓ GREEN 단계: 테스트 성공 확인됨${NC}"
      
      # 커밋 메시지 생성
      if [ -z "$CUSTOM_MESSAGE" ]; then
        COMMIT_MESSAGE="feat: 🟢 GREEN - Implement feature to pass tests"
      else
        COMMIT_MESSAGE="feat: 🟢 GREEN - $CUSTOM_MESSAGE"
      fi
      
      # 변경사항 스테이징 및 커밋
      git add -A
      git commit -m "$COMMIT_MESSAGE"
      
      echo -e "${GREEN}✓ GREEN 단계 커밋 완료${NC}"
      exit 0
    else
      echo -e "${RED}✗ GREEN 단계 실패: 테스트가 실패했습니다. GREEN 단계에서는 테스트가 통과해야 합니다.${NC}"
      exit 1
    fi
    ;;
    
  refactor)
    # REFACTOR 단계: 테스트가 여전히 성공해야 함
    if [ $TEST_EXIT_CODE -eq 0 ]; then
      echo -e "${GREEN}✓ REFACTOR 단계: 테스트 성공 확인됨${NC}"
      
      # 커밋 메시지 생성
      if [ -z "$CUSTOM_MESSAGE" ]; then
        COMMIT_MESSAGE="refactor: REFACTOR - Improve code quality"
      else
        COMMIT_MESSAGE="refactor: REFACTOR - $CUSTOM_MESSAGE"
      fi
      
      # 변경사항 스테이징 및 커밋
      git add -A
      git commit -m "$COMMIT_MESSAGE"
      
      echo -e "${GREEN}✓ REFACTOR 단계 커밋 완료${NC}"
      exit 0
    else
      echo -e "${RED}✗ REFACTOR 단계 실패: 리팩토링 후 테스트가 실패했습니다.${NC}"
      exit 1
    fi
    ;;
    
  *)
    echo -e "${RED}사용법: $0 [red|green|refactor] \"[커밋 메시지]\""
    echo -e "예시:"
    echo -e "  $0 red \"Add test for repeat type selection\""
    echo -e "  $0 green \"Implement repeat type selection\""
    echo -e "  $0 refactor \"Extract validation logic\"${NC}"
    exit 1
    ;;
esac

