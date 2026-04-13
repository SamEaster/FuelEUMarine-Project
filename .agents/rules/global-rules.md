---
trigger: always_on
---

# Global Engineering Rules

## 1. Architecture (STRICT)
- Follow Hexagonal Architecture (Ports & Adapters)
- Core must NOT depend on:
  - Express
  - React
  - Prisma / DB
- Adapters implement ports

## 2. Code Structure
- Use TypeScript strict mode
- Small, composable functions
- No business logic inside controllers

## 3. Naming Conventions
- Use domain-driven names:
  - ComplianceBalance
  - BankSurplus
  - CreatePool

## 4. Separation of Concerns
- Controller → only request/response handling
- Use-cases → business logic
- Repository → data access

## 5. Error Handling
- Use structured error classes
- No silent failures

## 6. Testing
- Every use-case must have unit tests
- Avoid testing implementation details

## 7. AI Agent Behavior
- Do NOT hallucinate missing requirements
- Ask for clarification if unsure
- Prefer correctness over verbosity
