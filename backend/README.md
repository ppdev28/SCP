# SCP backend

The backend is a small Go HTTP API that exposes Server Control Center capabilities without leaking Docker Engine details into the frontend.

## Local development

The API uses Docker's standard environment configuration. On a Linux host with Docker installed directly, the Docker Unix socket is used automatically by the Docker SDK.

```bash
cd backend
go mod tidy
go run ./cmd/scp-api
```

The default API address is `http://localhost:8082`.

Useful endpoints:

- `GET /api/v1/health`
- `GET /api/v1/containers`
- `GET /api/v1/containers/:id`
- `POST /api/v1/containers/:id/start`
- `POST /api/v1/containers/:id/stop`
- `POST /api/v1/containers/:id/restart`
- `GET /api/v1/terminal/ws`

Set `SCP_PORT` to change the HTTP port.

## Web terminal

The terminal endpoint creates a real Unix PTY and launches the server user's login shell. Browser input and PTY output are streamed over a persistent WebSocket. `TERM=xterm-256color` and the server user's normal environment are inherited.

Set `SCP_WEB_ORIGIN` to the exact allowed browser origin (or a comma-separated list) when CoreOps is not running from `http://localhost:5173`. The WebSocket rejects requests without a matching `Origin` header.

The terminal intentionally does not expose an HTTP command-execution endpoint. Commands are executed only inside the persistent PTY session, using the operating-system permissions of the CoreOps process user.

## Security

The backend is intentionally designed to talk to Docker through the local Unix socket rather than exposing Docker Engine's TCP API. Access to the Docker socket is highly privileged and must be protected at the host level.

The terminal is equally privileged: it can execute anything permitted to the OS account running CoreOps. The current project does not yet contain a real authentication/authorization subsystem, so the WebSocket currently provides origin protection and random session IDs but **must not be considered an authenticated remote-access boundary**. Add CoreOps authentication/authorization before exposing the terminal beyond a trusted development/private network.

For the first integration, SCP is expected to run on the same Ubuntu host as Docker and be reachable remotely through the user's private network (for example Tailscale). Authentication and authorization will be added before SCP is exposed beyond a trusted development network.
