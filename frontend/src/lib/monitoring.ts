if (typeof document !== 'undefined' && !document.getElementById('scp-sidebar-overflow-fix')) {
  const style = document.createElement('style')
  style.id = 'scp-sidebar-overflow-fix'
  style.textContent = `
    aside{overflow:visible!important}
    aside > div:first-child > button:last-child{opacity:0;pointer-events:none;transition:opacity 140ms ease}
    aside > div:first-child:has(> div:first-child:hover) > button:last-child{opacity:1;pointer-events:auto}
  `
  document.head.appendChild(style)
}

export interface MonitoringHost {
  cpuUsagePercent: number
  cores: number
  memoryUsedBytes: number
  memoryTotalBytes: number
  memoryUsagePercent: number
  swapUsedBytes: number
  swapTotalBytes: number
  load1: number
  load5: number
  load15: number
  diskReadBytes: number
  diskWriteBytes: number
  netRxBytes: number
  netTxBytes: number
}

export interface MonitoringContainer {
  id: string
  name: string
  cpuPercent: number
  memoryUsedBytes: number
  memoryLimitBytes: number
  memoryPercent: number
  netRxBytes: number
  netTxBytes: number
  blockReadBytes: number
  blockWriteBytes: number
}

export interface MonitoringOverview {
  timestamp: number
  host: MonitoringHost
  containers: MonitoringContainer[]
}
