import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  LogIn,
  MemoryStick,
  MonitorDot,
  Plus,
  RefreshCw,
  RotateCw,
  ScrollText,
  Terminal,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import {
  getContainers,
  getHost,
  getLogs,
  getMonitoring,
  getNetwork,
  getStorage,
  getUpdates,
} from "../lib/api";
import type {
  Container,
  HostOverview,
  NetworkOverview,
  StorageOverview,
  UpdatePackage,
} from "../lib/types";
import type { MonitoringOverview } from "../lib/monitoring";
import { T } from "../lib/tokens";
import {
  Btn,
  Card,
  CardHeader,
  QuickAction,
  Sparkline,
} from "../components/ui";
import type { View, ToastType } from "../lib/types";

type DashboardProps = {
  onNavigate: (view: View) => void;
  addToast: (message: string, type: ToastType) => void;
};

type HistoryPoint = {
  time: string;
  cpu: number;
  memory: number;
};

type ActivityEntry = {
  timestamp: string;
  level: string;
  source: string;
  message: string;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatRate(bytesPerSecond: number): string {
  if (bytesPerSecond >= 1024 ** 3)
    return `${(bytesPerSecond / 1024 ** 3).toFixed(1)} GB/s`;
  if (bytesPerSecond >= 1024 ** 2)
    return `${(bytesPerSecond / 1024 ** 2).toFixed(1)} MB/s`;
  if (bytesPerSecond >= 1024)
    return `${(bytesPerSecond / 1024).toFixed(0)} KB/s`;
  return `${Math.max(0, Math.round(bytesPerSecond))} B/s`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}h`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function relativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} d ago`;
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  color,
  spark,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  color: string;
  spark?: number[];
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.hover : T.raised,
        border: `1px solid ${hovered ? T.borderStrong : T.border}`,
        borderRadius: 9,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.textDim, display: "flex" }}>{icon}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.textDim,
              textTransform: "uppercase",
              letterSpacing: ".07em",
            }}
          >
            {label}
          </span>
        </div>
        {spark && <Sparkline data={spark} color={color} w={60} h={24} />}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: T.text,
          fontFamily: "JetBrains Mono,monospace",
          letterSpacing: "-.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {children}
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: T.textDim,
            fontFamily: "JetBrains Mono,monospace",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function HistoryChart({
  label,
  color,
  data,
  valueKey,
}: {
  label: string;
  color: string;
  data: HistoryPoint[];
  valueKey: "cpu" | "memory";
}) {
  const points = data.length ? data : [{ time: "", cpu: 0, memory: 0 }];
  const width = 720;
  const height = 150;
  const padding = { top: 12, right: 10, bottom: 24, left: 10 };
  const values = points.map((point) => point[valueKey]);
  const min = Math.max(0, Math.min(...values) - 5);
  const max = Math.min(100, Math.max(...values) + 5);
  const range = Math.max(1, max - min);
  const path = points
    .map((point, index) => {
      const x =
        padding.left +
        (index / Math.max(1, points.length - 1)) *
          (width - padding.left - padding.right);
      const y =
        padding.top +
        (1 - (point[valueKey] - min) / range) *
          (height - padding.top - padding.bottom);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader
        title={label}
        action={<span style={{ fontSize: 10, color: T.textDim }}>5m</span>}
      />
      <div style={{ padding: "8px 14px 12px" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: 170, display: "block" }}
        >
          {[0, 1, 2, 3].map((line) => {
            const y =
              padding.top +
              (line / 3) * (height - padding.top - padding.bottom);
            return (
              <line
                key={line}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke={T.borderMuted}
                strokeDasharray="2 5"
              />
            );
          })}
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: T.textDim,
            fontFamily: "JetBrains Mono,monospace",
          }}
        >
          <span>now</span>
          <span>
            {data.length ? `${data.length} samples` : "waiting for data"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({
  entry,
  last,
}: {
  entry: ActivityEntry;
  last: boolean;
}) {
  const icon = entry.level.toLowerCase().includes("error")
    ? AlertTriangle
    : entry.source.toLowerCase().includes("ssh")
      ? LogIn
      : entry.source.toLowerCase().includes("docker")
        ? RotateCw
        : Database;
  const Icon = icon;
  const color = entry.level.toLowerCase().includes("error")
    ? T.red
    : entry.level.toLowerCase().includes("warn")
      ? T.yellow
      : T.green;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 14px",
        borderBottom: last ? "none" : `1px solid ${T.borderMuted}`,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          flexShrink: 0,
          background: `${color}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <Icon size={11} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>
            {entry.message}
          </span>
          <span
            style={{
              fontSize: 10,
              color: T.textDim,
              flexShrink: 0,
              fontFamily: "JetBrains Mono,monospace",
            }}
          >
            {relativeTime(entry.timestamp)}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: T.textDim,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.source}
        </div>
      </div>
    </div>
  );
}

export default function DashboardView({
  onNavigate,
  addToast,
}: DashboardProps) {
  const [host, setHost] = useState<HostOverview | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringOverview | null>(null);
  const [storage, setStorage] = useState<StorageOverview | null>(null);
  const [network, setNetwork] = useState<NetworkOverview | null>(null);
  const [updates, setUpdates] = useState<UpdatePackage[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastNetwork, setLastNetwork] = useState<{
    timestamp: number;
    rx: number;
    tx: number;
  } | null>(null);
  const [networkRate, setNetworkRate] = useState({ rx: 0, tx: 0 });
  const mounted = useRef(true);

  const refresh = useCallback(
    async (initial = false) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      const results = await Promise.allSettled([
        getHost(),
        getContainers(),
        getMonitoring(),
        getStorage(),
        getNetwork(),
        getLogs(),
        getUpdates(),
      ]);
      if (!mounted.current) return;
      const [
        hostResult,
        containersResult,
        monitoringResult,
        storageResult,
        networkResult,
        logsResult,
        updatesResult,
      ] = results;
      if (hostResult.status === "fulfilled") setHost(hostResult.value);
      if (containersResult.status === "fulfilled")
        setContainers(containersResult.value);
      if (monitoringResult.status === "fulfilled") {
        setMonitoring(monitoringResult.value);
        const sample = monitoringResult.value.host;
        const timestamp = monitoringResult.value.timestamp;
        if (lastNetwork) {
          const elapsed = Math.max(1, timestamp - lastNetwork.timestamp) / 1000;
          setNetworkRate({
            rx: Math.max(0, sample.netRxBytes - lastNetwork.rx) / elapsed,
            tx: Math.max(0, sample.netTxBytes - lastNetwork.tx) / elapsed,
          });
        }
        setLastNetwork({
          timestamp,
          rx: sample.netRxBytes,
          tx: sample.netTxBytes,
        });
        setHistory((previous) =>
          [
            ...previous,
            {
              time: String(timestamp),
              cpu: sample.cpuUsagePercent,
              memory: sample.memoryUsagePercent,
            },
          ].slice(-30),
        );
      }
      if (storageResult.status === "fulfilled") setStorage(storageResult.value);
      if (networkResult.status === "fulfilled") setNetwork(networkResult.value);
      if (logsResult.status === "fulfilled")
        setActivity(logsResult.value.entries.slice(-5).reverse());
      if (updatesResult.status === "fulfilled")
        setUpdates(updatesResult.value.updates);
      if (results.every((result) => result.status === "rejected"))
        addToast("Unable to load dashboard data", "error");
      setLoading(false);
      setRefreshing(false);
    },
    [addToast, lastNetwork],
  );

  useEffect(() => {
    mounted.current = true;
    void refresh(true);
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  const issues = useMemo(
    () =>
      containers.filter(
        (container) =>
          container.status === "restarting" ||
          container.status === "exited" ||
          container.health === "unhealthy",
      ),
    [containers],
  );
  const runningContainers = containers.filter(
    (container) => container.status === "running",
  ).length;
  const unhealthyContainers = containers.filter(
    (container) =>
      container.health === "unhealthy" || container.status === "restarting",
  ).length;
  const containerMetrics = new Map(
    (monitoring?.containers ?? []).map((container) => [
      container.name.replace(/^\//, ""),
      container,
    ]),
  );
  const memoryTotal = host?.memory.totalBytes ?? 0;
  const memoryUsed = host?.memory.usedBytes ?? 0;
  const storageUsed = storage?.usedBytes ?? 0;
  const storageTotal = storage?.totalCapacityBytes ?? 0;
  const storagePercent = storage?.usagePercent ?? 0;
  const cpuHistory = history.map((point) => point.cpu);
  const memoryHistory = history.map((point) => point.memory);
  const primaryInterface =
    network?.interfaces.find((item) => item.state.toLowerCase() === "up") ??
    network?.interfaces[0];

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1400, width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>
            Dashboard
          </div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
            Live overview of your server
          </div>
        </div>
        <Btn
          variant="secondary"
          size="sm"
          disabled={refreshing}
          onClick={() => void refresh()}
          icon={<RefreshCw size={12} />}
        >
          Refresh
        </Btn>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: issues.length ? `${T.yellow}0d` : `${T.green}0b`,
            border: `1px solid ${issues.length ? `${T.yellow}35` : `${T.green}28`}`,
            borderRadius: 8,
          }}
        >
          {issues.length ? (
            <AlertTriangle size={13} color={T.yellow} />
          ) : (
            <CheckCircle2 size={13} color={T.green} />
          )}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: issues.length ? T.yellow : T.green,
            }}
          >
            {issues.length
              ? `${issues.length} issue${issues.length === 1 ? "" : "s"} require${issues.length === 1 ? "s" : ""} attention`
              : "All systems operational"}
          </span>
          {issues.length > 0 && (
            <span style={{ fontSize: 11, color: T.textDim }}>
              — {issues[0].name}
            </span>
          )}
        </div>
      </div>

      <div
        className="dash-metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <MetricCard
          label="CPU"
          value={host ? `${Math.round(host.cpu.usagePercent)}%` : "—"}
          sub={
            host
              ? `${host.cpu.cores} cores · load ${host.load.load1.toFixed(2)}`
              : "Loading…"
          }
          icon={<Cpu size={13} />}
          color={T.accent}
          spark={cpuHistory.length ? cpuHistory : undefined}
        />
        <MetricCard
          label="Memory"
          value={host ? `${Math.round(host.memory.usagePercent)}%` : "—"}
          sub={
            host
              ? `${formatBytes(memoryUsed)} / ${formatBytes(memoryTotal)}`
              : "Loading…"
          }
          icon={<MemoryStick size={13} />}
          color={T.purple}
          spark={memoryHistory.length ? memoryHistory : undefined}
        />
        <MetricCard
          label="Storage"
          value={storage ? `${Math.round(storagePercent)}%` : "—"}
          sub={
            storage
              ? `${formatBytes(storageUsed)} / ${formatBytes(storageTotal)}`
              : "Loading…"
          }
          icon={<HardDrive size={13} />}
          color={T.yellow}
        >
          <div
            style={{
              height: 3,
              background: T.bg,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, storagePercent)}%`,
                background:
                  storagePercent > 85
                    ? T.red
                    : storagePercent > 70
                      ? T.yellow
                      : T.yellow,
                borderRadius: 2,
              }}
            />
          </div>
        </MetricCard>
        <MetricCard
          label="Network"
          value={formatRate(networkRate.rx)}
          sub={
            primaryInterface
              ? `${primaryInterface.name} · ${primaryInterface.speed}`
              : "Waiting for sample…"
          }
          icon={<Wifi size={13} />}
          color={T.green}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span
              style={{
                fontSize: 11,
                color: T.green,
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              ↓ {formatRate(networkRate.rx)}
            </span>
            <span
              style={{
                fontSize: 11,
                color: T.textSub,
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              ↑ {formatRate(networkRate.tx)}
            </span>
          </div>
        </MetricCard>
      </div>

      <div
        className="dash-charts"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 260px",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <HistoryChart
          label="CPU Usage"
          color={T.accent}
          data={history}
          valueKey="cpu"
        />
        <HistoryChart
          label="Memory Usage"
          color={T.purple}
          data={history}
          valueKey="memory"
        />
        <div onClick={() => onNavigate("host")} style={{ cursor: "pointer" }}>
          <Card>
            <CardHeader title="System" />
            {loading && !host ? (
              <div style={{ padding: 20, color: T.textDim, fontSize: 12 }}>
                Loading…
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding: "10px 14px 8px",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                    {host?.os.name ?? "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textDim,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    {host?.os.architecture ?? "—"} · {host?.hostname ?? "—"}
                  </div>
                </div>
                {[
                  {
                    k: "Kernel",
                    v: host?.os.kernel ?? "—",
                    icon: <Zap size={10} />,
                  },
                  {
                    k: "Uptime",
                    v: host ? formatUptime(host.uptimeSeconds) : "—",
                    icon: <Clock size={10} />,
                  },
                  {
                    k: "Load avg",
                    v: host ? host.load.load1.toFixed(2) : "—",
                    icon: <Activity size={10} />,
                  },
                  {
                    k: "Last boot",
                    v: host
                      ? new Date(
                          Date.now() - host.uptimeSeconds * 1000,
                        ).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—",
                    icon: <MonitorDot size={10} />,
                  },
                  {
                    k: "IP",
                    v: network?.topology.host ?? primaryInterface?.ip ?? "—",
                    icon: <Globe size={10} />,
                  },
                ].map((row) => (
                  <div
                    key={row.k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 14px",
                      borderBottom: `1px solid ${T.borderMuted}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <span style={{ color: T.textDim, display: "flex" }}>
                        {row.icon}
                      </span>
                      <span style={{ fontSize: 11, color: T.textDim }}>
                        {row.k}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.textSub,
                        fontFamily: "JetBrains Mono,monospace",
                        textAlign: "right",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.v}
                    </span>
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>
      </div>

      <div
        className="dash-bottom"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px 192px",
          gap: 12,
        }}
      >
        <Card>
          <CardHeader
            title="Containers"
            action={
              <button
                onClick={() => onNavigate("containers")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: T.textDim,
                  fontWeight: 500,
                }}
              >
                View all <ArrowRight size={11} />
              </button>
            }
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 14px 4px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={{ width: 7 }} />
            <span
              style={{
                flex: 1,
                fontSize: 10,
                fontWeight: 700,
                color: T.textDim,
                textTransform: "uppercase",
              }}
            >
              Name
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textDim,
                width: 36,
                textAlign: "right",
              }}
            >
              CPU
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textDim,
                width: 52,
                textAlign: "right",
              }}
            >
              Mem
            </span>
          </div>
          {containers.slice(0, 6).map((container) => {
            const metric = containerMetrics.get(container.name);
            const bad =
              container.status !== "running" ||
              container.health === "unhealthy";
            return (
              <button
                key={container.id}
                onClick={() => onNavigate("container-detail")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 14px",
                  background: bad ? `${T.yellow}08` : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${T.borderMuted}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: bad ? T.yellow : T.green,
                    flexShrink: 0,
                    boxShadow: bad ? "none" : `0 0 0 2px ${T.green}28`,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.text,
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  {container.name}
                </span>
                {bad && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: `${T.yellow}18`,
                      border: `1px solid ${T.yellow}35`,
                      color: T.yellow,
                    }}
                  >
                    {container.status === "restarting"
                      ? "restarting"
                      : container.health === "unhealthy"
                        ? "unhealthy"
                        : "stopped"}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    color: T.textDim,
                    fontFamily: "JetBrains Mono,monospace",
                    width: 36,
                    textAlign: "right",
                  }}
                >
                  {metric ? `${metric.cpuPercent.toFixed(1)}%` : container.cpu}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: T.textDim,
                    fontFamily: "JetBrains Mono,monospace",
                    width: 52,
                    textAlign: "right",
                  }}
                >
                  {metric
                    ? formatBytes(metric.memoryUsedBytes)
                    : container.memory}
                </span>
              </button>
            );
          })}
          {!containers.length && !loading && (
            <div
              style={{
                padding: 24,
                color: T.textDim,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              No containers found.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            action={
              <button
                onClick={() => onNavigate("logs")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: T.textDim,
                }}
              >
                View all <ArrowRight size={11} />
              </button>
            }
          />
          {activity.length ? (
            activity.map((entry, index) => (
              <ActivityItem
                key={`${entry.timestamp}-${index}`}
                entry={entry}
                last={index === activity.length - 1}
              />
            ))
          ) : (
            <div
              style={{
                padding: 24,
                color: T.textDim,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              No recent activity.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <div
            style={{
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <QuickAction
              label="Create container"
              icon={<Plus size={12} />}
              onClick={() => onNavigate("containers")}
            />
            <QuickAction
              label="Open terminal"
              icon={<Terminal size={12} />}
              onClick={() => onNavigate("terminal")}
            />
            <QuickAction
              label="View logs"
              icon={<ScrollText size={12} />}
              onClick={() => onNavigate("logs")}
            />
            <QuickAction
              label="Check updates"
              icon={<RefreshCw size={12} />}
              onClick={() => onNavigate("updates")}
            />
          </div>
          <div
            style={{
              margin: "4px 10px 10px",
              padding: "10px 12px",
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 7,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textDim,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 7,
              }}
            >
              At a glance
            </div>
            {[
              {
                label: "Running",
                value: String(runningContainers),
                color: T.green,
              },
              {
                label: "Unhealthy",
                value: String(unhealthyContainers),
                color: T.yellow,
              },
              {
                label: "Updates",
                value: String(updates.length),
                color: T.accent,
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: `1px solid ${T.borderMuted}`,
                }}
              >
                <span style={{ fontSize: 11, color: T.textDim }}>
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: row.color,
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
