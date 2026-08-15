package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

type API struct {
	docker *client.Client
}

type ContainerSummary struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Image     string   `json:"image"`
	State     string   `json:"state"`
	Status    string   `json:"status"`
	CreatedAt int64    `json:"createdAt"`
	Ports     []Port   `json:"ports"`
	Networks  []string `json:"networks"`
}

type Port struct {
	PrivatePort uint16 `json:"privatePort"`
	PublicPort  uint16 `json:"publicPort,omitempty"`
	Type        string `json:"type"`
	IP          string `json:"ip,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func main() {
	level := new(slog.LevelVar)
	level.Set(slog.LevelInfo)
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
	slog.SetDefault(logger)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	docker, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		logger.Error("create docker client", "error", err)
		os.Exit(1)
	}
	defer docker.Close()

	api := &API{docker: docker}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", api.health)
	mux.HandleFunc("GET /api/v1/containers", api.listContainers)
	mux.HandleFunc("GET /api/v1/containers/{id}", api.getContainer)
	mux.HandleFunc("POST /api/v1/containers/{id}/start", api.startContainer)
	mux.HandleFunc("POST /api/v1/containers/{id}/stop", api.stopContainer)
	mux.HandleFunc("POST /api/v1/containers/{id}/restart", api.restartContainer)

	port := envInt("SCP_PORT", 8080)
	server := &http.Server{
		Addr:              ":" + strconv.Itoa(port),
		Handler:           withCORS(withLogging(mux)),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()

	logger.Info("SCP API listening", "addr", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("HTTP server stopped", "error", err)
		os.Exit(1)
	}
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	if _, err := a.docker.Ping(ctx, client.PingOptions{}); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"status": "degraded", "docker": "unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "docker": "available"})
}

func (a *API) listContainers(w http.ResponseWriter, r *http.Request) {
	result, err := a.docker.ContainerList(r.Context(), client.ContainerListOptions{All: true})
	if err != nil {
		writeError(w, http.StatusBadGateway, err)
		return
	}

	containers := result.Items
	response := make([]ContainerSummary, 0, len(containers))
	for _, c := range containers {
		response = append(response, summarizeContainer(c))
	}
	writeJSON(w, http.StatusOK, response)
}

func (a *API) getContainer(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	result, err := a.docker.ContainerInspect(r.Context(), id, client.ContainerInspectOptions{})
	if err != nil {
		status := http.StatusBadGateway
		if errdefs.IsNotFound(err) {
			status = http.StatusNotFound
		}
		writeError(w, status, err)
		return
	}

	c := result.Container
	response := map[string]any{
		"id":      c.ID,
		"name":    strings.TrimPrefix(c.Name, "/"),
		"image":   c.Config.Image,
		"state":   c.State.Status,
		"created": c.Created,
		"config": map[string]any{
			"env":        c.Config.Env,
			"cmd":        c.Config.Cmd,
			"entrypoint": c.Config.Entrypoint,
			"workingDir": c.Config.WorkingDir,
		},
		"restartPolicy": c.HostConfig.RestartPolicy.Name,
		"mounts":        c.Mounts,
		"networks":      c.NetworkSettings.Networks,
		"ports":         c.NetworkSettings.Ports,
		"labels":        c.Config.Labels,
	}
	writeJSON(w, http.StatusOK, response)
}

func (a *API) startContainer(w http.ResponseWriter, r *http.Request) {
	a.containerAction(w, r, func(ctx context.Context, id string) error {
		_, err := a.docker.ContainerStart(ctx, id, client.ContainerStartOptions{})
		return err
	})
}

func (a *API) stopContainer(w http.ResponseWriter, r *http.Request) {
	a.containerAction(w, r, func(ctx context.Context, id string) error {
		_, err := a.docker.ContainerStop(ctx, id, client.ContainerStopOptions{})
		return err
	})
}

func (a *API) restartContainer(w http.ResponseWriter, r *http.Request) {
	a.containerAction(w, r, func(ctx context.Context, id string) error {
		_, err := a.docker.ContainerRestart(ctx, id, client.ContainerRestartOptions{})
		return err
	})
}

func (a *API) containerAction(w http.ResponseWriter, r *http.Request, action func(context.Context, string) error) {
	id := r.PathValue("id")
	if err := action(r.Context(), id); err != nil {
		status := http.StatusBadGateway
		if errdefs.IsNotFound(err) {
			status = http.StatusNotFound
		}
		writeError(w, status, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "id": id})
}

func summarizeContainer(c container.Summary) ContainerSummary {
	ports := make([]Port, 0, len(c.Ports))
	for _, p := range c.Ports {
		ports = append(ports, Port{PrivatePort: p.PrivatePort, PublicPort: p.PublicPort, Type: p.Type, IP: p.IP})
	}

	networks := make([]string, 0, len(c.NetworkSettings.Networks))
	for name := range c.NetworkSettings.Networks {
		networks = append(networks, name)
	}

	name := ""
	if len(c.Names) > 0 {
		name = strings.TrimPrefix(c.Names[0], "/")
	}

	return ContainerSummary{
		ID:        c.ID,
		Name:      name,
		Image:     c.Image,
		State:     c.State,
		Status:    c.Status,
		CreatedAt: c.Created,
		Ports:     ports,
		Networks:  networks,
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, ErrorResponse{Error: err.Error()})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		slog.Info("http request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(start).String())
	})
}

func envInt(name string, fallback int) int {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 || parsed > 65535 {
		return fallback
	}
	return parsed
}
