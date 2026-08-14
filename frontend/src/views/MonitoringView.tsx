import { useState } from 'react'
import { T } from '../lib/tokens'
import { CONTAINERS, buildChartData } from '../lib/data'
import { Card, CardHeader, ResourceChart, FilterToggle } from '../components/ui'

const ALL_RANGES = ['15m','1h','6h','24h','7d','30d'] as const
type Range = typeof ALL_RANGES[number]

function MiniTile({ label, value, sub, color }: { label:string; value:string; sub?:string; color:string }) {
  return (
    <Card style={{ padding:'14px 16px' }}>
      <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>{label}</div>
      <div style={{fontSize:24,fontWeight:700,color,fontFamily:'JetBrains Mono,monospace',letterSpacing:'-0.02em',lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:11,color:T.textDim,marginTop:4,fontFamily:'JetBrains Mono,monospace'}}>{sub}</div>}
    </Card>
  )
}

export default function MonitoringView() {
  const [source, setSource] = useState<'system'|'containers'>('system')

  const topCpu  = [...CONTAINERS].filter(c=>c.status==='running').sort((a,b)=>b.cpuNum-a.cpuNum).slice(0,5)
  const topMem  = [...CONTAINERS].filter(c=>c.status==='running').sort((a,b)=>b.memNum-a.memNum).slice(0,5)

  return (
    <div style={{ padding:'22px 24px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Monitoring</h1>
          <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Real-time system and container metrics.</p>
        </div>
        <FilterToggle
          options={[{label:'System',value:'system'},{label:'Containers',value:'containers'}]}
          value={source} onChange={setSource}
        />
      </div>

      {source==='system' && <>
        {/* Metric tiles */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
          <MiniTile label="CPU"      value="23%"      sub="8 cores · load 0.42"  color={T.accent}/>
          <MiniTile label="Memory"   value="48%"      sub="7.7 GB / 16 GB"       color="#a78bfa"/>
          <MiniTile label="Swap"     value="2%"       sub="0.2 GB / 8 GB"        color={T.textSub}/>
          <MiniTile label="Temp"     value="48°C"     sub="Core 0–7"             color={T.yellow}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
          <MiniTile label="Load (1m)" value="0.42"   sub="of 8 CPUs"            color={T.text}/>
          <MiniTile label="Disk I/O" value="12 MB/s" sub="↓ read · ↑ write"    color={T.yellow}/>
          <MiniTile label="Net RX"   value="2.4 MB/s" sub="since reboot"        color={T.green}/>
          <MiniTile label="Net TX"   value="840 KB/s" sub="since reboot"        color={T.green}/>
        </div>

        {/* Charts — 2-col grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <ResourceChart label="CPU Usage"    color={T.accent}  base={23} noise={18} seed={0.42} ranges={['15m','1h','6h','24h','7d','30d']}/>
          <ResourceChart label="Memory Usage" color="#a78bfa"   base={48} noise={8}  seed={0.73} ranges={['15m','1h','6h','24h','7d','30d']}/>
          <ResourceChart label="Disk I/O Read"  color={T.yellow} base={12} noise={8} seed={0.21} unit=" MB/s" ranges={['15m','1h','6h','24h','7d','30d']}/>
          <ResourceChart label="Network RX"   color={T.green}   base={2.4} noise={1.5} seed={0.55} unit=" MB/s" ranges={['15m','1h','6h','24h','7d','30d']}/>
        </div>
      </>}

      {source==='containers' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <Card>
            <CardHeader title="Highest CPU usage"/>
            {topCpu.map((c,i)=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 16px',borderBottom:i<topCpu.length-1?`1px solid ${T.borderMuted}`:'none'}}>
                <span style={{width:18,height:18,borderRadius:4,background:T.overlay,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:T.textDim,flexShrink:0}}>{i+1}</span>
                <span style={{flex:1,fontSize:12,fontWeight:600,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{c.name}</span>
                <div style={{flex:2,height:4,background:T.bg,borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(c.cpuNum/5)*100}%`,background:T.accent,borderRadius:2}}/>
                </div>
                <span style={{width:40,textAlign:'right',fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>{c.cpu}</span>
              </div>
            ))}
          </Card>
          <Card>
            <CardHeader title="Highest Memory usage"/>
            {topMem.map((c,i)=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 16px',borderBottom:i<topMem.length-1?`1px solid ${T.borderMuted}`:'none'}}>
                <span style={{width:18,height:18,borderRadius:4,background:T.overlay,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:T.textDim,flexShrink:0}}>{i+1}</span>
                <span style={{flex:1,fontSize:12,fontWeight:600,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{c.name}</span>
                <div style={{flex:2,height:4,background:T.bg,borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(c.memNum/350)*100}%`,background:'#a78bfa',borderRadius:2}}/>
                </div>
                <span style={{width:56,textAlign:'right',fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>{c.memory}</span>
              </div>
            ))}
          </Card>
          <div style={{gridColumn:'1/-1'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <ResourceChart label="Container CPU (aggregate)" color={T.accent} base={9} noise={4} seed={0.11}/>
              <ResourceChart label="Container Memory (aggregate)" color="#a78bfa" base={790} noise={40} seed={0.88} unit=" MB"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
