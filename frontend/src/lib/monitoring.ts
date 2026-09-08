if (typeof document !== 'undefined' && !document.getElementById('scp-sidebar-overflow-fix')) {
  const style = document.createElement('style')
  style.id = 'scp-sidebar-overflow-fix'
  style.textContent = `
    aside{overflow:visible!important}
    aside > div:first-child > button:last-child{
      opacity:0;
      pointer-events:none;
      left:34px;
      right:auto!important;
      top:16px!important;
      width:21px!important;
      height:21px!important;
      padding:0!important;
      border-radius:50%!important;
      background:rgba(23,26,33,.96)!important;
      border:1px solid rgba(59,130,246,.28)!important;
      box-shadow:0 4px 14px rgba(0,0,0,.38),0 0 0 3px rgba(59,130,246,.06)!important;
      transform:scale(.88)!important;
      transition:opacity 140ms ease,transform 140ms ease,background 140ms ease!important;
      z-index:20;
    }
    aside > div:first-child:has(> div:first-child:hover) > button:last-child{
      opacity:1;
      pointer-events:auto;
      transform:scale(1)!important;
    }
    aside > div:first-child > button:last-child:hover{
      background:rgba(31,35,48,.98)!important;
      border-color:rgba(59,130,246,.55)!important;
      box-shadow:0 5px 16px rgba(0,0,0,.45),0 0 0 3px rgba(59,130,246,.10)!important;
    }
    html[data-scp-reduce-motion="true"] *,html[data-scp-reduce-motion="true"] *::before,html[data-scp-reduce-motion="true"] *::after{
      animation-duration:.001ms!important;
      animation-iteration-count:1!important;
      transition-duration:.001ms!important;
      scroll-behavior:auto!important;
    }
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
