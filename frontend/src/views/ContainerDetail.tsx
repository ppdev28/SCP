import { useState } from "react";
import {
  ChevronRight,
  Square,
  RotateCw,
  Terminal,
  ScrollText,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Download,
} from "lucide-react";
import { T } from "../lib/tokens";
import { CONTAINERS, buildChartData } from "../lib/data";
import type { ConfirmDialog } from "../lib/types";
import {
  Card,
  CardHeader,
  Tabs,
  StatusBadge,
  HealthBadge,
  Btn,
  ResourceChart,
  Th,
  Td,
} from "../components/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DETAIL_TABS = [
  "Overview",
  "Logs",
  "Stats",
  "Network",
  "Volumes",
  "Environment",
  "Inspect",
];

const NGINX_LOGS = [
  {
    ts: "14:32:01.324",
    level: "notice",
    msg: 'nginx/1.25.3 started using "epoll" events module',
  },
  {
    ts: "14:32:01.325",
    level: "notice",
    msg: "built by gcc 12.2.1 20220924 — OS: Linux 6.8.0-47",
  },
  {
    ts: "14:33:10.001",
    level: "access",
    msg: '192.168.1.42 "GET / HTTP/1.1" 200 615 curl/8.4',
  },
  {
    ts: "14:35:22.882",
    level: "access",
    msg: '192.168.1.1 "GET /api/health HTTP/1.1" 200 28',
  },
  {
    ts: "14:40:01.003",
    level: "warn",
    msg: "upstream timed out (110) while reading response header from upstream: 172.17.0.5:8080",
  },
  {
    ts: "14:42:18.441",
    level: "access",
    msg: '192.168.1.42 "POST /api/upload HTTP/1.1" 413 0',
  },
  {
    ts: "14:45:00.001",
    level: "notice",
    msg: "signal 1 (SIGHUP) received, reloading configuration",
  },
  {
    ts: "14:45:00.033",
    level: "notice",
    msg: "graceful shutdown of worker processes initiated",
  },
  {
    ts: "14:45:00.042",
    level: "notice",
    msg: "start worker processes — 4 processes ready",
  },
  {
    ts: "14:48:15.221",
    level: "access",
    msg: '192.168.1.5 "GET /nextcloud/ HTTP/1.1" 301 0',
  },
  {
    ts: "14:51:02.003",
    level: "access",
    msg: '192.168.1.42 "GET /grafana/ HTTP/1.1" 200 4812',
  },
];

const INSPECT_JSON = `{
  "Id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
  "Created": "2024-01-01T10:00:00.000000000Z",
  "Path": "/docker-entrypoint.sh",
  "Args": ["nginx", "-g", "daemon off;"],
  "State": {
    "Status": "running",
    "Running": true,
    "Paused": false,
    "Restarting": false,
    "OOMKilled": false,
    "Pid": 1234,
    "ExitCode": 0,
    "StartedAt": "2024-01-01T10:00:01.000000000Z"
  },
  "Image": "sha256:abc123...",
  "Name": "/nginx",
  "RestartCount": 1,
  "HostConfig": {
    "NetworkMode": "bridge",
    "RestartPolicy": { "Name": "unless-stopped", "MaximumRetryCount": 0 },
    "PortBindings": {
      "80/tcp": [{ "HostIp": "0.0.0.0", "HostPort": "80" }],
      "443/tcp": [{ "HostIp": "0.0.0.0", "HostPort": "443" }]
    }
  },
  "NetworkSettings": {
    "IPAddress": "172.17.0.2",
    "MacAddress": "02:42:ac:11:00:02",
    "Networks": {
      "bridge": {
        "IPAddress": "172.17.0.2",
        "Gateway": "172.17.0.1"
      }
    }
  }
}`;

