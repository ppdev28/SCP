import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, Play, Square, RotateCw, ArrowLeft, ExternalLink, Layers3 } from 'lucide-react'
import { T } from '../lib/tokens'
import type { AppService } from '../lib/types'
import { getApplications, runApplicationAction, type ApplicationAction } from '../lib/api'
import { Card, CardHeader, StatusBadge, Btn, Input, Skeleton, ErrorState } from '../components/ui'

const CATS = ['All','Web','Database','Media','Development','Monitoring','Automation','Storage','Security']
const APP_CATALOG = [
  { name:'Vaultwarden', desc:'Lightweight Bitwarden-compatible password manager', cat:'Security', icon:'🔐' },
  { name:'Immich', desc:'High-performance self-hosted photo and video backup', cat:'Media', icon:'📷' },
  { name:'Jellyfin', desc:'Free software media streaming platform', cat:'Media', icon:'📺' },
  { name:'Home Assistant', desc:'Open-source home automation', cat:'Automation', icon:'🏠' },
  { name:'Gitea', desc:'Lightweight self-hosted Git service', cat:'Development', icon:'🐙' },
  { name:'Portainer', desc:'Container management UI', cat:'Web', icon:'🐳' },
  { name:'Uptime Kuma', desc:'Self-hosted uptime monitoring', cat:'Monitoring', icon:'📡' },
  { name:'n8n', desc:'Workflow automation platform', cat:'Automation', icon:'⚙' },
]

