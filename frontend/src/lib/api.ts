import type { Container, ContainerStatus, HealthStatus } from './types'

type ApiPort = {
  privatePort: number
  publicPort?: number
  type: string
  ip?: string
}

type ApiContainer = {
  id: string
  name: string
  image: string
  state: string
  status: string
  createdAt: number
  ports?: ApiPort[]
  networks?: string[]
}

const apiBase = '/api/v1'

function mapStatus(state: string): ContainerStatus {
  switch (state.toLowerCase()) {
    case 'running':
      return 'running'
    case 'paused':
      return 'paused'
    case 'restarting':
      return 'restarting'
    case 'created':
    case 'exited':
    case 'dead':
      return 'stopped'
    default:
      return 'exited'
  }
}

function mapHealth(status: string): HealthStatus {
  const normalized = status.toLowerCase()
  if (normalized.includes('(healthy)')) return 'healthy'
  if (normalized.includes('(unhealthy)')) return 'unhealthy'
  if (normalized.includes('(health: starting)')) return 'starting'
  return 'none'
}

function formatPorts(ports: ApiPort[] = []) {
  const published = ports
    .filter((port) => port.publicPort !== undefined)
    .map((port) => `${port.publicPort}:${port.privatePort}`)
  return published.length ? published.join(', ') : '—'
}

function formatCreated(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

function formatUptime(status: string, state: string) {
  if (state.toLowerCase() === 'running') {
    return status.replace(/^Up\s+/i, '').replace(/\s+\(healthy\)$/i, '') || 'Running'
  }
  return status || state
}

function toContainer(container: ApiContainer): Container {
  return {
    id: container.id,
    name: container.name.replace(/^\//, ''),
    image: container.image,
    status: mapStatus(container.state),
    health: mapHealth(container.status),
    cpu: '—',
    cpuNum: 0,
    memory: '—',
    memNum: 0,
    memLimit: '—',
    net: container.networks?.join(', ') || '—',
    ports: formatPorts(container.ports),
    created: formatCreated(container.createdAt),
    uptime: formatUptime(container.status, container.state),
    restarts: 0,
    networkMode: container.networks?.[0] || '—',
    ip: '—',
    mac: '—',
  }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`)
  if (!response.ok) {
    throw new Error(`SCP API returned ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function getContainers(): Promise<Container[]> {
  const containers = await request<ApiContainer[]>('/containers')
  return containers.map(toContainer)
}
