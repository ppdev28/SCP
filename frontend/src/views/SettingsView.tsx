import { useState } from 'react'
import { T } from '../lib/tokens'
import { Card, CardHeader, Btn, Input } from '../components/ui'

const SECTIONS = ['General','Server','Users','Authentication','Notifications','Appearance','API','Docker','Monitoring']

function Field({ label, sub, children }:{ label:string; sub?:string; children:React.ReactNode }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'13px 18px',borderBottom:`1px solid ${T.borderMuted}`,gap:24}}>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:500,color:T.text}}>{label}</div>
        {sub && <div style={{fontSize:11,color:T.textDim,marginTop:2,lineHeight:1.5}}>{sub}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }:{ checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button onClick={()=>onChange(!checked)} style={{
      width:36,height:20,borderRadius:10,position:'relative',cursor:'pointer',border:'none',
      background:checked?T.accent:T.overlay,
      transition:'background 200ms',
    }}>
      <span style={{
        position:'absolute',top:3,left:checked?18:3,width:14,height:14,borderRadius:'50%',
        background:'#fff',transition:'left 180ms',
      }}/>
    </button>
  )
}

export default function SettingsView({ addToast }:{ addToast:(m:string,t:any)=>void }) {
  const [active, setActive] = useState('General')
  const [dark, setDark]     = useState(true)
  const [notifs, setNotifs] = useState(true)
  const [auto, setAuto]     = useState(false)
  const [compress, setCompress] = useState(true)
  const [hostname, setHostname] = useState('homelab-server')
  const [sshPort, setSshPort]   = useState('22')
  const [timezone, setTimezone] = useState('UTC')

  const save = () => addToast('Settings saved','success')

  return (
    <div style={{padding:'22px 24px',display:'flex',gap:24}}>
      {/* Left nav */}
      <div style={{width:180,flexShrink:0}}>
        <div style={{fontSize:11,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8,padding:'0 8px'}}>Settings</div>
        {SECTIONS.map(s=>(
          <button key={s} onClick={()=>setActive(s)} style={{
            display:'block',width:'100%',padding:'7px 10px',borderRadius:7,textAlign:'left',
            background:active===s?T.active:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:active===s?500:400,color:active===s?T.text:T.textSub,
            fontFamily:'Inter,sans-serif',
          }}
            onMouseEnter={e=>{if(active!==s)e.currentTarget.style.background=T.hover}}
            onMouseLeave={e=>{if(active!==s)e.currentTarget.style.background='none'}}
          >{s}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,maxWidth:680}}>
        <div style={{marginBottom:18}}>
          <h2 style={{fontSize:15,fontWeight:700,color:T.text,letterSpacing:'-0.01em'}}>{active}</h2>
        </div>

        {active==='General' && (
          <Card>
            <Field label="Server name" sub="Displayed in the header and used as the page title.">
              <Input value={hostname} onChange={setHostname} style={{width:200}}/>
            </Field>
            <Field label="Timezone" sub="Used for log timestamps and scheduled tasks.">
              <select value={timezone} onChange={e=>setTimezone(e.target.value)} style={{height:32,padding:'0 10px',background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontSize:12,outline:'none',fontFamily:'Inter,sans-serif'}}>
                {['UTC','America/New_York','Europe/London','Europe/Berlin','Asia/Tokyo'].map(tz=><option key={tz}>{tz}</option>)}
              </select>
            </Field>
            <Field label="Dark mode" sub="Server Control Center always uses a dark interface.">
              <Toggle checked={dark} onChange={setDark}/>
            </Field>
            <Field label="Notifications" sub="Enable in-app notifications and toasts.">
              <Toggle checked={notifs} onChange={setNotifs}/>
            </Field>
            <div style={{padding:'14px 18px',display:'flex',justifyContent:'flex-end'}}>
              <Btn onClick={save} variant="primary">Save changes</Btn>
            </div>
          </Card>
        )}

        {active==='Server' && (
          <Card>
            <Field label="SSH port" sub="Port used for SSH connections. Changes require a server restart.">
              <Input value={sshPort} onChange={setSshPort} style={{width:100}}/>
            </Field>
            <Field label="IP address" sub="Primary server IP address (read-only).">
              <span style={{fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>192.168.1.10</span>
            </Field>
            <Field label="Hostname" sub="System hostname as reported by the OS.">
              <Input value={hostname} onChange={setHostname} style={{width:200}}/>
            </Field>
            <div style={{padding:'14px 18px',display:'flex',justifyContent:'flex-end'}}>
              <Btn onClick={save} variant="primary">Save changes</Btn>
            </div>
          </Card>
        )}

        {active==='Docker' && (
          <Card>
            <Field label="Docker socket" sub="Path to the Docker daemon socket.">
              <span style={{fontSize:11,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>/var/run/docker.sock</span>
            </Field>
            <Field label="Pull timeout" sub="Maximum time in seconds to wait for image pulls.">
              <Input value="300" onChange={()=>{}} style={{width:80}}/>
            </Field>
            <Field label="Log compression" sub="Compress old log files to save disk space.">
              <Toggle checked={compress} onChange={setCompress}/>
            </Field>
            <Field label="Auto-prune" sub="Automatically remove unused images and volumes.">
              <Toggle checked={auto} onChange={setAuto}/>
            </Field>
            <div style={{padding:'14px 18px',display:'flex',justifyContent:'flex-end'}}>
              <Btn onClick={save} variant="primary">Save changes</Btn>
            </div>
          </Card>
        )}

        {active==='API' && (
          <Card>
            <CardHeader title="API tokens"/>
            <div style={{padding:'16px 18px'}}>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                {[
                  {name:'Monitoring agent', created:'Jan 1, 2024',last:'2 minutes ago'},
                  {name:'Backup script',    created:'Jan 5, 2024',last:'3 hours ago'},
                ].map(t=>(
                  <div key={t.name} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:T.bg,border:`1px solid ${T.border}`,borderRadius:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{t.name}</div>
                      <div style={{fontSize:11,color:T.textDim}}>Created {t.created} · Last used {t.last}</div>
                    </div>
                    <Btn size="xs" variant="danger" onClick={()=>addToast(`Token "${t.name}" revoked`,'error')}>Revoke</Btn>
                  </div>
                ))}
              </div>
              <Btn variant="secondary" onClick={()=>addToast('Token created — copy it now, it won\'t be shown again','success')}>Generate new token</Btn>
            </div>
          </Card>
        )}

        {!['General','Server','Docker','API'].includes(active) && (
          <Card style={{padding:'40px 24px',textAlign:'center'}}>
            <div style={{fontSize:13,color:T.textDim}}>Settings for <strong style={{color:T.textSub}}>{active}</strong> — coming soon</div>
          </Card>
        )}
      </div>
    </div>
  )
}