export default function ApplicationsView({ addToast }: { onDetail?:()=>void; addToast:(m:string,t:any)=>void }) {
  const [tab,setTab]=useState<'installed'|'available'>('installed')
  const [search,setSearch]=useState('')
  const [cat,setCat]=useState('All')
  const [apps,setApps]=useState<AppService[]>([])
  const [selected,setSelected]=useState<AppService|null>(null)
  const [loading,setLoading]=useState(true)
  const [refreshing,setRefreshing]=useState(false)
  const [error,setError]=useState('')
  const [action,setAction]=useState('')

  const load=useCallback(async(initial=false)=>{
    initial?setLoading(true):setRefreshing(true)
    try{setApps(await getApplications());setError('')}catch(e){setError(e instanceof Error?e.message:'Unable to load applications')}finally{setLoading(false);setRefreshing(false)}
  },[])
  useEffect(()=>{void load(true)},[load])

  const filtered=useMemo(()=>apps.filter(a=>(cat==='All'||a.category===cat)&&(a.name.toLowerCase().includes(search.toLowerCase())||a.description.toLowerCase().includes(search.toLowerCase()))),[apps,cat,search])

  async function actionApp(app:AppService,verb:ApplicationAction){
    setAction(`${app.id}:${verb}`)
    try{await runApplicationAction(app.id,verb);addToast(`${verb[0].toUpperCase()+verb.slice(1)} ${app.name} completed`,'success');await load(true);setSelected(prev=>prev?.id===app.id?{...prev,status:verb==='stop'?'stopped':verb==='start'?'running':'restarting'}:prev)}catch(e){addToast(e instanceof Error?e.message:`Unable to ${verb} ${app.name}`,'error')}finally{setAction('')}
  }

  if(selected){
    return <div style={{padding:'22px 24px',maxWidth:1100,width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}><Btn variant="ghost" size="xs" onClick={()=>setSelected(null)} icon={<ArrowLeft size={12}/>}>Applications</Btn><span style={{color:T.textDim}}>/</span><span style={{fontSize:13,fontWeight:600,color:T.text}}>{selected.name}</span></div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:20,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:14,alignItems:'center'}}><div style={{width:52,height:52,borderRadius:12,background:T.raised,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{selected.icon}</div><div><h1 style={{fontSize:18,fontWeight:700,color:T.text}}>{selected.name}</h1><div style={{fontSize:12,color:T.textDim,marginTop:3}}>{selected.description}</div><div style={{display:'flex',alignItems:'center',gap:8,marginTop:7}}><StatusBadge status={selected.status}/><span style={{fontSize:10,color:T.textDim}}>{selected.category} · v{selected.version}</span></div></div></div>
        <div style={{display:'flex',gap:6}}>{selected.status==='running'?<Btn size="xs" variant="secondary" disabled={action===`${selected.id}:stop`} onClick={()=>void actionApp(selected,'stop')} icon={<Square size={10}/>}>Stop</Btn>:<Btn size="xs" variant="primary" disabled={action===`${selected.id}:start`} onClick={()=>void actionApp(selected,'start')} icon={<Play size={10}/>}>Start</Btn>}<Btn size="xs" variant="secondary" disabled={!!action} onClick={()=>void actionApp(selected,'restart')} icon={<RotateCw size={10}/>}>Restart</Btn></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}><Card><CardHeader title="Containers"/><div style={{padding:'16px'}}><div style={{fontSize:25,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{selected.containers}</div><div style={{fontSize:11,color:T.textDim}}>Docker containers in this application</div></div></Card><Card><CardHeader title="Version"/><div style={{padding:'16px'}}><div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>v{selected.version}</div><div style={{fontSize:11,color:T.textDim}}>Detected from container images</div></div></Card><Card><CardHeader title="Status"/><div style={{padding:'16px'}}><StatusBadge status={selected.status}/><div style={{fontSize:11,color:T.textDim,marginTop:8}}>Aggregated from all application containers</div></div></Card></div>
      <Card><CardHeader title="Application model"/><div style={{padding:'16px',fontSize:12,color:T.textDim,lineHeight:1.7}}>SCP groups Docker Compose projects into applications using the <code style={{color:T.textSub}}>com.docker.compose.project</code> label. Standalone containers are exposed as single-container applications. Custom <code style={{color:T.textSub}}>scp.application.*</code> labels can provide a friendly name, category, description and icon.</div></Card>
    </div>
  }

  return <div style={{padding:'22px 24px',maxWidth:1200,width:'100%'}}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:18}}><div><h1 style={{fontSize:17,fontWeight:700,color:T.text}}>Applications</h1><p style={{fontSize:12,color:T.textDim,marginTop:2}}>Higher-level services composed of one or more Docker containers.</p></div><Btn variant="secondary" size="xs" disabled={refreshing} onClick={()=>void load(false)} icon={<RefreshCw size={11}/>}>Refresh</Btn></div>
    <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,marginBottom:18}}>{(['installed','available'] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:500,color:tab===t?T.text:T.textDim,textTransform:'capitalize',borderBottom:`2px solid ${tab===t?T.accent:'transparent'}`,marginBottom:-1,fontFamily:'Inter,sans-serif'}}>{t==='installed'?`Installed (${apps.length})`:'Available'}</button>)}</div>
    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}><Input value={search} onChange={setSearch} placeholder={`Search ${tab} apps…`} icon={<Search size={12}/>} style={{maxWidth:300}}/><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:'4px 10px',background:cat===c?T.accent:T.raised,border:`1px solid ${cat===c?T.accent:T.border}`,borderRadius:5,cursor:'pointer',fontSize:11,fontWeight:500,color:cat===c?'#fff':T.textSub,fontFamily:'Inter,sans-serif'}}>{c}</button>)}</div></div>
    {error&&<div style={{marginBottom:12}}><ErrorState title="Applications unavailable" sub={error} onRetry={()=>void load(true)}/></div>}
    {tab==='installed'&&loading?<div style={{display:'flex',flexDirection:'column',gap:8}}>{[1,2,3].map(i=><Skeleton key={i} h={76} r={10}/>)}</div>:null}
    {tab==='installed'&&!loading&&!error&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{filtered.length===0?<Card><div style={{padding:30,textAlign:'center',color:T.textDim,fontSize:12}}>No applications found on this Docker host.</div></Card>:filtered.map(app=><div key={app.id} onClick={()=>setSelected(app)} style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:16}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderStrong} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}><div style={{width:40,height:40,borderRadius:9,background:T.bg,border:`1px solid ${T.border}`,fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{app.icon}</div><div style={{flex:1,minWidth:0}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><span style={{fontSize:13,fontWeight:700,color:T.text}}>{app.name}</span><StatusBadge status={app.status}/></div><div style={{fontSize:12,color:T.textDim,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{app.description}</div></div><div style={{display:'flex',gap:18,alignItems:'center',flexShrink:0}}><div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{app.containers}</div><div style={{fontSize:10,color:T.textDim}}>CONTAINERS</div></div><div style={{textAlign:'center'}}><div style={{fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>v{app.version}</div><div style={{fontSize:10,color:T.textDim}}>VERSION</div></div><Btn size="xs" variant="ghost" icon={<ExternalLink size={10}/>} onClick={e=>{e.stopPropagation();setSelected(app)}}>Open</Btn></div></div>)}</div>}
    {tab==='available'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>{APP_CATALOG.filter(a=>(cat==='All'||a.cat===cat)&&a.name.toLowerCase().includes(search.toLowerCase())).map(app=><Card key={app.name}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{fontSize:24}}>{app.icon}</div><div><div style={{fontSize:13,fontWeight:700,color:T.text}}>{app.name}</div><div style={{fontSize:10,color:T.textDim,textTransform:'uppercase'}}>{app.cat}</div></div></div><p style={{fontSize:12,color:T.textDim,lineHeight:1.6,margin:'0 0 12px'}}>{app.desc}</p><Btn variant="primary" size="xs" onClick={()=>addToast(`Install ${app.name} is not wired yet — catalog only`,'info')}>Install</Btn></Card>)}</div>}
  </div>
}
