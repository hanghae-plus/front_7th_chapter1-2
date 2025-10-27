<!-- Powered by BMAD™ Core -->

# Create Test Strategy Task

## Purpose

To create a comprehensive test strategy document that defines WHY to test, WHAT to prioritize, and HOW to structure testing efforts for a project or component.

## Process

### 1. Context Analysis

Analyze the project context:
- **Application Type**: Web app, API, mobile, desktop, embedded?
- **Technology Stack**: What frameworks and tools are used?
- **Team Structure**: Size, experience level, capabilities
- **Business Criticality**: What are the business impact factors?
- **Constraints**: Time, budget, tooling limitations

### 2. Risk Assessment

Evaluate risks for each component/feature:

**Risk Categories**:
- **Business Risk**: Impact on revenue, reputation, users
- **Technical Risk**: Complexity, dependencies, changes
- **Data Risk**: Privacy, security, integrity
- **Integration Risk**: Third-party dependencies, external systems

**Risk Scoring** (1-9):
- Probability × Impact = Risk Score
- P0 (High Risk): Score 7-9 → Extensive testing required
- P1 (Medium Risk): Score 4-6 → Standard testing
- P2 (Low Risk): Score 1-3 → Minimal testing

### 3. Test Pyramid Definition

Define testing levels based on Test Pyramid:

```
        /\
       /E2E\       (Few, slow, expensive, high-level)
      /------\
     /Integration\  (Some, medium speed/cost)
    /--------------\
   /    Unit Tests   \   (Many, fast, cheap, low-level)
  /------------------\
```

Recommendations:
- **Unit Tests**: 70% - Fast, cheap, isolated component testing
- **Integration Tests**: 20% - Component interaction testing
- **E2E Tests**: 10% - Complete user journey testing

### 4. Coverage Targets

Define coverage goals:

- **Critical Components**: 90%+ coverage
- **Important Components**: 70%+ coverage
- **Standard Components**: 50%+ coverage
- **Utility/Low-risk**: 30%+ coverage or manual testing

Coverage Types:
- Line coverage (statements)
- Branch coverage (conditionals)
- Function coverage (functions/methods)

### 5. Testing Approach by Component

For each major component, define:

- **Testing Level**: Unit only, Unit + Integration, Unit + Integration + E2E
- **Primary Focus**: Core functionality, edge cases, error handling
- **Automation Level**: Fully automated, semi-automated, manual
- **Priority**: P0 (Critical), P1 (Important), P2 (Nice-to-have)

### 6. Tool and Framework Recommendations

Suggest tools based on stack:
- **Unit Testing**: Jest, Vitest, Mocha, pytest, JUnit, NUnit
- **Integration**: Supertest, Pact, Postman
- **E2E**: Playwright, Cypress, Selenium
- **Coverage**: Istanbul, coverage.py, Codecov
- **CI/CD**: Integration points and configuration

### 7. Create Test Strategy Document

Output: `docs/test-strategy.md`

**Document Structure**:

```markdown
# Test Strategy

## Executive Summary
- Testing approach overview
- Coverage goals
- Timeline and resources

## Context
- Application description
- Technology stack
- Team structure
- Constraints

## Risk Assessment
### Risk Categories
| Component | Business Risk | Technical Risk | Data Risk | Risk Score | Priority |
|-----------|--------------|---------------|-----------|------------|----------|
| Auth      | High         | Medium        | High      | 8          | P0       |
| ...       |              |               |           |            |          |

## Test Pyramid
- Unit: 70% target
- Integration: 20% target  
- E2E: 10% target

## Coverage Targets
- Critical components: 90%
- Important: 70%
- Standard: 50%

## Component Testing Plans
### Component: User Authentication
- **Level**: Unit + Integration
- **Priority**: P0
- **Focus**: Security, edge cases
- **Coverage Target**: 85%
- **Tools**: Jest + Supertest

### Component: User Dashboard  
- **Level**: Unit + Integration + E2E
- **Priority**: P1
- **Focus**: Core functionality, UX
- **Coverage Target**: 70%
- **Tools**: Jest + Playwright

[... for each major component]

## Tools and Frameworks
- Unit Testing: Jest
- Integration: Supertest
- E2E: Playwright
- Coverage: Istanbul

## CI/CD Integration
- Pre-commit hooks for unit tests
- Pull request testing for integration
- Nightly E2E test runs

## Timeline and Milestones
- Phase 1: Critical components (Week 1-2)
- Phase 2: Important components (Week 3-4)
- Phase 3: Standard components (Week 5-6)
```

## Verification

- [ ] All major components have testing approach defined
- [ ] Risk assessment covers key areas
- [ ] Test Pyramid is balanced
- [ ] Coverage targets are realistic
- [ ] Tools are appropriate for stack
- [ ] Timeline is realistic

