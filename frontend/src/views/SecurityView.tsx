import { Shield, Lock, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react'
import { T } from '../lib/tokens'
import { Card, CardHeader, Btn, Th, Td } from '../components/ui'

const EVENTS = [
  { ts:'14:55:44', type:'error',   msg:'fail2ban: Banned 203.0.113.5 — 5 failed SSH attempts in 300s' },
  { ts:'14:38:15', type:'info',    msg:'sshd: Accepted publickey for admin from 192.168.1.42' },
  { ts:'13:12:02', type:'warn',    msg:'ufw: Blocked incoming connection on port 3306 from 45.83.64.1' },
  { ts:'12:00:00', type:'success', msg:'certbot: Certificate renewed for homelab.example.com' },
  { ts:'11:30:44', type:'error',   msg:'fail2ban: Banned 198.51.100.42 — 8 failed HTTP attempts' },
  { ts:'10:15:01', type:'info',    msg:'sshd: Accepted publickey for pepe from 192.168.1.42' },
]

const SESSIONS = [
  { user:'admin', from:'192.168.1.42', since:'14:38', method:'publickey', pid:'12441' },
  { user:'pepe',  from:'192.168.1.42', since:'10:15', method:'publickey', pid:'10882' },
]

const OPEN_PORTS = [22,80,443,3000,8080]

export default function SecurityView({ addToast }: { addToast:(m:string,t:any)=>void }) {
  const checks = [
    { label:'Firewall (ufw)',      ok:true,  detail:'Active · 12 rules' },
    { label:'SSH key auth only',   ok:true,  detail:'Password login disabled' },
    { label:'Root login disabled', ok:true,  detail:'PermitRootLogin no' },
    { label:'fail2ban',            ok:true,  detail:'Active · 2 bans today' },
    { label:'Auto security updates',ok:false,detail:'unattended-upgrades failed' },
    { label:'Open ports',          ok:null,  detail:`${OPEN_PORTS.length} ports exposed` },
  ]

  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Security</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Firewall, SSH, authentication, and security events.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Security checks */}
        <Card>
          <CardHeader title="Security posture"/>
          <div>
            {checks.map(c=>(
              <div key={c.label} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:`1px solid ${T.borderMuted}`}}>
                {c.ok===true  && <CheckCircle2 size={15} color={T.green}/>}
                {c.ok===false && <XCircle      size={15} color={T.red}/>}
                {c.ok===null  && <Info         size={15} color={T.yellow}/>}
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500,color:T.text}}>{c.label}</div>
                  <div style={{fontSize:11,color:T.textDim,marginTop:1}}>{c.detail}</div>
                </div>
                {c.ok===false && <Btn size="xs" variant="danger">Fix</Btn>}
              </div>
            ))}
          </div>
        </Card>

        {/* Active sessions */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card>
            <CardHeader title="Active SSH sessions"
              action={<Btn size="xs" variant="danger" onClick={()=>addToast('All sessions terminated','warning')}>Terminate all</Btn>}
            />
            {SESSIONS.map(s=>(
              <div key={s.pid} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:`1px solid ${T.borderMuted}`}}>
                <Lock size={13} color={T.green}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:'JetBrains Mono,monospace'}}>{s.user}@{s.from}</div>
                  <div style={{fontSize:11,color:T.textDim}}>Since {s.since} · {s.method} · PID {s.pid}</div>
                </div>
                <Btn size="xs" variant="ghost" onClick={()=>addToast(`Terminated session ${s.pid}`,'warning')}>Kill</Btn>
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader title="Firewall — ufw"/>
            <div style={{padding:'10px 16px',display:'flex',gap:10,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:`${T.green}12`,border:`1px solid ${T.green}28`,borderRadius:7}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:T.green}}/>
                <span style={{fontSize:12,fontWeight:600,color:T.green}}>Active</span>
              </div>
              <div style={{flex:1}}/>
              <Btn size="xs" variant="secondary" onClick={()=>addToast('Firewall configuration — coming soon','info')}>Manage rules</Btn>
            </div>
            <div style={{padding:'0 16px 12px'}}>
              {[
                ['22/tcp', 'ALLOW', 'SSH'],
                ['80/tcp', 'ALLOW', 'HTTP'],
                ['443/tcp','ALLOW', 'HTTPS'],
                ['Anywhere','DENY',  'All other incoming'],
              ].map(([port,action,desc])=>(
                <div key={port} style={{display:'flex',gap:10,padding:'5px 0',borderBottom:`1px solid ${T.borderMuted}`,fontSize:11,fontFamily:'JetBrains Mono,monospace'}}>
                  <span style={{color:T.textSub,width:70}}>{port}</span>
                  <span style={{color:action==='ALLOW'?T.green:T.red,width:48,fontWeight:600}}>{action}</span>
                  <span style={{color:T.textDim}}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Security events */}
        <Card style={{gridColumn:'1/-1'}}>
          <CardHeader title="Security events" sub="Last 24 hours"/>
          {EVENTS.map((e,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'9px 16px',borderBottom:i<EVENTS.length-1?`1px solid ${T.borderMuted}`:'none'}}>
              <span style={{
                fontSize:11,color:T.textDim,fontFamily:'JetBrains Mono,monospace',
                flexShrink:0,marginTop:1,width:48,
              }}>{e.ts}</span>
              {e.type==='error'   && <AlertTriangle size={13} color={T.red}    style={{flexShrink:0,marginTop:1}}/>}
              {e.type==='warn'    && <AlertTriangle size={13} color={T.yellow} style={{flexShrink:0,marginTop:1}}/>}
              {e.type==='success' && <CheckCircle2  size={13} color={T.green}  style={{flexShrink:0,marginTop:1}}/>}
              {e.type==='info'    && <Info          size={13} color={T.accent} style={{flexShrink:0,marginTop:1}}/>}
              <span style={{fontSize:12,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>{e.msg}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
