import { useState, useEffect } from "react";

const C = {
  bg:"#07070a", s1:"#0d0d12", s2:"#13131a", s3:"#1a1a24",
  bd:"#252535", bd2:"#2e2e42",
  tx:"#e8e8f0", t2:"#8888a0", t3:"#55556a",
  g:"#22d98a", r:"#f05a5a", y:"#f5c842", b:"#5b9ef5", p:"#c084fc", o:"#fb923c",
  mono:"'JetBrains Mono','Fira Mono',monospace",
  sans:"'DM Sans','Segoe UI',sans-serif",
};
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const PC = { alta:C.r, media:C.y, baja:C.b };
const PB = { alta:C.r+"15", media:C.y+"15", baja:C.b+"15" };
const MEDIOS = ["Efectivo","Mercado Pago","Banco"];
const MEDIO_C = { "Efectivo":C.g, "Mercado Pago":C.b, "Banco":C.p };

const FIJOS0 = [
  {id:"alquiler",    nombre:"Alquiler",               monto:6000000,  dia:1, prioridad:"alta",  tipo:"fijo"},
  {id:"sueldos_prod",nombre:"Sueldos Producción",     monto:4200000,  dia:5, prioridad:"alta",  tipo:"fijo"},
  {id:"seguro",      nombre:"Seguro",                 monto:1102416,  dia:3, prioridad:"alta",  tipo:"fijo"},
  {id:"sueldos_adm", nombre:"Sueldos Op/ADM",         monto:10300000, dia:5, prioridad:"alta",  tipo:"fijo"},
  {id:"sueldos_soc", nombre:"Sueldos Socios",         monto:13500000, dia:5, prioridad:"alta",  tipo:"fijo"},
  {id:"redes",       nombre:"Gastos Redes y VS",      monto:21000000, dia:7, prioridad:"media", tipo:"fijo"},
  {id:"mant_pers",   nombre:"Mant. Personal",         monto:1200000,  dia:7, prioridad:"media", tipo:"fijo"},
  {id:"emp_pastos",  nombre:"Empleados Fijos Pastos", monto:3750000,  dia:5, prioridad:"alta",  tipo:"fijo"},
];
const VARS0 = [
  {id:"pub_sab", nombre:"Públicas Sábado",    monto:0, dia:8,  prioridad:"alta",  tipo:"variable"},
  {id:"pub_vie", nombre:"Públicas Viernes",   monto:0, dia:8,  prioridad:"alta",  tipo:"variable"},
  {id:"pub_mas", nombre:"Públicas Master",    monto:0, dia:8,  prioridad:"alta",  tipo:"variable"},
  {id:"com_jt",  nombre:"Comisión Juan/Toto", monto:0, dia:9,  prioridad:"alta",  tipo:"variable"},
  {id:"com_san", nombre:"Comisión Santi B.",  monto:0, dia:9,  prioridad:"alta",  tipo:"variable"},
  {id:"prov_var",nombre:"Proveedores Varios", monto:0, dia:10, prioridad:"media", tipo:"variable"},
  {id:"cmv_prov",nombre:"CMV Proveedores",    monto:0, dia:10, prioridad:"media", tipo:"variable"},
];
const SEMANAS = [
  { id:"s1", label:"Semana 1", dias:[1,2,3,4,5,6,7],              color:C.b },
  { id:"s2", label:"Semana 2", dias:[8,9,10,11,12,13,14],          color:C.y },
  { id:"s3", label:"Semana 3", dias:[15,16,17,18,19,20,21],        color:C.g },
  { id:"s4", label:"Semana 4", dias:[22,23,24,25,26,27,28,29,30,31], color:C.p },
];

const f = (v) => {
  const a=Math.abs(Math.round(v||0)); const s=v<0?"-":"";
  if(a>=1e9) return s+"$"+(a/1e9).toFixed(1)+"B";
  if(a>=1e6) return s+"$"+(a/1e6).toFixed(1)+"M";
  if(a>=1e3) return s+"$"+Math.round(a/1e3)+"K";
  return s+"$"+a.toLocaleString("es-AR");
};
const bx = (x={}) => ({background:C.s1,border:"1px solid "+C.bd,borderRadius:12,padding:16,...x});
const parseV = (v) => Number(String(v).replace(/[^0-9]/g,""))||0;

