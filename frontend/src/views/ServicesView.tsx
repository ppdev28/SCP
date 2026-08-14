import { useState } from 'react'
import { Layers, Play, Square, RotateCw, Search } from 'lucide-react'
import { T } from '../lib/tokens'
import { SERVICES } from '../lib/data'
import type { ConfirmDialog } from '../lib/types'
import { Card, Btn, Th, Td, EmptyState, Input, FilterToggle } from '../components/ui'

export default function ServicesView({ addToast, onConfirm }:{ addToast:(m:string,t:any)=>void; onConfirm:(d:ConfirmDialog)=>void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'active'|'inactive'|'failed'>('all')

  const rows = SERVICES.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase())||s.description.toLowerCase().includes(search.toLowerCase())) &&
    (filter==='all'||s.status===filter)
  )

  const statusColor = (s:string) => s==='active'?T.green:s==='failed'?T.red:T.textDim

  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Services</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>systemd units and background services running on this server.</p>
      </div>

      {/* Stats */}
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        {[
          {label:'Active',   value:SERVICES.filter(s=>s.status==='active').length,   color:T.green},
          {label:'Inactive', value:SERVICES.filter(s=>s.status==='inactive').length, color:T.textDim},
          {label:'Failed',   value:SERVICES.filter(s=>s.status==='failed').length,   color:T.red},
        ].map(s=>(
          <div key={s.label} style={{padding:'8px 14px',background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,display:'flex',gap:8,alignItems:'baseline'}}>
            <span style={{fontSize:18,fontWeight:700,color:s.color,fontFamily:'JetBrains Mono,monospace',lineHeight:1}}>{s.value}</span>
            <span style={{fontSize:11,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
        <Input value={search} onChange={setSearch} placeholder="Search services…" icon={<Search size={12}/>} style={{maxWidth:260}}/>
        <FilterToggle
          options={[{label:'All',value:'all'},{label:'Active',value:'active'},{label:'Inactive',value:'inactive'},{label:'Failed',value:'failed'}]}
          value={filter} onChange={setFilter}
        />
      </div>

      <Card>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:640}}>
            <thead>
              <tr style={{background:T.bg}}>
                <Th>Name</Th><Th>Description</Th><Th>Status</Th><Th>Enabled</Th>
                <Th mono>CPU</Th><Th mono>Memory</Th><Th>Uptime</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(s=>(
                <tr key={s.id} style={{cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <Td><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:600,color:T.text}}>{s.name}</span></Td>
                  <Td dim>{s.description}</Td>
                  <Td>
                    <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:statusColor(s.status),flexShrink:0}}/>
                      <span style={{fontSize:11,fontWeight:600,color:statusColor(s.status),textTransform:'capitalize'}}>{s.status}</span>
                    </span>
                  </Td>
                  <Td>
                    <span style={{fontSize:11,fontWeight:600,color:s.enabled?T.green:T.textDim}}>
                      {s.enabled?'Enabled':'Disabled'}
                    </span>
                  </Td>
                  <Td mono dim>{s.cpu}</Td>
                  <Td mono dim>{s.memory}</Td>
                  <Td dim>{s.uptime}</Td>
                  <Td>
                    <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                      {s.status==='active'
                        ? <Btn size="xs" variant="danger" icon={<Square size={10}/>} onClick={()=>onConfirm({title:`Stop ${s.name}?`,message:'This will stop the systemd unit.',action:'Stop',onConfirm:()=>addToast(`Stopping ${s.name}…`,'warning')})}/>
                        : <Btn size="xs" variant="secondary" icon={<Play size={10}/>} onClick={()=>addToast(`Starting ${s.name}…`,'info')}/>
                      }
                      <Btn size="xs" variant="secondary" icon={<RotateCw size={10}/>} onClick={()=>addToast(`Restarting ${s.name}…`,'info')}/>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length===0 && <EmptyState icon={<Layers size={28}/>} title="No services found" sub="Adjust your search or filter criteria."/>}
      </Card>
    </div>
  )
}
