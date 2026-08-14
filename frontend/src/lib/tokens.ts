import type { ContainerStatus, HealthStatus } from './types'

export const T = {
  bg:           '#0b0c0f',
  raised:       '#111318',
  overlay:      '#171a21',
  hover:        '#1a1d26',
  active:       '#1f2330',
  border:       '#1f2333',
  borderMuted:  '#181b27',
  borderStrong: '#2d3348',
  text:         '#eaecf0',
  textSub:      '#8b92a5',
  textDim:      '#50586b',
  accent:       '#3b82f6',
  accentHover:  '#2563eb',
  green:        '#22c55e',
  yellow:       '#f59e0b',
  red:          '#ef4444',
  purple:       '#a78bfa',
} as const

export const STATUS_MAP: Record<ContainerStatus, { color: string; bg: string; label: string; pulse?: boolean }> = {
  running:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Running',    pulse: true },
  stopped:    { color: '#50586b', bg: 'rgba(80,88,107,0.1)',   label: 'Stopped' },
  paused:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Paused' },
  restarting: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Restarting', pulse: true },
  exited:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Exited' },
}

export const HEALTH_MAP: Record<HealthStatus, { color: string; label: string }> = {
  healthy:   { color: '#22c55e', label: 'Healthy' },
  unhealthy: { color: '#ef4444', label: 'Unhealthy' },
  starting:  { color: '#f59e0b', label: 'Starting' },
  none:      { color: '#50586b', label: 'No healthcheck' },
}
