import { T } from '../lib/tokens'
import { Card, CardHeader, Th, Td } from '../components/ui'

const INTERFACES = [
  { name:'eth0',    ip:'192.168.1.10',  mac:'b8:27:eb:4c:a2:11', state:'UP',   speed:'1 Gbps', rx:'142.4 GB', tx:'38.1 GB' },
  { name:'docker0', ip:'172.17.0.1',    mac:'02:42:a7:b1:c3:44', state:'UP',   speed:'N/A',    rx:'8.2 GB',   tx:'12.4 GB' },
  { name:'lo',      ip:'127.0.0.1',     mac:'—',                  state:'UP',   speed:'N/A',    rx:'1.1 GB',   tx:'1.1 GB'  },
]

const PORTS = [
  { port:22,   proto:'TCP', process:'sshd',    container:'Host',   addr:'0.0.0.0', state:'LISTEN' },
  { port:80,   proto:'TCP', process:'nginx',   container:'nginx',  addr:'0.0.0.0', state:'LISTEN' },
  { port:443,  proto:'TCP', process:'nginx',   container:'nginx',  addr:'0.0.0.0', state:'LISTEN' },
  { port:3000, proto:'TCP', process:'grafana', container:'grafana',addr:'0.0.0.0', state:'LISTEN' },
  { port:5432, proto:'TCP', process:'postgres',container:'postgres',addr:'172.17.0.3',state:'LISTEN' },
  { port:6379, proto:'TCP', process:'redis',   container:'redis',  addr:'172.17.0.4',state:'LISTEN' },
  { port:8080, proto:'TCP', process:'nextcloud',container:'nextcloud',addr:'0.0.0.0',state:'LISTEN' },
  { port:9090, proto:'TCP', process:'prometheus',container:'Host', addr:'127.0.0.1',state:'LISTEN' },
]

function TopoNode({ label, sub, color=T.border }:{label:string;sub?:string;color?:string}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      <div style={{padding:'8px 16px',background:T.raised,border:`1px solid ${color}`,borderRadius:8,textAlign:'center',minWidth:120}}>
        <div style={{fontSize:12,fontWeight:600,color:T.text}}>{label}</div>
        {sub&&<div style={{fontSize:10,color:T.textDim,fontFamily:'JetBrains Mono,monospace',marginTop:2}}>{sub}</div>}
      </div>
    </div>
  )
}

function Arrow() {
  return <div style={{width:1,height:20,background:T.borderStrong,margin:'0 auto'}}/>
}

export default function NetworkView() {
  return (
    <div style={{padding:'22px 24px'}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:17,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>Network</h1>
        <p style={{fontSize:12,color:T.textDim,marginTop:2}}>Interfaces, open ports, and network topology.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:14}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Interfaces */}
          <Card>
            <CardHeader title="Network interfaces"/>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:T.bg}}>
                <Th>Interface</Th><Th mono>IP address</Th><Th mono>MAC</Th><Th>State</Th><Th>Speed</Th><Th mono right>RX</Th><Th mono right>TX</Th>
              </tr></thead>
              <tbody>
                {INTERFACES.map(iface=>(
                  <tr key={iface.name}>
                    <Td><span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,color:T.text,fontSize:12}}>{iface.name}</span></Td>
                    <Td mono dim>{iface.ip}</Td>
                    <Td mono dim>{iface.mac}</Td>
                    <Td>
                      <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:T.green,flexShrink:0}}/>
                        <span style={{fontSize:11,fontWeight:600,color:T.green}}>{iface.state}</span>
                      </span>
                    </Td>
                    <Td dim>{iface.speed}</Td>
                    <Td mono dim right>{iface.rx}</Td>
                    <Td mono dim right>{iface.tx}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Open ports */}
          <Card>
            <CardHeader title="Open ports"/>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:T.bg}}>
                <Th mono>Port</Th><Th>Proto</Th><Th>Process</Th><Th>Container</Th><Th mono>Address</Th><Th>State</Th>
              </tr></thead>
              <tbody>
                {PORTS.map(p=>(
                  <tr key={`${p.port}-${p.process}`}>
                    <Td mono><span style={{fontWeight:700,color:T.accent}}>{p.port}</span></Td>
                    <Td dim>{p.proto}</Td>
                    <Td dim>{p.process}</Td>
                    <Td dim>{p.container}</Td>
                    <Td mono dim>{p.addr}</Td>
                    <Td><span style={{fontSize:11,fontWeight:600,color:T.green}}>{p.state}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Topology */}
        <Card>
          <CardHeader title="Topology"/>
          <div style={{padding:'20px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
            <TopoNode label="Internet" color={T.borderStrong}/>
            <Arrow/><TopoNode label="Router" sub="192.168.1.1"/>
            <Arrow/><TopoNode label="homelab-server" sub="192.168.1.10" color={T.accent}/>
            <Arrow/>
            <div style={{width:'100%',border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 12px',background:T.bg}}>
              <div style={{fontSize:10,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Docker bridge</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {['nginx · 172.17.0.2','postgres · 172.17.0.3','redis · 172.17.0.4','nextcloud · 172.17.0.5','grafana · 172.17.0.6'].map(c=>(
                  <div key={c} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:T.raised,borderRadius:5,border:`1px solid ${T.border}`}}>
                    <span style={{width:5,height:5,borderRadius:'50%',background:T.green,flexShrink:0}}/>
                    <span style={{fontSize:11,color:T.textSub,fontFamily:'JetBrains Mono,monospace'}}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
