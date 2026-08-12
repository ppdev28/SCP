# Architecture

## Current stage

SCP is being built in vertical slices. The frontend foundation is established first, while infrastructure integrations remain behind service/repository boundaries.

```text
React UI
   |
   v
Application services / repositories
   |
   +---- mock data (development)
   |
   +---- HTTP / WebSocket API (production)
                 |
                 v
              Go backend
                 |
       +---------+---------+---------+
       |                   |         |
     Docker             Linux    Metrics   Network
```

## Frontend boundaries

- `components/` contains reusable visual components.
- `pages/` contains route-level screens.
- `services/` contains API and repository boundaries.
- `data/mock/` contains deterministic development data.
- `types/` contains domain models shared by UI and services.

## Backend direction

The backend will eventually expose APIs for Docker containers, system services, storage, networking, logs, metrics, security and updates. WebSockets will be considered for streaming logs, terminal sessions and live metrics.

The UI should not directly depend on Docker Engine APIs or Linux implementation details.
