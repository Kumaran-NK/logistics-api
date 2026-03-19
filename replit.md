# Workspace

## Overview

AI-Driven Logistics Optimization Platform — a hackathon prototype demonstrating microservices architecture, logistics intelligence, and real-time simulation. All AI responses are mocked.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, Recharts, React Query, Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (microservices backend)
│   └── logistics-dashboard/ # React frontend (Logistics Control Tower UI)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Microservices Architecture

All services run as Express routers within a single Node.js process:

1. **Shipment Service** (`/api/shipments`) — CRUD shipments + timeline events
2. **Route Optimization Service** (`/api/routes`) — Mock AI route optimization
3. **Inventory Service** (`/api/inventory`) — Warehouse stock + demand predictions
4. **Fleet/Driver Service** (`/api/drivers`, `/api/fleet`) — Drivers, trucks, simulated GPS
5. **Analytics Service** (`/api/analytics/*`) — KPIs, fleet utilization, demand trends
6. **Event Stream Service** (`/api/events/latest`) — Simulated real-time logistics events

## Frontend Pages

- **Command Center (Dashboard)** — KPI cards, live events feed (polls 5s), AI optimized routes
- **Active Shipments** — Shipment table, status timeline, create form
- **Fleet Telemetry** — Truck cards with live GPS simulation (polls 5s), fuel/speed indicators
- **Supply Cache (Inventory)** — Warehouse stock, AI demand predictions, reorder alerts
- **Intelligence (Analytics)** — Delivery trends, fleet utilization charts, demand predictions

## Database Schema

- `shipments` + `shipment_events` — Shipment lifecycle
- `routes` — Optimized route records
- `products` + `warehouse_stock` — Inventory
- `drivers` + `trucks` + `locations` — Fleet

## Mock AI Behavior

- Route optimization: randomized distance/time/traffic + fuel savings %
- Demand prediction: weighted random levels (LOW/MEDIUM/HIGH/CRITICAL)
- Analytics KPIs: derived from DB data + random variance
- Events: timer-based event generation every 4 seconds
- GPS: truck locations jitter every 5 seconds to simulate movement

## Running

Both services start automatically via workflows:
- API Server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/logistics-dashboard run dev`

Database push: `pnpm --filter @workspace/db run push`
Codegen: `pnpm --filter @workspace/api-spec run codegen`