export default function ContainerDetail({
  onBack,
  addToast,
  onConfirm,
}: {
  onBack: () => void;
  addToast: (m: string, t: any) => void;
  onConfirm: (d: ConfirmDialog) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const [showEnv, setShowEnv] = useState(false);
  const [termLines, setTermLines] = useState<string[]>([
    "root@nginx:/# ls -la /etc/nginx/",
    "total 40",
    "drwxr-xr-x 1 root root 4096 Jan  1 10:00 .",
    "drwxr-xr-x 1 root root 4096 Jan  1 10:00 ..",
    "-rw-r--r-- 1 root root 1077 Oct 24 08:00 fastcgi.conf",
    "-rw-r--r-- 1 root root  636 Oct 24 08:00 nginx.conf",
    "drwxr-xr-x 2 root root 4096 Jan  1 10:00 conf.d",
    "drwxr-xr-x 2 root root 4096 Jan  1 10:00 sites-available",
    "drwxr-xr-x 2 root root 4096 Jan  1 10:00 sites-enabled",
    "root@nginx:/# ",
  ]);
  const [termInput, setTermInput] = useState("");
  const c = CONTAINERS[0];

  const submitTerm = () => {
    if (!termInput.trim()) return;
    setTermLines((l) => [
      ...l.slice(0, -1),
      `root@nginx:/# ${termInput}`,
      `root@nginx:/# `,
    ]);
    setTermInput("");
  };

  const netData = buildChartData(2.4, 1.8, "30m", 0.31);
  const netDataTx = buildChartData(0.8, 0.6, "30m", 0.55);

  const envVars = [
    { k: "NGINX_VERSION", v: "1.25.3", secret: false },
    { k: "NJS_VERSION", v: "0.8.2", secret: false },
    { k: "PKG_RELEASE", v: "1", secret: false },
    { k: "TZ", v: "UTC", secret: false },
    { k: "NGINX_ENTRYPOINT_QUIET_LOGS", v: "1", secret: false },
    { k: "NGINX_PORT", v: "80", secret: false },
    { k: "API_SECRET_KEY", v: "sk-prod-xxxxxxxxxxxxxx", secret: true },
  ];

  return (
    <div style={{ padding: "22px 24px", maxWidth: 1140 }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 16,
          fontSize: 12,
          color: T.textDim,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.textDim,
            fontSize: 12,
            fontFamily: "Inter,sans-serif",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T.textSub)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.textDim)}
        >
          Containers
        </button>
        <ChevronRight size={11} color={T.textDim} />
        <span
          style={{ color: T.textSub, fontFamily: "JetBrains Mono,monospace" }}
        >
          {c.name}
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 5,
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: T.text,
                fontFamily: "JetBrains Mono,monospace",
                letterSpacing: "-0.04em",
              }}
            >
              {c.name}
            </h1>
            <StatusBadge status={c.status} />
            <HealthBadge health={c.health} />
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textDim,
              fontFamily: "JetBrains Mono,monospace",
            }}
          >
            {c.image} · {c.uptime} · {c.id.slice(0, 12)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn
            onClick={() =>
              onConfirm({
                title: `Stop "${c.name}"?`,
                message:
                  "The container will be stopped. You can restart it at any time.",
                action: "Stop",
                onConfirm: () => addToast(`Stopping ${c.name}…`, "warning"),
              })
            }
            variant="danger"
            icon={<Square size={11} />}
          >
            Stop
          </Btn>
          <Btn
            onClick={() => addToast(`Restarting ${c.name}…`, "info")}
            variant="warning"
            icon={<RotateCw size={11} />}
          >
            Restart
          </Btn>
          <Btn
            onClick={() => setTab("Logs")}
            variant="secondary"
            icon={<ScrollText size={11} />}
          >
            Logs
          </Btn>
          <Btn
            onClick={() => setTab("Stats")}
            variant="secondary"
            icon={<MoreHorizontal size={11} />}
          >
            Stats
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={DETAIL_TABS} active={tab} onChange={setTab} />
      </div>

      {/* ── Overview ─────────────────────────────────────────────────── */}
      {tab === "Overview" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <CardHeader title="Container info" />
              <div>
                {[
                  { k: "Container ID", v: c.id.slice(0, 20) + "…" },
                  { k: "Image", v: c.image },
                  { k: "Platform", v: "linux/amd64" },
                  { k: "Created", v: "Jan 1, 2024 · 10:00 UTC" },
                  { k: "Ports", v: c.ports },
                  { k: "Network", v: c.networkMode },
                  { k: "IP address", v: c.ip },
                  { k: "Restart policy", v: "unless-stopped" },
                  { k: "Restart count", v: String(c.restarts) },
                ].map((row) => (
                  <div
                    key={row.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 16px",
                      borderBottom: `1px solid ${T.borderMuted}`,
                    }}
                  >
                    <span style={{ fontSize: 11, color: T.textDim }}>
                      {row.k}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.textSub,
                        fontFamily: "JetBrains Mono,monospace",
                        textAlign: "right",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <CardHeader title="Resource usage" />
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                }}
              >
                {[
                  {
                    label: "CPU",
                    value: c.cpu,
                    pct: c.cpuNum,
                    color: T.accent,
                  },
                  {
                    label: "Memory",
                    value: `${c.memory} / ${c.memLimit}`,
                    pct: (c.memNum / 512) * 100,
                    color: "#a78bfa",
                  },
                  { label: "Net I/O", value: c.net, pct: null, color: T.green },
                  {
                    label: "Block",
                    value: "↓ 12 MB  ↑ 4 MB",
                    pct: null,
                    color: T.yellow,
                  },
                ].map((r) => (
                  <div key={r.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: T.textDim }}>
                        {r.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: T.textSub,
                          fontFamily: "JetBrains Mono,monospace",
                        }}
                      >
                        {r.value}
                      </span>
                    </div>
                    {r.pct !== null && (
                      <div
                        style={{
                          height: 3,
                          background: T.overlay,
                          borderRadius: 2,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, r.pct)}%`,
                            background: r.color,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Mounts" />
              <div
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  {
                    src: "/srv/data/nginx",
                    dst: "/var/www/html",
                    mode: "rw",
                    type: "bind",
                  },
                  {
                    src: "/etc/nginx/nginx.conf",
                    dst: "/etc/nginx/nginx.conf",
                    mode: "ro",
                    type: "bind",
                  },
                  {
                    src: "nginx_certs",
                    dst: "/etc/ssl/certs",
                    mode: "ro",
                    type: "volume",
                  },
                ].map((v, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "9px 12px",
                      background: T.bg,
                      borderRadius: 7,
                      fontSize: 11,
                      fontFamily: "JetBrains Mono,monospace",
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ color: T.textDim, marginBottom: 2 }}>
                      {v.src}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ color: T.textDim }}>→</span>
                      <span style={{ color: T.textSub, flex: 1 }}>{v.dst}</span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background:
                            v.mode === "ro" ? `${T.yellow}20` : `${T.green}20`,
                          color: v.mode === "ro" ? T.yellow : T.green,
                        }}
                      >
                        {v.mode}
                      </span>
                      <span style={{ fontSize: 10, color: T.textDim }}>
                        {v.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Logs ─────────────────────────────────────────────────────── */}
      {tab === "Logs" && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: `1px solid ${T.border}`,
              flexWrap: "wrap",
            }}
          >
            <input
              placeholder="Search logs…"
              style={{
                flex: 1,
                minWidth: 180,
                height: 30,
                padding: "0 10px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.text,
                fontSize: 12,
                outline: "none",
                fontFamily: "Inter,sans-serif",
              }}
            />
            <select
              style={{
                height: 30,
                padding: "0 10px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.text,
                fontSize: 12,
                outline: "none",
                fontFamily: "Inter,sans-serif",
              }}
            >
              {["All levels", "INFO", "WARN", "ERROR", "notice"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <Btn variant="ghost" size="xs" icon={<Download size={11} />}>
              Download
            </Btn>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: T.accent }}
              />
              <span style={{ fontSize: 11, color: T.textDim }}>Follow</span>
            </label>
          </div>
          <div
            style={{
              background: T.bg,
              padding: 16,
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 11.5,
              lineHeight: 1.9,
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            {NGINX_LOGS.map((line, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 14, padding: "1px 0" }}
              >
                <span
                  style={{
                    color: T.textDim,
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  {line.ts}
                </span>
                <span
                  style={{
                    width: 50,
                    flexShrink: 0,
                    fontWeight: 600,
                    color:
                      line.level === "warn"
                        ? T.yellow
                        : line.level === "error"
                          ? T.red
                          : line.level === "access"
                            ? T.green
                            : T.textDim,
                  }}
                >
                  [{line.level}]
                </span>
                <span style={{ color: T.textSub }}>{line.msg}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      {tab === "Stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Stat tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
            }}
          >
            {[
              { label: "CPU Usage", value: "0.4%", sub: "of 8 cores" },
              {
                label: "Memory",
                value: "18 MB",
                sub: `of ${c.memLimit} limit`,
              },
              {
                label: "Net RX",
                value: "1.2 MB/s",
                sub: "since container start",
              },
              {
                label: "Net TX",
                value: "340 KB/s",
                sub: "since container start",
              },
              {
                label: "Block Read",
                value: "12 MB",
                sub: "since container start",
              },
              {
                label: "Block Write",
                value: "4 MB",
                sub: "since container start",
              },
            ].map((s) => (
              <Card key={s.label} style={{ padding: "14px 16px" }}>
                <div
                  style={{
                    fontSize: 10,
                    color: T.textDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 5,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: T.text,
                    fontFamily: "JetBrains Mono,monospace",
                    letterSpacing: "-0.02em",
                    marginBottom: 2,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: T.textDim }}>{s.sub}</div>
              </Card>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <ResourceChart
              label="CPU Usage"
              color={T.accent}
              base={0.4}
              noise={0.3}
              seed={0.42}
            />
            <ResourceChart
              label="Memory Usage"
              color="#a78bfa"
              base={18}
              noise={3}
              seed={0.73}
              unit=" MB"
            />
          </div>
        </div>
      )}

      {/* ── Network ───────────────────────────────────────────────────── */}
      {tab === "Network" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Card>
            <CardHeader title="Network interfaces" />
            <div>
              {[
                { k: "Network mode", v: c.networkMode },
                { k: "IP address", v: c.ip },
                { k: "MAC address", v: c.mac },
                { k: "Gateway", v: "172.17.0.1" },
                { k: "Subnet", v: "172.17.0.0/16" },
              ].map((row) => (
                <div
                  key={row.k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 16px",
                    borderBottom: `1px solid ${T.borderMuted}`,
                  }}
                >
                  <span style={{ fontSize: 11, color: T.textDim }}>
                    {row.k}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: T.textSub,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Published ports" />
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: T.bg }}>
                  <Th mono>Host port</Th>
                  <Th mono>Container port</Th>
                  <Th>Protocol</Th>
                  <Th>Address</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["80", "80/tcp", "TCP", "0.0.0.0"],
                  ["443", "443/tcp", "TCP", "0.0.0.0"],
                ].map(([hp, cp, pr, addr]) => (
                  <tr key={hp}>
                    <Td mono dim>
                      {hp}
                    </Td>
                    <Td mono dim>
                      {cp}
                    </Td>
                    <Td dim>{pr}</Td>
                    <Td mono dim>
                      {addr}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Volumes ───────────────────────────────────────────────────── */}
      {tab === "Volumes" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                <Th>Source</Th>
                <Th>Destination</Th>
                <Th>Mode</Th>
                <Th>Type</Th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  src: "/srv/data/nginx",
                  dst: "/var/www/html",
                  mode: "rw",
                  type: "bind",
                },
                {
                  src: "/etc/nginx/nginx.conf",
                  dst: "/etc/nginx/nginx.conf",
                  mode: "ro",
                  type: "bind",
                },
                {
                  src: "nginx_certs",
                  dst: "/etc/ssl/certs",
                  mode: "ro",
                  type: "volume",
                },
              ].map((v, i) => (
                <tr key={i}>
                  <Td mono dim>
                    {v.src}
                  </Td>
                  <Td mono dim>
                    {v.dst}
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background:
                          v.mode === "ro" ? `${T.yellow}18` : `${T.green}18`,
                        color: v.mode === "ro" ? T.yellow : T.green,
                      }}
                    >
                      {v.mode}
                    </span>
                  </Td>
                  <Td dim>{v.type}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── Environment ───────────────────────────────────────────────── */}
      {tab === "Environment" && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
              Environment variables
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={() => setShowEnv((v) => !v)}
                variant="ghost"
                size="xs"
                icon={showEnv ? <EyeOff size={11} /> : <Eye size={11} />}
              >
                {showEnv ? "Hide values" : "Show values"}
              </Btn>
              <Btn variant="ghost" size="xs" icon={<Copy size={11} />}>
                Copy all
              </Btn>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                <Th>Variable</Th>
                <Th>Value</Th>
              </tr>
            </thead>
            <tbody>
              {envVars.map((e) => (
                <tr key={e.k}>
                  <Td>
                    <span
                      style={{
                        color: T.accent,
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 11,
                      }}
                    >
                      {e.k}
                    </span>
                  </Td>
                  <Td mono dim>
                    {e.secret && !showEnv ? (
                      <span
                        style={{ letterSpacing: "0.1em", color: T.textDim }}
                      >
                        {"•".repeat(16)}
                      </span>
                    ) : (
                      e.v
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── Inspect ───────────────────────────────────────────────────── */}
      {tab === "Inspect" && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
              Container inspect
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" size="xs" icon={<Copy size={11} />}>
                Copy JSON
              </Btn>
              <Btn variant="ghost" size="xs" icon={<Download size={11} />}>
                Download
              </Btn>
            </div>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "16px",
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 11.5,
              lineHeight: 1.7,
              color: T.textSub,
              background: T.bg,
              overflowX: "auto",
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            {INSPECT_JSON}
          </pre>
        </Card>
      )}
    </div>
  );
}
