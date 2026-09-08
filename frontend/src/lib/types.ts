export type View =
  | 'dashboard'
  | 'host' | 'containers' | 'container-detail' | 'container-create'
  | 'applications' | 'app-detail'
  | 'services'
  | 'storage'
  | 'network'
  | 'monitoring'
  | 'logs'
  | 'terminal'
  | 'security'
  | 'updates'
  | 'settings'

export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'exited'
export type HealthStatus = 'healthy' | 'unhealthy' | 'starting' | 'none'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Container {
  id: string
  name: string
  image: string
  status: ContainerStatus
  health: HealthStatus
  cpu: string
  cpuNum: number
  memory: string
  memNum: number
  memLimit: string
  net: string
  ports: string
  created: string
  uptime: string
  restarts: number
  networkMode: string
  ip: string
  mac: string
}

export interface HostOverview {
  hostname: string
  os: {
    name: string
    version: string
    kernel: string
    architecture: string
  }
  uptimeSeconds: number
  load: {
    load1: number
    load5: number
    load15: number
  }
  cpu: {
    cores: number
    usagePercent: number
  }
  memory: {
    totalBytes: number
    usedBytes: number
    availableBytes: number
    usagePercent: number
  }
  disk: {
    totalBytes: number
    usedBytes: number
    availableBytes: number
    usagePercent: number
  }
}

export interface AppService {
  id: string
  name: string
  description: string
  status: ContainerStatus
  containers: number
  version: string
  category: string
  icon: string
}

export interface SystemService {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'failed'
  enabled: boolean
  cpu: string
  memory: string
  uptime: string
}

export interface StorageDisk {
  device: string
  model: string
  capacityBytes: number
  usedBytes: number
  availableBytes: number
  usagePercent: number
  filesystem: string
  mount: string
  temperature: string
  smart: string
  type: string
}

export interface StorageVolume {
  name: string
  driver: string
  mountpoint: string
  sizeBytes: number
  usedBytes: number
}

export interface StorageOverview {
  totalCapacityBytes: number
  usedBytes: number
  availableBytes: number
  usagePercent: number
  disks: StorageDisk[]
  volumes: StorageVolume[]
}

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export interface ConfirmDialog {
  title: string
  message: string
  action: string
  danger?: boolean
  onConfirm: () => void
}
