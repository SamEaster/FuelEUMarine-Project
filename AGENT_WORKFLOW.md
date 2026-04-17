# Agent Workflow Log

This document tracks the interactions, AI agents utilized, and iteration processes involved in building the FuelEU Maritime platform.

## Agents Utilized

   AntiGravity
## Prompts, Outputs, and Corrections

# For backend
Create a Node.js + TypeScript backend project using Express.

Follow strict hexagonal architecture:

src/
  core/
    domain/
    application/
    ports/
  adapters/
    inbound/http/
    outbound/postgres/
  infrastructure/
    db/
    server/
  shared/

Requirements:
- Enable TypeScript strict mode
- Setup ESLint + Prettier
- Setup PostgreSQL connection (use Prisma ORM)
- Create Prisma schema with tables:

routes (id, route_id, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
ship_compliance (id, ship_id, year, cb_gco2eq)
bank_entries (id, ship_id, year, amount_gco2eq)
pools (id, year, created_at)
pool_members (pool_id, ship_id, cb_before, cb_after)

- Add seed data for 5 routes

- Setup Express server in infrastructure layer only

- Do NOT add business logic yet

# Core Logic:
Implement core business logic in a hexagonal architecture.

Create:

Entities:
- Route
- ComplianceBalance
- BankEntry
- Pool

Use-cases:
1. ComputeComplianceBalance
   - Input: ghgIntensity, fuelConsumption
   - Formula:
     energy = fuelConsumption * 41000
     CB = (89.3368 - ghgIntensity) * energy

2. CompareRoutes
   - percentDiff = ((comparison / baseline) - 1) * 100
   - compliant = ghgIntensity <= 89.3368

3. BankSurplus
   - Only allow CB > 0

4. ApplyBanked
   - Cannot exceed available banked amount

5. CreatePool
   - Sum CB ≥ 0
   - Deficit ships must not worsen
   - Surplus ships must not go negative
   - Use greedy algorithm

IMPORTANT:
- No DB or Express usage
- Pure TypeScript logic
- Use interfaces for repository ports

# APIs:
Implement HTTP API layer using Express.

Use controllers as adapters calling use-cases.

Endpoints:

/routes
- GET /routes
- POST /routes/:id/baseline
- GET /routes/comparison

/compliance
- GET /compliance/cb?shipId&year
- GET /compliance/adjusted-cb?shipId&year

/banking
- GET /banking/records
- POST /banking/bank
- POST /banking/apply

/pools
- POST /pools

Rules:
- Controllers must NOT contain business logic
- Use dependency injection for use-cases
- Return proper JSON responses

# Frontend:
Create a React + TypeScript + TailwindCSS frontend.

Follow structure:
src/
  core/
  adapters/ui/
  adapters/infrastructure/

Create 4 tabs:

1. Routes
- Table with filters
- Button to set baseline

2. Compare
- Show baseline vs others
- percentDiff and compliant
- Add simple chart (Recharts)

3. Banking
- Show CB
- Bank + Apply buttons

4. Pooling
- Show members
- Validate rules
- Create pool

Rules:
- Use hooks for API calls
- Keep UI simple and clean


## Validation / Corrections

For validation I focused more on the test case and calculating the values myself also to ensure the logic is correct. Tried to focus on the edge case, such as in banking if the surplus value is equal to left cb value.


## Observations
- It is able to give the structure of the code. And code fast.
- In case of core logic it failed so had to correct it by providing the correct logic and detailing the logic.
- I used the better practicies such as skills, rules and using the required tool for the task.


## Best Practices Followed
Using skill.md files to give instruction of the agents what the components is for. Using rules.md file to give the rules. And breaking the task.