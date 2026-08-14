import { useState } from 'react'
import { Search, Download, RefreshCw } from 'lucide-react'
import { T } from '../lib/tokens'
import { LOG_LINES } from '../lib/data'
import { Card, Btn, Input, Select, FilterToggle } from '../components/ui'

const SOURCES = ['All','System','Docker','nginx','postgres','redis','Security']

const LEVEL_COLOR: Record<string,string> = {
  INFO:  '#22c55e', WARN: '#f59e0b', ERROR: '#ef4444',
  notice:'#3b82f6', access:'#8b92a5',
}

export default function LogsView() {
  const [search, setSearch]   = useState('')
  const [level,  setLevel]    = useState('All')
  const [source, setSource]   = useState('All')
  const [follow, setFollow]   = useState(true)

  const filtered = LOG_LINES.filter(l => {
    const matchS = search===''||l.msg.toLowerCase().includes(search.toLowerCase())||l.source.toLowerCase().includes(search.toLowerCase())
    const matchL = level==='All'||l.level===level
    const matchSrc = source==='All'||l.source===source
    return matchS&&matchL&&matchSrc
  })

  return (
    <div style={{padding:'22px 24px',display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{marginBottom:14}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Logs</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Centralized log explorer — system, Docker, containers, and services.</p>
      </div>

      {/* Source pills */}
      <div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
        {SOURCES.map(s=>(
          <button key={s} onClick={()=>setSource(s)} style={{
            padding:'4px 10px',background:source===s?T.accent:T.raised,
            border:`1px solid ${source===s?T.accent:T.border}`,borderRadius:5,
            cursor:'pointer',fontSize:11,fontWeight:500,color:source===s?'#fff':T.textSub,
            fontFamily:'Inter,sans-serif',
          }}>{s}</button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap',alignItems:'center'}}>
        <Input value={search} onChange={setSearch} placeholder="Search logs…" icon={<Search size={12}/>} style={{flex:1,maxWidth:340}}/>
        <Select
          value={level} onChange={setLevel}
          options={['All','INFO','WARN','ERROR','notice','access'].map(v=>({label:v,value:v}))}
        />
        <div style={{flex:1}}/>
        <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',userSelect:'none'}}>
          <input type="checkbox" checked={follow} onChange={e=>setFollow(e.target.checked)} style={{accentColor:T.accent}}/>
          <span style={{fontSize:11,color:T.textDim}}>Auto-scroll</span>
        </label>
        <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',userSelect:'none'}}>
          <input type="checkbox" defaultChecked style={{accentColor:T.accent}}/>
          <span style={{fontSize:11,color:T.textDim}}>Follow logs</span>
        </label>
        <Btn variant="ghost" size="xs" icon={<RefreshCw size={11}/>}>Refresh</Btn>
        <Btn variant="ghost" size="xs" icon={<Download size={11}/>}>Download</Btn>
      </div>

      {/* Log viewer */}
      <Card style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{
          flex:1, overflowY:'auto', padding:'12px 16px',
          background:T.bg, fontFamily:'JetBrains Mono,monospace', fontSize:11.5, lineHeight:1.9,
          minHeight:400,
        }}>
          {filtered.length===0 ? (
            <div style={{color:T.textDim,textAlign:'center',paddingTop:40}}>No log entries match your filters</div>
          ) : filtered.map((line,i)=>(
            <div key={i} style={{display:'flex',gap:14,padding:'1px 0',borderBottom:`1px solid ${T.borderMuted}10`}}>
              <span style={{color:T.textDim,flexShrink:0,userSelect:'none',width:86}}>{line.ts}</span>
              <span style={{
                width:52,flexShrink:0,fontWeight:600,textTransform:'uppercase',
                color:LEVEL_COLOR[line.level]||T.textDim,
              }}>{line.level}</span>
              <span style={{width:64,flexShrink:0,color:T.textDim,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{line.source}</span>
              <span style={{color:T.textSub,flex:1}}>{line.msg}</span>
            </div>
          ))}
        </div>
        <div style={{padding:'8px 16px',borderTop:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,color:T.textDim,fontFamily:'JetBrains Mono,monospace'}}>{filtered.length} entries</span>
          <span style={{width:6,height:6,borderRadius:'50%',background:T.green,marginLeft:'auto'}} className="pulse"/>
          <span style={{fontSize:11,color:T.textDim}}>Live</span>
        </div>
      </Card>
    </div>
  )
}
