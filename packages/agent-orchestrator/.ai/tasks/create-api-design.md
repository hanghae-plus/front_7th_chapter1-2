---
task: create-api-design
description: Define API contracts, schemas, and versioning strategy
category: planning

contract:
  inputs:
    system_overview:
      type: file
      description: System architecture overview
      required: true
  outputs:
    api_design:
      type: file
      description: Complete API design with contracts and schemas
      required: true

template: templates/architect-api-design-tmpl.md
---

# Task: Create API Design

## Purpose

Define contracts, schema, and versioning for APIs.

## Steps

1. **Specify Endpoints**:
   - HTTP methods and paths
   - Request/response schemas
   - Status codes
   - Error formats

2. **Define Contract Tests**:
   - Pre-conditions
   - Post-conditions
   - Invariants

3. **Document Versioning**:
   - Version strategy (URL, header, content negotiation)
   - Backward compatibility plan
   - Deprecation policy

4. **Security Considerations**:
   - Authentication methods
   - Authorization rules
   - Rate limiting strategy
   - Input validation

## Output Format

Use the provided template to create API design with:
- Endpoint specifications (method/path/schema)
- Request/response examples
- Contract test scenarios
- Versioning and compatibility plan
- Security requirements
- Error handling strategy
