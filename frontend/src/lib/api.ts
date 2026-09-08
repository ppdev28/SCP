import type { Container, ContainerStatus, HealthStatus, HostOverview, NetworkOverview, StorageOverview, SystemService } from './types'
import type { MonitoringOverview } from './monitoring'

type ApiPort = { privatePort: number; publicPort?: number; type: string; ip?: string }
type ApiContainer = { id: string; name: string; image: string; state: string; status: string; createdAt: number; ports?: ApiPort[]; networks?: string[] }
type ApiService = SystemService
type ApiContainerActionResponse = { ok: boolean; id: string }
type ApiServiceActionResponse = { ok: boolean; name: string; action: string }
export type ContainerAction = 'start' | 'stop' | 'restart'
export type ServiceAction = 'start' | 'stop' | 'restart'
const apiBase = '/api/v1'
function mapStatus(state: string): ContainerStatus { switch (state.toLowerCase()) { case 'running': return 'running'; case 'paused': return 'paused'; case 'restarting': return 'restarting'; case 'created': case 'exited': case 'dead': return 'stopped'; default: return 'exited' } }
function mapHealth(status: string): HealthStatus { const normalized = status.toLowerCase(); if (normalized.includes('(healthy)')) return 'healthy'; if (normalized.includes('(unhealthy)')) return 'unhealthy'; if (normalized.includes('(health: starting)')) return 'starting'; return 'none' }
function formatPorts(ports: ApiPort[] = []) { const published = ports.filter((p) => p.publicPort !== undefined).map((p) => `${p.publicPort}:${p.privatePort}`); return published.length ? published.join(', ') : '—' }
function formatCreated(timestamp: number) { return new Date(timestamp * 1000).toLocaleString() }
function formatUptime(status: string, state: string) { if (state.toLowerCase() === 'running') return status.replace(/^Up\s+/i, '').replace(/\s+\(healthy\)$/i, '') || 'Running'; return status || state }
function toContainer(container: ApiContainer): Container { return { id: container.id, name: container.name.replace(/^\//, ''), image: container.image, status: mapStatus(container.state), health: mapHealth(container.status), cpu: '—', cpuNum: 0, memory: '—', memNum: 0, memLimit: '—', net: container.networks?.join(', ') || '—', ports: formatPorts(container.ports), created: formatCreated(container.createdAt), uptime: formatUptime(container.status, container.state), restarts: 0, networkMode: container.networks?.[0] || '—', ip: '—', mac: '—' } }
async function request<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${apiBase}${path}`, init); if (!response.ok) { const body = await response.json().catch(() => null) as { error?: string } | null; throw new Error(body?.error || `SCP API returned ${response.status}`) }; return response.json() as Promise<T> }
export async function getHost(): Promise<HostOverview> { return request<HostOverview>('/host') }
export async function getContainers(): Promise<Container[]> { const containers = await request<ApiContainer[]>('/containers'); return containers.map(toContainer) }
export async function runContainerAction(id: string, action: ContainerAction): Promise<void> { const response = await request<ApiContainerActionResponse>(`/containers/${encodeURIComponent(id)}/${action}`, { method: 'POST' }); if (!response.ok || response.id !== id) throw new Error('SCP API returned an invalid container action response') }
export async function getServices(): Promise<SystemService[]> { return request<ApiService[]>('/services') }
export async function runServiceAction(name: string, action: ServiceAction): Promise<void> { const response = await request<ApiServiceActionResponse>(`/services/${encodeURIComponent(name)}/${action}`, { method: 'POST' }); if (!response.ok || response.name !== name || response.action !== action) throw new Error('SCP API returned an invalid service action response') }
export async function getStorage(): Promise<StorageOverview> { return request<StorageOverview>('/storage') }
export async function getNetwork(): Promise<NetworkOverview> { return request<NetworkOverview>('/network') }
export async function getMonitoring(): Promise<MonitoringOverview> { return request<MonitoringOverview>('/monitoring') }