export default function PagosDashboard() {
  const today = new Date();
  const [mes,      setMes]      = useState(today.getMonth());
  const [anio]                  = useState(today.getFullYear());
  const [efectivo, setEfectivo] = useState("");
  const [mp,       setMp]       = useState("");
  const [banco,    setBanco]    = useState("");
  const [fijos,    setFijos]    = useState(FIJOS0);
  const [variables,setVariables]= useState(VARS0);
  const [extras,   setExtras]   = useState([]);
  const [editId,   setEditId]   = useState(null);
  const [editVal,  setEditVal]  = useState("");
  const [editDia,  setEditDia]  = useState("");
  const [tab,      setTab]      = useState(0);
  const [newP,     setNewP]     = useState({nombre:"",monto:"",dia:"",prioridad:"media"});
  const [historial,setHistorial]= useState([]);
  const [medioSel, setMedioSel] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("rb_historial_pagos");
        if (r) setHistorial(JSON.parse(r.value));
      } catch(e) {}
      setLoading(false);
    })();
  }, []);

  const saveH = async (h) => {
    try { await window.storage.set("rb_historial_pagos", JSON.stringify(h)); } catch(e) {}
    setHistorial(h);
  };

  const saldoEf = parseV(efectivo);
  const saldoMP = parseV(mp);
  const saldoBa = parseV(banco);
  const saldoTotal = saldoEf + saldoMP + saldoBa;

  const todos = [...fijos,...variables.filter(v=>v.monto>0),...extras].sort((a,b)=>a.dia-b.dia);
  const pagadosIds = new Set(historial.filter(h=>h.mes===mes&&h.anio===anio).map(h=>h.pagoId));
  const totalPend  = todos.filter(p=>!pagadosIds.has(p.id)).reduce((s,p)=>s+p.monto,0);
  const totalPag   = todos.filter(p=> pagadosIds.has(p.id)).reduce((s,p)=>s+p.monto,0);
  const saldoTras  = saldoTotal - totalPend;

  const diasCal = [];
  let acum = saldoTotal;
  for(let d=1;d<=10;d++){
    const ph = todos.filter(p=>p.dia===d&&!pagadosIds.has(p.id));
    const th = ph.reduce((s,p)=>s+p.monto,0);
    acum -= th;
    if(ph.length>0) diasCal.push({dia:d,pagos:ph,total:th,saldoTras:acum});
  }

  const marcarPagado = async (p) => {
    if(pagadosIds.has(p.id)){
      await saveH(historial.filter(h=>!(h.pagoId===p.id&&h.mes===mes&&h.anio===anio)));
      return;
    }
    const medio = medioSel[p.id]||"Efectivo";
    await saveH([...historial,{
      id:Date.now(), pagoId:p.id, nombre:p.nombre, monto:p.monto,
      medio, dia:p.dia, mes, anio,
      fecha:today.toLocaleDateString("es-AR")
    }]);
  };

  const analisisSemanal = SEMANAS.map(sem => {
    const ph = historial.filter(h=>sem.dias.includes(h.dia));
    return {...sem, total:ph.reduce((s,h)=>s+h.monto,0), cantidad:ph.length, pagos:ph};
  });
  const maxT = Math.max(...analisisSemanal.map(s=>s.total),1);
  const semCritica = analisisSemanal.reduce((a,b)=>b.total>a.total?b:a, analisisSemanal[0]);
  const histMes = historial.filter(h=>h.mes===mes&&h.anio===anio).sort((a,b)=>a.dia-b.dia);

  const startEdit=(p)=>{setEditId(p.id);setEditVal(String(p.monto));setEditDia(String(p.dia));};
  const saveEdit=(lista,setL)=>{setL(lista.map(p=>p.id===editId?{...p,monto:Number(editVal),dia:Number(editDia)}:p));setEditId(null);};
  const addExtra=()=>{
    if(!newP.nombre||!newP.monto) return;
    setExtras([...extras,{id:"e_"+Date.now(),nombre:newP.nombre,monto:Number(newP.monto),dia:Number(newP.dia)||10,prioridad:newP.prioridad,tipo:"extra"}]);
    setNewP({nombre:"",monto:"",dia:"",prioridad:"media"});
  };

  const PagoRow = ({p,lista,setL}) => {
    const pagado=pagadosIds.has(p.id); const isE=editId===p.id; const pc=PC[p.prioridad];
    const medio=medioSel[p.id]||"Efectivo";
    return (
      <div style={{borderRadius:10,marginBottom:6,overflow:"hidden",border:"1px solid "+(pagado?C.bd:pc+"33"),opacity:pagado?0.6:1,transition:"all 0.2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:pagado?C.s2:PB[p.prioridad]}}>
          <div onClick={()=>marcarPagado(p)} style={{width:18,height:18,borderRadius:5,border:"2px solid "+(pagado?C.g:pc),
            background:pagado?C.g:"transparent",cursor:"pointer",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            {pagado&&<span style={{fontSize:10,color:"#000",fontWeight:700}}>✓</span>}
          </div>
          <div style={{width:26,height:26,borderRadius:6,background:C.s3,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontFamily:C.mono,color:C.t2}}>
            {isE?<input type="number" value={editDia} onChange={e=>setEditDia(e.target.value)}
              style={{width:26,background:"transparent",border:"none",color:C.y,fontFamily:C.mono,fontSize:11,textAlign:"center",outline:"none"}}/>:p.dia}
          </div>
          <div style={{flex:1,fontSize:13,color:pagado?C.t2:C.tx}}>
            {p.nombre}
            <span style={{marginLeft:5,fontSize:9,padding:"2px 4px",borderRadius:4,background:pc+"22",color:pc,fontFamily:C.mono}}>
              {p.tipo==="fijo"?"F":p.tipo==="variable"?"V":"E"}
            </span>
            {pagado&&<span style={{marginLeft:5,fontSize:10,color:MEDIO_C[historial.find(h=>h.pagoId===p.id&&h.mes===mes)?.medio]||C.g,fontFamily:C.mono}}>
              ✓ {historial.find(h=>h.pagoId===p.id&&h.mes===mes)?.medio}
            </span>}
          </div>
          {isE?(
            <div style={{display:"flex",gap:4}}>
              <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                style={{width:90,padding:"4px 8px",background:C.s2,border:"1px solid "+C.g,borderRadius:6,color:C.tx,fontFamily:C.mono,fontSize:12,outline:"none"}}/>
              <button onClick={()=>saveEdit(lista,setL)}
                style={{padding:"4px 8px",background:C.g+"22",color:C.g,border:"none",borderRadius:6,cursor:"pointer",fontFamily:C.mono,fontSize:12}}>OK</button>
            </div>
          ):(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontFamily:C.mono,fontSize:13,color:pagado?C.t2:C.tx,textDecoration:pagado?"line-through":"none"}}>{f(p.monto)}</span>
              {!pagado&&<button onClick={()=>startEdit(p)}
                style={{padding:"2px 7px",background:"transparent",color:C.t3,border:"1px solid "+C.bd,borderRadius:6,cursor:"pointer",fontSize:11}}>✎</button>}
            </div>
          )}
        </div>
        {!pagado&&(
          <div style={{display:"flex",gap:4,padding:"6px 10px",background:C.s2,borderTop:"1px solid "+C.bd}}>
            <span style={{fontSize:10,color:C.t3,fontFamily:C.mono,marginRight:4,alignSelf:"center"}}>Pagar con:</span>
            {MEDIOS.map(m=>(
              <button key={m} onClick={()=>setMedioSel({...medioSel,[p.id]:m})}
                style={{fontSize:10,padding:"3px 8px",borderRadius:6,cursor:"pointer",border:"none",fontFamily:C.mono,
                  background:medio===m?MEDIO_C[m]+"22":"transparent",
                  color:medio===m?MEDIO_C[m]:C.t3}}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.tx,fontFamily:C.sans}}>
      <div style={{background:C.s1,borderBottom:"1px solid "+C.bd,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:1}}>CAJA</span>
          <span style={{fontSize:11,color:C.t2,marginLeft:8,fontFamily:C.mono}}>PAGOS & DISPONIBILIDAD</span>
        </div>
        <select value={mes} onChange={e=>setMes(Number(e.target.value))}
          style={{padding:"6px 12px",background:C.s2,border:"1px solid "+C.bd,borderRadius:8,color:C.tx,fontFamily:C.mono,fontSize:12,outline:"none"}}>
          {MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div style={{padding:16,maxWidth:700,margin:"0 auto"}}>

        {/* DISPONIBILIDAD */}
        <div style={bx({marginBottom:16})}>
          <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,textTransform:"uppercase",marginBottom:12}}>💰 Disponibilidad</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            {[{l:"Efectivo",v:efectivo,sv:setEfectivo,c:C.g,ic:"💵"},
              {l:"Mercado Pago",v:mp,sv:setMp,c:C.b,ic:"💳"},
              {l:"Banco",v:banco,sv:setBanco,c:C.p,ic:"🏦"}].map(fi=>(
              <div key={fi.l} style={{flex:1,minWidth:130}}>
                <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:4,textTransform:"uppercase"}}>{fi.ic} {fi.l}</div>
                <input type="text" value={fi.v} placeholder="$0" onChange={e=>fi.sv(e.target.value)}
                  style={{width:"100%",padding:"10px 12px",background:C.s2,border:"1px solid "+fi.c+"44",borderRadius:10,
                    color:fi.c,fontFamily:C.mono,fontSize:15,fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          {saldoTotal>0&&(
            <>
              <div style={{height:8,borderRadius:6,overflow:"hidden",display:"flex",gap:2,marginBottom:6}}>
                {saldoEf>0&&<div style={{flex:saldoEf,background:C.g}}/>}
                {saldoMP>0&&<div style={{flex:saldoMP,background:C.b}}/>}
                {saldoBa>0&&<div style={{flex:saldoBa,background:C.p}}/>}
              </div>
              <div style={{display:"flex",gap:12,fontSize:11,fontFamily:C.mono,color:C.t2,marginBottom:14,flexWrap:"wrap"}}>
                {saldoEf>0&&<span><span style={{color:C.g}}>●</span> Ef {Math.round(saldoEf/saldoTotal*100)}% — {f(saldoEf)}</span>}
                {saldoMP>0&&<span><span style={{color:C.b}}>●</span> MP {Math.round(saldoMP/saldoTotal*100)}% — {f(saldoMP)}</span>}
                {saldoBa>0&&<span><span style={{color:C.p}}>●</span> Bco {Math.round(saldoBa/saldoTotal*100)}% — {f(saldoBa)}</span>}
              </div>
            </>
          )}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",paddingTop:12,borderTop:"1px solid "+C.bd}}>
            {[{l:"TOTAL DISPONIBLE",v:saldoTotal,c:C.g},{l:"PENDIENTE",v:totalPend,c:C.r},{l:"TRAS PAGOS",v:saldoTras,c:saldoTras>=0?C.g:C.r}].map((it,i,arr)=>(
              <div key={i} style={{display:"contents"}}>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.t2,fontFamily:C.mono}}>{it.l}</div>
                  <div style={{fontSize:18,fontFamily:C.mono,fontWeight:700,color:it.c}}>{f(it.v)}</div>
                </div>
                {i<arr.length-1&&<div style={{width:1,background:C.bd}}/>}
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:3,marginBottom:16}}>
          {["Calendario","Pagos","Historial","Análisis","Agregar"].map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"7px 0",borderRadius:8,fontSize:11,
              fontFamily:C.mono,cursor:"pointer",border:"none",
              background:tab===i?C.g+"22":C.s2,color:tab===i?C.g:C.t2,
              borderBottom:tab===i?"2px solid "+C.g:"2px solid transparent"}}>
              {t}
            </button>
          ))}
        </div>

        {/* CALENDARIO */}
        {tab===0&&(
          <div>
            <div style={{fontSize:12,color:C.t2,marginBottom:12,fontFamily:C.mono}}>Flujo — días 1 al 10 de {MESES[mes]}</div>
            {diasCal.length===0&&<div style={bx({textAlign:"center",padding:32})}><div style={{fontSize:14,color:C.t2}}>Sin pagos pendientes cargados</div></div>}
            {diasCal.map((d,i)=>(
              <div key={i} style={bx({marginBottom:10,borderColor:d.saldoTras<0?C.r+"44":C.bd})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:8,flexShrink:0,
                      background:d.saldoTras<0?C.r+"22":C.g+"22",border:"1px solid "+(d.saldoTras<0?C.r+"44":C.g+"44"),
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:16,fontWeight:700,fontFamily:C.mono,color:d.saldoTras<0?C.r:C.g}}>
                      {d.dia}
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.t2,fontFamily:C.mono}}>{MESES[mes].slice(0,3).toUpperCase()} {d.dia}</div>
                      <div style={{fontSize:13,color:C.r,fontFamily:C.mono,fontWeight:700}}>-{f(d.total)}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.t2,fontFamily:C.mono}}>SALDO DESPUÉS</div>
                    <div style={{fontSize:15,fontFamily:C.mono,fontWeight:700,color:d.saldoTras<0?C.r:C.g}}>{f(d.saldoTras)}</div>
                  </div>
                </div>
                {d.pagos.map((p,j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",borderRadius:6,marginBottom:3,background:PB[p.prioridad]}}>
                    <span style={{fontSize:12,color:C.tx}}>{p.nombre}</span>
                    <span style={{fontSize:12,fontFamily:C.mono,color:PC[p.prioridad]}}>{f(p.monto)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* PAGOS */}
        {tab===1&&(
          <div>
            <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,marginBottom:8}}>FIJOS — {MESES[mes]}</div>
            {fijos.map(p=><PagoRow key={p.id} p={p} lista={fijos} setL={setFijos}/>)}
            <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,margin:"16px 0 8px"}}>VARIABLES</div>
            {variables.map(p=><PagoRow key={p.id} p={p} lista={variables} setL={setVariables}/>)}
            {extras.length>0&&<>
              <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,margin:"16px 0 8px"}}>EXTRAS</div>
              {extras.map(p=><PagoRow key={p.id} p={p} lista={extras} setL={setExtras}/>)}
            </>}
          </div>
        )}

        {/* HISTORIAL */}
        {tab===2&&(
          <div>
            <div style={{fontSize:12,color:C.t2,marginBottom:12,fontFamily:C.mono}}>
              {MESES[mes]} {anio} — {histMes.length} pagos — {f(histMes.reduce((s,h)=>s+h.monto,0))}
            </div>
            {loading&&<div style={{color:C.t2,textAlign:"center",padding:20}}>Cargando...</div>}
            {!loading&&histMes.length===0&&<div style={bx({textAlign:"center",padding:32})}><div style={{fontSize:14,color:C.t2}}>Sin pagos registrados este mes</div></div>}
            {histMes.map((h,i)=>(
              <div key={i} style={bx({marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"})}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:26,height:26,borderRadius:6,background:C.s3,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontFamily:C.mono,color:C.t2,flexShrink:0}}>{h.dia}</div>
                  <div>
                    <div style={{fontSize:13,color:C.tx}}>{h.nombre}</div>
                    <div style={{fontSize:11,fontFamily:C.mono,color:MEDIO_C[h.medio]||C.t2}}>{h.medio} · {h.fecha}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:C.mono,fontSize:13,color:C.g}}>{f(h.monto)}</span>
                  <button onClick={async()=>await saveH(historial.filter(x=>x.id!==h.id))}
                    style={{background:"transparent",color:C.t3,border:"1px solid "+C.bd,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:11}}>x</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANÁLISIS SEMANAL */}
        {tab===3&&(
          <div>
            <div style={{fontSize:12,color:C.t2,marginBottom:12,fontFamily:C.mono}}>Análisis semanal — histórico acumulado de todos los meses</div>
            {semCritica.total>0&&(
              <div style={bx({marginBottom:16,borderColor:C.r+"44",background:C.r+"08"})}>
                <div style={{fontSize:11,color:C.r,fontFamily:C.mono,marginBottom:4}}>⚠ SEMANA MÁS CRÍTICA</div>
                <div style={{fontSize:16,fontWeight:700}}>{semCritica.label}</div>
                <div style={{fontSize:13,color:C.r,fontFamily:C.mono,marginTop:2}}>{f(semCritica.total)} en {semCritica.cantidad} pagos</div>
                <div style={{fontSize:12,color:C.t2,marginTop:4}}>Días {semCritica.dias[0]}–{semCritica.dias[semCritica.dias.length-1]} — mayor concentración de egresos histórica</div>
              </div>
            )}
            {analisisSemanal.map((sem,i)=>{
              const pct=maxT>0?sem.total/maxT:0;
              const critica=sem.id===semCritica.id&&sem.total>0;
              return (
                <div key={i} style={bx({marginBottom:10,borderColor:critica?sem.color+"44":C.bd})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <span style={{fontSize:13,fontWeight:600,color:sem.color}}>{sem.label}</span>
                      {critica&&<span style={{marginLeft:8,fontSize:9,fontFamily:C.mono,color:C.r,background:C.r+"22",padding:"2px 6px",borderRadius:4}}>CRÍTICA</span>}
                      <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,marginTop:2}}>Días {sem.dias[0]}–{sem.dias[sem.dias.length-1]}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontFamily:C.mono,fontWeight:700,color:sem.color}}>{f(sem.total)}</div>
                      <div style={{fontSize:11,color:C.t2,fontFamily:C.mono}}>{sem.cantidad} pagos hist.</div>
                    </div>
                  </div>
                  <div style={{height:8,background:C.s2,borderRadius:6,overflow:"hidden",marginBottom:8}}>
                    <div style={{width:Math.max(pct*100,2)+"%",height:"100%",background:sem.color,borderRadius:6,transition:"width 0.5s"}}/>
                  </div>
                  {sem.pagos.length>0&&(
                    Object.entries(sem.pagos.reduce((acc,h)=>{acc[h.nombre]=(acc[h.nombre]||0)+h.monto;return acc},{}))
                      .sort((a,b)=>b[1]-a[1]).slice(0,4).map(([nombre,monto],j)=>(
                      <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid "+C.s2}}>
                        <span style={{color:C.t2}}>{nombre}</span>
                        <span style={{fontFamily:C.mono,color:C.tx}}>{f(monto)}</span>
                      </div>
                    ))
                  )}
                  {sem.pagos.length===0&&<div style={{fontSize:12,color:C.t3}}>Sin registros históricos aún</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* AGREGAR */}
        {tab===4&&(
          <div style={bx()}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Agregar Pago Extra</div>
            {[{l:"Concepto",k:"nombre",t:"text",ph:"Ej: Proveedor Branca"},
              {l:"Monto ($)",k:"monto",t:"number",ph:"0"},
              {l:"Día de pago",k:"dia",t:"number",ph:"10"}].map(fi=>(
              <div key={fi.k} style={{marginBottom:8}}>
                <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:3,textTransform:"uppercase"}}>{fi.l}</div>
                <input type={fi.t} value={newP[fi.k]} placeholder={fi.ph}
                  onChange={e=>setNewP({...newP,[fi.k]:e.target.value})}
                  style={{width:"100%",padding:"8px 10px",background:C.s2,border:"1px solid "+C.bd,borderRadius:8,
                    color:C.tx,fontFamily:C.mono,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:4,textTransform:"uppercase"}}>Prioridad</div>
              <div style={{display:"flex",gap:8}}>
                {["alta","media","baja"].map(pr=>(
                  <button key={pr} onClick={()=>setNewP({...newP,prioridad:pr})}
                    style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontFamily:C.mono,cursor:"pointer",border:"none",
                      background:newP.prioridad===pr?PC[pr]+"22":C.s2,color:newP.prioridad===pr?PC[pr]:C.t2}}>
                    {pr.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addExtra} style={{width:"100%",padding:"12px 0",borderRadius:10,fontSize:14,
              fontFamily:C.mono,cursor:"pointer",border:"none",background:C.g+"22",color:C.g,fontWeight:700}}>
              + Agregar Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
