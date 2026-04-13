# Hexagonal Architecture Guidelines

## Layers

### Core
- domain/
  - entities
  - value objects
- application/
  - use-cases
- ports/
  - interfaces (repositories, services)

### Adapters

#### Inbound
- HTTP controllers
- React UI

#### Outbound
- Database (Postgres)
- External APIs

---

## Rules
- Core must be framework-agnostic
- Use dependency inversion
- Ports define contracts
- Adapters implement ports

---

## Example Flow

Controller → UseCase → RepositoryPort → DB Adapter