# FuelEU Maritime Compliance Platform

A Node.js + TypeScript backend for FuelEU Maritime regulation compliance, built with **strict hexagonal architecture**.

## Tech Stack

- **Runtime:** Node.js (v24+)
- **Language:** TypeScript (strict mode)
- **Framework:** Express 5
- **ORM:** Prisma 7 (with `@prisma/adapter-pg`)
- **Database:** PostgreSQL
- **Linting:** ESLint + Prettier

## Project Structure

```
src/
├── core/                          # Pure domain — NO framework dependencies
│   ├── domain/                    # Entities (Route, ShipCompliance, BankEntry, Pool, PoolMember)
│   ├── application/               # Use-cases (business logic — to be added)
│   └── ports/                     # Repository interfaces (contracts)
├── adapters/
│   ├── inbound/http/              # Express route handlers (controllers)
│   └── outbound/postgres/         # Prisma repository implementations
├── infrastructure/
│   ├── db/                        # Prisma client singleton + connection
│   └── server/                    # Express app factory + server bootstrap
├── shared/                        # Cross-cutting utilities (error classes)
└── generated/prisma/              # Auto-generated Prisma client (gitignored)
```

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL running locally
- A database named `fueleu_maritime`

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed

# Start dev server
npm run dev
```

### Available Scripts

| Script               | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start dev server with hot-reload   |
| `npm run build`      | Compile TypeScript to `dist/`      |
| `npm start`          | Run compiled production build      |
| `npm run lint`       | Run ESLint                         |
| `npm run format`     | Format code with Prettier          |
| `npm run prisma:generate` | Generate Prisma client        |
| `npm run prisma:migrate`  | Run database migrations       |
| `npm run prisma:seed`     | Seed the database             |
| `npm run prisma:studio`   | Open Prisma Studio            |

### API Endpoints

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/health`    | Health check             |
| GET    | `/api/routes`    | List all routes          |
| GET    | `/api/routes/:id`| Get route by ID          |

## Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)**:

- **Core** contains domain entities and port interfaces — zero framework dependencies
- **Adapters** implement the ports (Prisma for outbound DB, Express for inbound HTTP)
- **Infrastructure** wires everything together (server bootstrap, DB connection)
- **Business logic** lives in use-cases (application layer), NOT in controllers

## Database Schema

| Table             | Description                                  |
| ----------------- | -------------------------------------------- |
| `routes`          | Voyage records with GHG emissions data       |
| `ship_compliance` | Ship compliance balance per year             |
| `bank_entries`    | Banked surplus/deficit entries               |
| `pools`           | Compliance pools                             |
| `pool_members`    | Ships participating in pools                 |
