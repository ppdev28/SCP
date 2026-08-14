import { useState } from 'react'
import { RefreshCw, Shield, Check } from 'lucide-react'
import { T } from '../lib/tokens'
import { UPDATES } from '../lib/data'
import type { ConfirmDialog } from '../lib/types'
import { Card, CardHeader, Btn, Th, Td } from '../components/ui'

export default function UpdatesView({ addToast, onConfirm }:{ addToast:(m:string,t:any)=>void; onConfirm:(d:ConfirmDialog)=>void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [checking, setChecking] = useState(false)

  const security = UPDATES.filter(u=>u.type==='security')
  const system   = UPDATES.filter(u=>u.type==='system')

  const toggleAll = () => {
    if (selected.size===UPDATES.length) setSelected(new Set())
    else setSelected(new Set(UPDATES.map(u=>u.pkg)))
  }

  const checkNow = () => {
    setChecking(true)
    setTimeout(()=>{ setChecking(false); addToast('Package index refreshed — 12 updates available','info') },1400)
  }

  const applySelected = () => {
    onConfirm({
      title:`Apply ${selected.size} update${selected.size!==1?'s':''}?`,
      message:'System packages will be upgraded. Some services may restart automatically. This may take several minutes.',
      action:'Apply updates',
      onConfirm:()=>addToast(`Applying ${selected.size} updates…`,'info'),
    })
  }

  const applyAll = () => {
    onConfirm({
      title:'Apply all 12 updates?',
      message:'All available packages will be upgraded including 4 security updates. Some services may restart automatically.',
      action:'Apply all updates',
      onConfirm:()=>addToast('Applying all 12 updates…','info'),
    })
  }

  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Updates</h1>
          <p style={{fontSize:12,color:T.textDim,marginTop:2}}>System package updates for homelab-server.</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Btn onClick={checkNow} variant="secondary" icon={<RefreshCw size={11} style={checking?{animation:'spin 1s linear infinite'}:undefined}/>}>
            {checking?'Checking…':'Check now'}
          </Btn>
          {selected.size>0 && <Btn onClick={applySelected} variant="primary">Apply {selected.size} selected</Btn>}
          <Btn onClick={applyAll} variant="primary" icon={<Check size={11}/>}>Apply all</Btn>
        </div>
      </div>

      {/* Summary */}
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        {[
          {label:'Security',value:security.length,color:T.red,   icon:<Shield size={13}/>},
          {label:'System',  value:system.length,  color:T.yellow,icon:<RefreshCw size={13}/>},
          {label:'Total',   value:UPDATES.length, color:T.text,  icon:<Check size={13}/>},
        ].map(s=>(
          <div key={s.label} style={{padding:'10px 14px',background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,display:'flex',alignItems:'center',gap:10}}>
            <span style={{color:s.color,display:'flex'}}>{s.icon}</span>
            <span style={{fontSize:18,fontWeight:700,color:s.color,fontFamily:'JetBrains Mono,monospace',lineHeight:1}}>{s.value}</span>
            <span style={{fontSize:11,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Security updates */}
      {security.length>0 && (
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <Shield size={13} color={T.red}/>
            <span style={{fontSize:12,fontWeight:700,color:T.red}}>Security updates</span>
          </div>
          <Card>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:T.bg}}>
                <th style={{width:40,padding:'8px 14px',borderBottom:`1px solid ${T.border}`}}>
                  <input type="checkbox" checked={security.every(u=>selected.has(u.pkg))} onChange={()=>{
                    const allSec=security.every(u=>selected.has(u.pkg))
                    setSelected(prev=>{const s=new Set(prev);security.forEach(u=>allSec?s.delete(u.pkg):s.add(u.pkg));return s})
                  }} style={{accentColor:T.accent,cursor:'pointer'}}/>
                </th>
                <Th>Package</Th><Th mono>Current</Th><Th mono>Available</Th><Th>Type</Th>
              </tr></thead>
              <tbody>
                {security.map(u=>(
                  <tr key={u.pkg}
                    onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{padding:'9px 14px',borderBottom:`1px solid ${T.borderMuted}`}}>
                      <input type="checkbox" checked={selected.has(u.pkg)} onChange={()=>setSelected(prev=>{const s=new Set(prev);s.has(u.pkg)?s.delete(u.pkg):s.add(u.pkg);return s})} style={{accentColor:T.accent,cursor:'pointer'}}/>
                    </td>
                    <Td><span style={{fontWeight:600,color:T.text,fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{u.pkg}</span></Td>
                    <Td mono dim>{u.current}</Td>
                    <Td mono><span style={{color:T.green}}>{u.next}</span></Td>
                    <Td><span style={{fontSize:11,padding:'2px 6px',borderRadius:3,background:`${T.red}18`,color:T.red,fontWeight:600}}>Security</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* System updates */}
      <div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <RefreshCw size={13} color={T.yellow}/>
          <span style={{fontSize:12,fontWeight:700,color:T.yellow}}>System updates</span>
        </div>
        <Card>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:T.bg}}>
              <th style={{width:40,padding:'8px 14px',borderBottom:`1px solid ${T.border}`}}>
                <input type="checkbox" checked={system.every(u=>selected.has(u.pkg))} onChange={()=>{
                  const allSys=system.every(u=>selected.has(u.pkg))
                  setSelected(prev=>{const s=new Set(prev);system.forEach(u=>allSys?s.delete(u.pkg):s.add(u.pkg));return s})
                }} style={{accentColor:T.accent,cursor:'pointer'}}/>
              </th>
              <Th>Package</Th><Th mono>Current</Th><Th mono>Available</Th><Th>Type</Th>
            </tr></thead>
            <tbody>
              {system.map(u=>(
                <tr key={u.pkg}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={{padding:'9px 14px',borderBottom:`1px solid ${T.borderMuted}`}}>
                    <input type="checkbox" checked={selected.has(u.pkg)} onChange={()=>setSelected(prev=>{const s=new Set(prev);s.has(u.pkg)?s.delete(u.pkg):s.add(u.pkg);return s})} style={{accentColor:T.accent,cursor:'pointer'}}/>
                  </td>
                  <Td><span style={{fontWeight:600,color:T.text,fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{u.pkg}</span></Td>
                  <Td mono dim>{u.current}</Td>
                  <Td mono><span style={{color:T.green}}>{u.next}</span></Td>
                  <Td><span style={{fontSize:11,padding:'2px 6px',borderRadius:3,background:`${T.yellow}18`,color:T.yellow,fontWeight:600}}>System</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
