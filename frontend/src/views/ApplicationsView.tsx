import { useState } from 'react'
import { Search, ChevronRight, ExternalLink } from 'lucide-react'
import { T, STATUS_MAP } from '../lib/tokens'
import { APPLICATIONS } from '../lib/data'
import { Card, StatusBadge, Btn, Input, FilterToggle } from '../components/ui'

const CATS = ['All','Web','Database','Media','Development','Monitoring','Automation','Storage','Security']

const APP_CATALOG = [
  { name:'Vaultwarden', desc:'Lightweight Bitwarden-compatible password manager', cat:'Security', icon:'🔐' },
  { name:'Immich',      desc:'High-performance self-hosted photo and video backup', cat:'Media',   icon:'📷' },
  { name:'Jellyfin',    desc:'Free software media streaming platform',              cat:'Media',   icon:'📺' },
  { name:'Home Assistant',desc:'Open-source home automation',                       cat:'Automation',icon:'🏠' },
  { name:'Gitea',       desc:'Lightweight self-hosted Git service',                 cat:'Development',icon:'🐙' },
  { name:'Portainer',   desc:'Container management UI',                             cat:'Web',     icon:'🐳' },
  { name:'Uptime Kuma', desc:'Self-hosted uptime monitoring',                       cat:'Monitoring',icon:'📡' },
  { name:'n8n',         desc:'Workflow automation platform',                        cat:'Automation',icon:'⚙' },
]

export default function ApplicationsView({ onDetail, addToast }: { onDetail:()=>void; addToast:(m:string,t:any)=>void }) {
  const [tab, setTab]     = useState<'installed'|'available'>('installed')
  const [search, setSearch] = useState('')
  const [cat, setCat]     = useState('All')

  const installedFiltered = APPLICATIONS.filter(a =>
    (cat==='All'||a.category===cat) &&
    (a.name.toLowerCase().includes(search.toLowerCase())||a.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Applications</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Higher-level services composed of one or more containers.</p>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,marginBottom:18}}>
        {['installed','available'].map(t=>(
          <button key={t} onClick={()=>setTab(t as any)} style={{
            padding:'8px 16px',background:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:500,color:tab===t?T.text:T.textDim,textTransform:'capitalize',
            borderBottom:`2px solid ${tab===t?T.accent:'transparent'}`,marginBottom:-1,fontFamily:'Inter,sans-serif',
          }}>{t === 'installed' ? `Installed (${APPLICATIONS.length})` : 'Available'}</button>
        ))}
      </div>

      {/* Search + category filter */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <Input value={search} onChange={setSearch} placeholder={`Search ${tab} apps…`} icon={<Search size={12}/>} style={{maxWidth:260}}/>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              padding:'4px 10px',background:cat===c?T.accent:T.raised,
              border:`1px solid ${cat===c?T.accent:T.border}`,borderRadius:5,
              cursor:'pointer',fontSize:11,fontWeight:500,color:cat===c?'#fff':T.textSub,
              fontFamily:'Inter,sans-serif',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {tab==='installed' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {installedFiltered.map(app=>{
            const s = STATUS_MAP[app.status]
            return (
              <div key={app.id} onClick={onDetail} style={{
                background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,
                padding:'14px 18px',cursor:'pointer',
                display:'flex',alignItems:'center',gap:16,
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderStrong}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
              >
                <div style={{width:36,height:36,fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{app.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text}}>{app.name}</span>
                    <StatusBadge status={app.status}/>
                  </div>
                  <div style={{fontSize:12,color:T.textDim}}>{app.description}</div>
                </div>
                <div style={{display:'flex',gap:16,alignItems:'center',flexShrink:0}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{app.containers}</div>
                    <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.05em'}}>Containers</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>v{app.version}</div>
                    <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.05em'}}>Version</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <Btn size="xs" variant="secondary" onClick={()=>addToast(`Opening ${app.name}…`,'info')} icon={<ExternalLink size={10}/>}>Open</Btn>
                    <Btn size="xs" variant="ghost" icon={<ChevronRight size={10}/>}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab==='available' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
          {APP_CATALOG.filter(a=>(cat==='All'||a.cat===cat)&&a.name.toLowerCase().includes(search.toLowerCase())).map(app=>(
            <div key={app.name} style={{
              background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,padding:'16px',
              display:'flex',flexDirection:'column',gap:10,
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderStrong}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
            >
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:24}}>{app.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{app.name}</div>
                  <div style={{fontSize:10,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.05em'}}>{app.cat}</div>
                </div>
              </div>
              <p style={{fontSize:12,color:T.textDim,lineHeight:1.6,margin:0}}>{app.desc}</p>
              <Btn variant="primary" size="xs" onClick={()=>addToast(`Installing ${app.name}…`,'info')}>Install</Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
