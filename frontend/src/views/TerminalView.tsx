import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Maximize2, RefreshCw } from 'lucide-react'
import { T } from '../lib/tokens'
import { Btn } from '../components/ui'

interface Session { id: string; title: string; lines: string[]; input: string }

const BOOT_LINES = [
  'Connected to homelab-server via SSH',
  'Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-47-generic x86_64)',
  '',
  ' * Documentation: https://help.ubuntu.com',
  ' * Management:    https://landscape.canonical.com',
  '',
  'Last login: Mon Jan 15 14:38:15 2024 from 192.168.1.42',
  'pepe@homelab-server:~$ ',
]

function mkSession(n: number): Session {
  return { id: String(n), title: `Terminal ${n}`, lines: [...BOOT_LINES], input: '' }
}

export default function TerminalView() {
  const [sessions, setSessions] = useState<Session[]>([mkSession(1)])
  const [active, setActive]     = useState('1')
  const [full, setFull]         = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const sess = sessions.find(s=>s.id===active)!

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[sess?.lines])
  useEffect(()=>{ inputRef.current?.focus() },[active])

  const addSession = () => {
    const n = sessions.length + 1
    const s = mkSession(n)
    setSessions(prev=>[...prev,s])
    setActive(s.id)
  }

  const closeSession = (id: string) => {
    const remaining = sessions.filter(s=>s.id!==id)
    setSessions(remaining)
    if (active===id) setActive(remaining[remaining.length-1]?.id||'')
  }

  const submit = () => {
    if (!sess || !sess.input.trim()) return
    const cmd = sess.input.trim()
    const prompt = 'pepe@homelab-server:~$ '
    let output: string[] = []
    if (cmd==='ls')      output = ['bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var']
    else if (cmd==='ls -la') output = ['total 80','drwxr-xr-x  3 pepe pepe 4096 Jan 15 14:38 .','drwxr-xr-x 12 root root 4096 Jan  1 10:00 ..','drwxr-xr-x  3 pepe pepe 4096 Jan 15 14:38 .local','-rw-------  1 pepe pepe  807 Jan 15 14:38 .bash_history']
    else if (cmd==='pwd') output = ['/home/pepe']
    else if (cmd==='whoami') output = ['pepe']
    else if (cmd==='df -h') output = ['Filesystem      Size  Used Avail Use% Mounted on','/dev/nvme0n1p1  984G  601G  333G  65% /','tmpfs            16G     0   16G   0% /dev/shm']
    else if (cmd==='uptime') output = [' 15:00:01 up 14 days,  8:32,  1 user,  load average: 0.42, 0.38, 0.31']
    else if (cmd.startsWith('docker ')) output = ['Permission denied. Docker commands are managed via the Containers page.']
    else output = [`bash: ${cmd}: command not found`]
    setSessions(prev=>prev.map(s=>s.id===active
      ? { ...s, lines:[...s.lines.slice(0,-1),`${prompt}${cmd}`,...output,prompt], input:'' }
      : s
    ))
  }

  const updateInput = (v: string) => {
    setSessions(prev=>prev.map(s=>s.id===active?{...s,input:v}:s))
  }

  return (
    <div style={{padding:'22px 24px',display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
        <div>
          <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Terminal</h1>
          <p style={{fontSize:12,color:T.textDim,marginTop:2}}>SSH terminal sessions to homelab-server.</p>
        </div>
        <div style={{display:'flex',gap:6}}>
          <Btn variant="secondary" size="xs" icon={<RefreshCw size={11}/>} onClick={()=>setSessions(prev=>prev.map(s=>s.id===active?{...s,lines:[...BOOT_LINES]}:s))}>Reconnect</Btn>
          <Btn variant="ghost"     size="xs" icon={<Trash2 size={11}/>}    onClick={()=>setSessions(prev=>prev.map(s=>s.id===active?{...s,lines:['pepe@homelab-server:~$ ']}:s))}>Clear</Btn>
          <Btn variant="ghost"     size="xs" icon={<Maximize2 size={11}/>} onClick={()=>setFull(v=>!v)}>Fullscreen</Btn>
          <Btn variant="secondary" size="xs" icon={<Plus size={11}/>}      onClick={addSession}>New session</Btn>
        </div>
      </div>

      <div style={{
        flex:1,display:'flex',flexDirection:'column',
        background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,overflow:'hidden',
        ...(full?{position:'fixed',inset:0,zIndex:500,borderRadius:0}:{}),
      }}>
        {/* Tab bar */}
        <div style={{display:'flex',alignItems:'center',background:T.raised,borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:0,flex:1,overflowX:'auto'}}>
            {sessions.map(s=>(
              <div key={s.id} style={{
                display:'flex',alignItems:'center',gap:6,
                padding:'8px 14px',cursor:'pointer',borderRight:`1px solid ${T.border}`,
                background: active===s.id ? T.bg : 'none',
              }} onClick={()=>setActive(s.id)}>
                <span style={{fontSize:12,fontWeight:500,color:active===s.id?T.text:T.textDim,whiteSpace:'nowrap'}}>{s.title}</span>
                {sessions.length>1 && (
                  <button onClick={e=>{e.stopPropagation();closeSession(s.id)}} style={{
                    background:'none',border:'none',cursor:'pointer',color:T.textDim,padding:1,display:'flex',borderRadius:3,
                  }}
                    onMouseEnter={e=>e.currentTarget.style.color=T.textSub}
                    onMouseLeave={e=>e.currentTarget.style.color=T.textDim}
                  >×</button>
                )}
              </div>
            ))}
          </div>
          <div style={{padding:'0 10px',display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:9,height:9,borderRadius:'50%',background:'#ef4444'}}/>
            <span style={{width:9,height:9,borderRadius:'50%',background:T.yellow}}/>
            <span style={{width:9,height:9,borderRadius:'50%',background:T.green}}/>
          </div>
        </div>

        {/* Terminal body */}
        {sess && (
          <div style={{flex:1,overflowY:'auto',padding:'14px 16px',cursor:'text'}} onClick={()=>inputRef.current?.focus()}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:12.5,lineHeight:1.8}}>
              {sess.lines.slice(0,-1).map((line,i)=>(
                <div key={i} style={{
                  color: line.startsWith('bash:')||line.startsWith('Permission')
                    ? T.red
                    : line.startsWith('Connected')||line.startsWith('Ubuntu')
                    ? T.green
                    : line.startsWith(' *')||line==='Last login:'
                    ? T.textDim
                    : T.textSub,
                  whiteSpace:'pre-wrap',wordBreak:'break-all',
                }}>{line}</div>
              ))}
              <div style={{display:'flex',alignItems:'center',color:T.textSub,fontFamily:'JetBrains Mono,monospace',fontSize:12.5}}>
                <span style={{whiteSpace:'pre'}}>{sess.lines[sess.lines.length-1]}</span>
                <input ref={inputRef} value={sess.input} onChange={e=>updateInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit()}}}
                  style={{flex:1,background:'none',border:'none',outline:'none',color:T.text,fontFamily:'JetBrains Mono,monospace',fontSize:12.5,caretColor:T.green}}
                  spellCheck={false} autoCapitalize="off" autoCorrect="off"
                />
              </div>
              <div ref={bottomRef}/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
