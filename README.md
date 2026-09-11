# Server Control Center

Server Control Center (SCP) is a self-hosted infrastructure control panel inspired by Cockpit and Portainer, with the goal of becoming a unified operational tool for DevOps, Sysadmin and Cloud engineering workflows.

## Project structure

- `frontend/` — React + TypeScript web application.
- `backend/` — Go API and host/infrastructure integrations.
- `docs/` — architecture and product documentation.

## Frontend

The frontend uses Vite, React, TypeScript, Tailwind CSS, Lucide and Recharts. The package manager is pnpm.

```bash
cd frontend
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
```

## Backend

The first backend vertical slice is a Go HTTP API for Docker container discovery and lifecycle operations.

```bash
cd backend
go mod tidy
go run ./cmd/scp-api
```

By default the API listens on `:8080` and connects to Docker using the standard Docker environment, including the local Unix socket on a normal Linux Docker host.

## Development principles

- Keep the UI independent from infrastructure implementations.
- Keep infrastructure access behind backend/domain boundaries.
- Prefer reusable UI components and stable API contracts that follow the product UI.
- Build functionality in vertical slices against real infrastructure when practical.
- Treat security, least privilege, authentication, authorization and auditability as product requirements rather than afterthoughts.
