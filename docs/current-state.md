# Current State

Last known working milestone: **real Docker container data is visible in the Figma-designed Containers UI**.

## Repository

- GitHub repository: `ppdev28/SCP`
- Active branch: `feature/project-foundation`
- The developer also has a local checkout on the Ubuntu server at `~/proyectos/SCP`.
- GitHub authentication from the server uses SSH.
- The JavaScript package manager is pnpm.

## Frontend

Stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide
- Recharts
- pnpm

The frontend lives in `frontend/`.

The UI originated in Figma Make and has been brought into the repository. It contains route-level views, reusable components, shared types, UI data and utility code.

The Containers screen has been connected to the SCP API rather than relying on its original mock container list.

The Vite development server proxies `/api` requests to the local backend on port `8080`.

Known frontend validation command:

```bash
cd ~/proyectos/SCP/frontend
pnpm install
pnpm build
pnpm dev --host 0.0.0.0
```

The build currently succeeds. Vite may report a chunk-size warning for the main JavaScript bundle; this is not currently a release blocker.

## Backend

Stack:

- Go
- HTTP API
- Moby Docker client

The backend lives in `backend/`.

The API runs on `:8080`.

The backend can connect to the Docker Engine on the Ubuntu host through the normal Docker environment/local Unix socket.

The health endpoint currently works:

```text
GET /api/v1/health
```

Expected shape:

```json
{"docker":"available","status":"ok"}
```

The containers endpoint currently works:

```text
GET /api/v1/containers
```

It returns real Docker containers with fields including IDs, names, images, state/status, creation time, published ports and networks.

The frontend currently adapts this API response to the UI's container model. Values not exposed by the backend are not fabricated.

## Real integration environment

The primary test host is Ubuntu Server with Docker installed directly on the host, not Docker Desktop.

The developer has a non-trivial real Docker environment containing many containers. Examples seen during development included:

- transmission
- filebrowser
- pairdrop
- Arcane
- homepage
- big-bear-dockhand
- adminer
- cloudbeaver
- Ollama
- big-bear-portainer
- prowlarr
- CouchDB
- radarr
- big-bear-dozzle
- firefly
- flaresolverr
- big-bear-btop
- convertx

Do not hard-code this list. It changes over time and exists only as evidence that the real integration environment is useful for testing.

The developer's Mac and mobile phone can reach the server through Tailscale. This is useful for responsive/mobile testing and remote access testing.

## What has been proven

The following path is working:

```text
Browser
  -> React/Vite UI
  -> /api proxy
  -> Go SCP API :8080
  -> Docker Engine
  -> real containers
```

The Containers view now displays real containers from the server.

## What is not finished

Container lifecycle actions are not yet fully wired to Docker as a complete production workflow. The next milestone is to implement real container actions such as start, stop and restart through the Go API and connect them to the existing UI.

CPU, memory, restart count and other richer operational data may still require additional backend endpoints/inspection/metrics work. Do not fake these values.

Authentication, authorization, audit logging, production deployment, multi-host support and broader infrastructure integrations are future work.

## Important historical issue

The project originally had a Docker SDK compatibility problem. The backend was migrated to the Moby client dependency set and `go mod tidy` produced the required dependency graph. The resulting backend builds/runs successfully.

Do not revert to the old incompatible Docker client dependency merely to simplify imports.
