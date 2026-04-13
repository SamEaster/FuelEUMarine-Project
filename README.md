# FuelEU Maritime Compliance Platform

A full-stack compliance management system tracking shipping routes and automating the greedy resolution of greenhouse gas (GHG) compliance pools.

## 🏗 Architecture Overview

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

## 🚀 Setup & Installation

### Prerequisite
- Node.js (v20+)
- PostgreSQL Running locally

### 1. Start the Backend
```bash
cd backend
npm install
npm run prisma:migrate # Apply DB migrations
npm run dev
```
> The API will bind natively to http://localhost:3000

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
> The Vite React server will bind to http://localhost:5173

---

## 📡 API Reference Examples

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
