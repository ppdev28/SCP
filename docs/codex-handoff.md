# Codex Handoff

This file is the short operational handoff for continuing SCP work in Codex without losing the context of the current development conversation.

## Where we are

The project has moved from a Figma-only prototype to a working first vertical slice.

The Figma Make design for **Server Control Center Dashboard** was used as the visual basis for the application. The design is intentionally being preserved while real backend capabilities are added behind it.

The repository is:

```text
https://github.com/ppdev28/SCP
```

The active development branch is:

```text
feature/project-foundation
```

The latest important milestone is:

> The Containers view successfully displays real containers from the developer's Ubuntu Server Docker Engine through the SCP Go API.

## Current architecture

```text
                         private network / Tailscale
                                  |
Browser / mobile -----------------+
       |
       v
React + TypeScript + Vite
       |
       | /api/* via Vite dev proxy
       v
Go SCP API :8080
       |
       v
Docker client / infrastructure adapters
       |
       v
Docker Engine on Ubuntu Server
       |
       v
real containers
```

The browser must never talk directly to Docker Engine.

## Current working endpoints

```text
GET /api/v1/health
GET /api/v1/containers
```

Health returns Docker availability and API status.

Containers returns real Docker container information including ID, name, image, state/status, creation timestamp, ports and networks.

## Current frontend behavior

The Containers screen:

- calls the SCP API rather than using Figma mock data;
- adapts API data into the UI model;
- shows loading and error states;
- supports retry/refresh;
- calculates container status counts from real API data;
- supports the existing UI search/filter/table/grid behavior;
- does not fabricate metrics that the backend does not expose.

## The next task

Continue from the existing Containers screen and implement **real container lifecycle actions** while preserving the existing UI.

Recommended first actions:

```text
POST /api/v1/containers/{id}/start
POST /api/v1/containers/{id}/stop
POST /api/v1/containers/{id}/restart
```

Before adding more endpoints, inspect the existing backend implementation and frontend action handlers. Reuse existing abstractions where possible.

For each lifecycle operation:

1. validate the container ID safely;
2. execute the Docker operation through the backend;
3. return a useful HTTP error when Docker rejects the operation;
4. show a clear pending state in the UI;
5. prevent accidental duplicate submissions;
6. refresh/reconcile the container state after success;
7. show a useful failure state without losing the rest of the page;
8. use confirmation for disruptive/destructive operations where appropriate.

Do not implement the operation as a frontend-only state mutation or toast simulation.

## What to do before coding

Run:

```bash
cd ~/proyectos/SCP
git status
git branch --show-current
git log --oneline -10
```

Then inspect:

```text
backend/
frontend/src/
frontend/vite.config.ts
docs/product.md
docs/current-state.md
docs/architecture.md
```

Do not assume that this document is more authoritative than the code. If code and documentation disagree, inspect the code and update the documentation after resolving the discrepancy.

## Important implementation philosophy

SCP is intended to become a genuinely useful professional DevOps/sysadmin/cloud operations tool, not an imitation of Portainer with a different skin.

Favor capabilities that compose into complete workflows:

```text
observe -> inspect -> diagnose -> act -> verify
```

For example, a container workflow should eventually let a user see status/resource impact, inspect logs/configuration, perform an action, and verify the result without jumping between unrelated applications.

Do not build a huge abstraction layer just because future Kubernetes/cloud support is possible. Build the current Linux/Docker workflow cleanly and introduce abstractions when a second implementation genuinely needs them.

## Real test environment

The Ubuntu Server has Docker installed directly on the host and contains many real containers. The developer has Tailscale on the server, Mac and mobile phone.

This environment should be used for integration testing, but changes must be made carefully because the containers are real infrastructure.

Never perform destructive operations against an arbitrary real container merely to test an API. Prefer a disposable test container when destructive behavior needs validation.

## End-of-task protocol

Before declaring a task complete:

- run relevant tests/builds;
- verify the API directly where applicable;
- verify the browser behavior where applicable;
- inspect `git diff` and `git status`;
- avoid unrelated modifications;
- update documentation if the implementation state changed materially;
- create a focused commit if the working convention calls for it.

When handing work back to the developer, state exactly:

1. what changed;
2. what was tested;
3. what remains;
4. the exact command(s) needed to continue locally.
