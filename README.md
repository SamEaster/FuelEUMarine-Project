# FuelEU Maritime Compliance Platform

A full-stack compliance management system tracking shipping routes and automating the greedy resolution of greenhouse gas (GHG) compliance pools.

## Architecture Overview

This project uses **Hexagonal Architecture (Ports & Adapters)** on both the backend and frontend.

### Backend (`/backend`)
1. **Core Domain & Application Layer:** Pure TypeScript for defining the data structures(ShipCompliance, BankEntry, Pool, Route). Contains the FuelEU mathematical implementation, routing invariants, and dynamic pooling.
2. **Ports:** Interfaces defining Data Access objects
3. **Adapters:**
**Inbound Adapters:** Express.js `RequestHandler` endpoints that receive HTTP requests, inject them through Ports to the Use-Cases, and return responses.
**Outbound Adapters:** Concrete `Prisma*Repository` implementations handling Postgres serialization safely.

### Frontend (`/frontend`)
1. **Core Domain & Ports:** Pure TypeScript types mapped exactly to Backend schemas and an `ApiClientPort` tracking API shapes.
2. **Infrastructure Adapters:** A purely concrete `FetchApiClient` implementation using vanilla JS Fetch mapping to API backend URLs through Vite proxys. 
3. **UI Adapters:** Custom React Hooks managing request logic and pure stateless React Views utilizing Tailwind V4 rendering Recharts.

---

## Setup & Installation

### Prerequisite
- Node.js (v20+)
- PostgreSQL Running locally through docker

### Run Instructions:
Ensure postgres is running locally on localhost:5432.
# backend
- npm install
- npm prisma db push
- npm run prisma:generate
- npm run prisma:seed
- npm run dev

# frontend
- npm install
- npm run dev

---

## How to execute tests
# backend
- npm run test

## Images
![Image 3](https://github.com/SamEaster/FuelEUMarine-Project/blob/main/images/img3)
Routes Page
![Image 4](https://github.com/SamEaster/FuelEUMarine-Project/blob/main/images/img4)/
Comparision Page
![Image2](https://github.com/SamEaster/FuelEUMarine-Project/blob/main/images/img2)/
Banking Page
![Image1](https://github.com/SamEaster/FuelEUMarine-Project/blob/main/images/img1)
Pooling Page
