import { HardDrive, Database, Trash2 } from 'lucide-react'
import { T } from '../lib/tokens'
import { Card, CardHeader, Btn, Th, Td } from '../components/ui'
import type { ConfirmDialog } from '../lib/types'

const DISKS = [
  { dev:'/dev/nvme0n1', model:'Samsung 980 PRO 1TB', cap:'1 TB', used:61, fs:'ext4', mount:'/', temp:'38°C', smart:'PASSED' },
  { dev:'/dev/sda',     model:'WD Red 4TB',          cap:'4 TB', used:28, fs:'ext4', mount:'/mnt/backup', temp:'32°C', smart:'PASSED' },
]
const VOLUMES = [
  { name:'nginx_certs',      driver:'local', mount:'/var/lib/docker/volumes/nginx_certs', size:'2.1 MB',  used:'1.4 MB' },
  { name:'postgres_data',    driver:'local', mount:'/var/lib/docker/volumes/postgres_data',size:'4.2 GB', used:'4.2 GB' },
  { name:'nextcloud_data',   driver:'local', mount:'/var/lib/docker/volumes/nextcloud_data',size:'84 GB', used:'61 GB' },
  { name:'grafana_config',   driver:'local', mount:'/var/lib/docker/volumes/grafana_config',size:'38 MB', used:'12 MB' },
]

export default function StorageView({ addToast, onConfirm }:{ addToast:(m:string,t:any)=>void; onConfirm:(d:ConfirmDialog)=>void }) {
  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Storage</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Disks, partitions, mounts, and Docker volumes.</p>
      </div>

      {/* Overview metrics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'Total capacity', value:'5 TB',    sub:'2 disks'},
          {label:'Used',          value:'712 GB',   sub:'13.5%'},
          {label:'Available',     value:'4.32 TB',  sub:'86.5%'},
        ].map(m=>(
          <Card key={m.label} style={{padding:'14px 16px'}}>
            <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>{m.label}</div>
            <div style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace',letterSpacing:'-0.02em'}}>{m.value}</div>
            <div style={{fontSize:11,color:T.textDim,marginTop:3}}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Disks */}
      <Card style={{marginBottom:14}}>
        <CardHeader title="Disks"/>
        {DISKS.map((d,i)=>(
          <div key={d.dev} style={{padding:'14px 16px',borderBottom:i<DISKS.length-1?`1px solid ${T.borderMuted}`:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <HardDrive size={16} color={T.textDim}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{d.dev}</span>
                  <span style={{fontSize:11,color:T.textDim}}>{d.model}</span>
                  <span style={{fontSize:11,color:T.textDim,marginLeft:'auto',fontFamily:'JetBrains Mono,monospace'}}>{d.cap}</span>
                </div>
              </div>
            </div>
            {/* Usage bar */}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,height:6,background:T.bg,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${d.used}%`,background:d.used>85?T.red:d.used>70?T.yellow:T.accent,borderRadius:3}}/>
              </div>
              <span style={{fontSize:11,color:T.textDim,fontFamily:'JetBrains Mono,monospace',width:30,textAlign:'right'}}>{d.used}%</span>
            </div>
            <div style={{display:'flex',gap:20,marginTop:8}}>
              {[{k:'Filesystem',v:d.fs},{k:'Mount',v:d.mount},{k:'Temp',v:d.temp},{k:'SMART',v:d.smart}].map(r=>(
                <div key={r.k}>
                  <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.06em'}}>{r.k}</div>
                  <div style={{fontSize:11,color:r.k==='SMART'?(r.v==='PASSED'?T.green:T.red):T.textSub,fontFamily:'JetBrains Mono,monospace',marginTop:2}}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Docker volumes */}
      <Card>
        <CardHeader title="Docker volumes"/>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:T.bg}}>
              <Th>Name</Th><Th>Driver</Th><Th mono>Mount point</Th><Th mono right>Size</Th><Th mono right>Used</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {VOLUMES.map(v=>(
              <tr key={v.name} style={{cursor:'default'}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <Td><span style={{fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{v.name}</span></Td>
                <Td dim>{v.driver}</Td>
                <Td mono dim style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.mount}</Td>
                <Td mono dim right>{v.size}</Td>
                <Td mono dim right>{v.used}</Td>
                <Td>
                  <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                    <Btn size="xs" variant="ghost">Browse</Btn>
                    <Btn size="xs" variant="danger" icon={<Trash2 size={10}/>} onClick={()=>onConfirm({title:`Delete volume "${v.name}"?`,message:'This will permanently delete the volume and all its data. This action cannot be undone.',action:'Delete volume',danger:true,onConfirm:()=>addToast(`Deleted ${v.name}`,'error')})}/>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
