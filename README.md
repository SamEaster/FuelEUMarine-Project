# FuelEU Maritime Compliance Platform

A full-stack compliance management system tracking shipping routes and automating the greedy resolution of greenhouse gas (GHG) compliance pools.

## Architecture Overview

This project heavily enforces **Hexagonal Architecture (Ports & Adapters)** on both the backend and frontend.

### Backend (`/backend`)
1. **Core Domain & Application Layer:** Pure TypeScript. Contains the FuelEU mathematical implementation (`ComputeComplianceBalance`), routing invariants (`CompareRoutes`), and dynamic pooling (`CreatePool`). Has ZERO dependencies on Express or Databases.
2. **Ports:** Interfaces defining Data Access objects (e.g., `RouteRepository`, `PoolRepository`).
3. **Outbound Adapters:** Concrete `Prisma*Repository` implementations handling Postgres serialization safely.
4. **Inbound Adapters:** Express.js `RequestHandler` endpoints that deserialize HTTP requests, inject them through Ports to the Use-Cases, and cast responses.

### Frontend (`/frontend`)
1. **Core Domain & Ports:** Pure TypeScript types mapped exactly to Backend schemas and an `ApiClientPort` tracking API shapes.
2. **Infrastructure Adapters:** A purely concrete `FetchApiClient` implementation using vanilla JS Fetch mapping to API backend URLs through Vite proxys. 
3. **UI Adapters:** Custom React Hooks (`useFuelEU`) managing request logic and pure stateless React Views utilizing Tailwind V4 rendering Recharts.

---

## Setup & Installation

### Prerequisite
- Node.js (v20+)
- PostgreSQL Running locally

---

## API Reference Examples

### `GET /api/routes/comparison`
Computes the exact FuelEU baseline intensity percentage difference safely.
**Query Params:** `?baselineId=x&comparisonId=y`
```json
{
  "success": true,
  "data": {
    "percentDiff": 12.4,
    "compliant": false,
    "baselineGhgIntensity": 78.0,
    "comparisonGhgIntensity": 87.6
  }
}
```

### `POST /api/pools`
Creates a pool between multiple ships dynamically averaging GHG surpluses efficiently. 
**Body:**
```json
{
  "year": 2025,
  "shipIds": ["SHIP-A", "SHIP-B"]
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "poolId": "e2f83-...",
    "totalBalance": 124.5,
    "members": [ ... ]
  }
}
```
Correct the Agent_workflow, readme, and reflection
compare page ui to be improve - Columns: ghgIntensity, % difference, compliant. All routes ka result.

(1) Routes Tab
Display table of all routes fetched from /routes
Columns: routeId, vesselType, fuelType, year, ghgIntensity (gCO₂e/MJ), fuelConsumption (t), distance (km), totalEmissions (t)
“Set Baseline” button → calls POST /routes/:routeId/baseline
Filters: vesselType, fuelType, year

(2) Compare Tab
Fetch baseline + comparison data from /routes/comparison
Use target = 89.3368 gCO₂e/MJ (2 % below 91.16)
Display:
Table with baseline vs comparison routes
Columns: ghgIntensity, % difference, compliant (✅ / ❌)
Chart (bar/line) comparing ghgIntensity values
Formula:
percentDiff = ((comparison / baseline) − 1) × 100

(3) Banking Tab
Implements Fuel EU Article 20 – Banking.
GET /compliance/cb?year=YYYY → shows current CB
POST /banking/bank → banks positive CB
POST /banking/apply → applies banked surplus to a deficit
KPIs:
cb_before, applied, cb_after
Disable actions if CB ≤ 0; show errors from API

(4) Pooling Tab
Implements Fuel EU Article 21 – Pooling.
GET /compliance/adjusted-cb?year=YYYY → fetch adjusted CB per ship
POST /pools → create pool with members
Rules:
Sum(adjustedCB) ≥ 0
Deficit ship cannot exit worse
Surplus ship cannot exit negative
UI:
List members with before/after CBs
Pool Sum indicator (red/green)
Disable “Create Pool” if invalid