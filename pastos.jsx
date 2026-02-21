import { useState } from "react";

const C = {
  bg:"#07070a", s1:"#0d0d12", s2:"#13131a", s3:"#1a1a24",
  bd:"#252535", bd2:"#2e2e42",
  tx:"#e8e8f0", t2:"#8888a0", t3:"#55556a",
  g:"#22d98a", r:"#f05a5a", y:"#f5c842", b:"#5b9ef5", p:"#c084fc", o:"#fb923c",
  mono:"'JetBrains Mono','Fira Mono',monospace",
  sans:"'DM Sans','Segoe UI',sans-serif",
};

const FECHAS = [
  {num:1, label:"07/03"},{num:2, label:"14/03"},{num:3, label:"21/03"},
  {num:4, label:"28/03"},{num:5, label:"04/04"},{num:6, label:"11/04"},
  {num:7, label:"18/04"},{num:8, label:"25/04"},{num:9, label:"02/05"},
  {num:10,label:"09/05"},{num:11,label:"16/05"},{num:12,label:"23/05"},
  {num:13,label:"30/05"},{num:14,label:"06/06"},
];

const INGRESO_CONCEPTOS = [
  "Barra MP","Barra Efectivo","Estacionamiento Efectivo",
  "Estacionamiento Transf.","Equipos","Torneo de Truco","Amistosos","Padel"
];

const EGRESO_SECCIONES = [
  {
    id:"empleados", label:"Empleados", color:"#f05a5a",
    conceptos:["Alcanza Pelotas","Árbitros","Bartender","Caja","Cocina","Empleados Fijos","Encargado","Estacionamiento","Planilleros","Runner"]
  },
  {
    id:"mercaderia", label:"Mercadería", color:"#fb923c",
    conceptos:["Bebidas","Almacén Mayorista","Campo","Hielo","Frutas","Verdulería","Panadería","Extras Almacén"]
  },
  {
    id:"varios", label:"Varios", color:"#f5c842",
    conceptos:["Ambulancia","Chiqui + Reparaciones","Filmaker/Fotógrafo","Publicidad","Otros Varios"]
  },
  {
    id:"redes", label:"Gs. Redes", color:"#c084fc",
    conceptos:["Redes Sociales","Diseño","Fotografía Promo","Marketing Digital"]
  },
];

const ESCENARIOS = [
  {label:"100%",pct:1.0,color:"#22d98a"},
  {label:"90%", pct:0.9,color:"#5b9ef5"},
  {label:"80%", pct:0.8,color:"#f5c842"},
  {label:"70%", pct:0.7,color:"#fb923c"},
  {label:"60%", pct:0.6,color:"#f05a5a"},
];

const ING_BASE = {
  "Barra":71620087,"Estacionamiento":21166914,
  "Equipos":120300000,"Amistosos":255000,"Padel":0,"Torneo de Truco":0,
};
const EGR_BASE = {
  "Gs. Empleados":43201315,"Gs. Mercadería e insumos":35100000,
  "Gs. Varios":46596420,"Gs. Filmaker y fotógrafo":10400000,
};

const f = (v) => {
  const a=Math.abs(Math.round(v||0)); const s=v<0?"-":"";
  if(a>=1e9) return s+"$"+(a/1e9).toFixed(1)+"B";
  if(a>=1e6) return s+"$"+(a/1e6).toFixed(1)+"M";
  if(a>=1e3) return s+"$"+Math.round(a/1e3)+"K";
  return s+"$"+a.toLocaleString("es-AR");
};
const bx = (x={}) => ({background:C.s1,border:"1px solid "+C.bd,borderRadius:12,padding:16,...x});

const initGrid = (conceptos) => {
  const g={};
  conceptos.forEach(c=>{g[c]={};FECHAS.forEach(f=>{g[c][f.num]="";});});
  return g;
};

const initAllEgr = () => {
  const g={};
  EGRESO_SECCIONES.forEach(sec=>sec.conceptos.forEach(c=>{
    g[c]={};FECHAS.forEach(f=>{g[c][f.num]="";});
  }));
  return g;
};

export default function PastosDashboard() {
  const [tab,      setTab]      = useState(0);
  const [ingresos, setIngresos] = useState(initGrid(INGRESO_CONCEPTOS));
  const [egresos,  setEgresos]  = useState(initAllEgr());
  const [fechaSel, setFechaSel] = useState(1);
  const [escSel,   setEscSel]   = useState(0);
  const [egrTab,   setEgrTab]   = useState("empleados");

  const setVal = (grid, setGrid, conc, fn, val) =>
    setGrid(prev=>({...prev,[conc]:{...prev[conc],[fn]:val}}));
  const getNum = (grid, conc, fn) => parseFloat(grid[conc]?.[fn])||0;
  const totalConcepto = (grid, conc) => FECHAS.reduce((s,f)=>s+getNum(grid,conc,f.num),0);

  const ALL_EGR_CONC = EGRESO_SECCIONES.flatMap(s=>s.conceptos);
  const totalIngFecha = (fn) => INGRESO_CONCEPTOS.reduce((s,c)=>s+getNum(ingresos,c,fn),0);
  const totalEgrFecha = (fn) => ALL_EGR_CONC.reduce((s,c)=>s+getNum(egresos,c,fn),0);
  const totalSecFecha = (sec, fn) => sec.conceptos.reduce((s,c)=>s+getNum(egresos,c,fn),0);
  const resultFecha   = (fn) => totalIngFecha(fn)-totalEgrFecha(fn);
  const totalIngAnual = FECHAS.reduce((s,f)=>s+totalIngFecha(f.num),0);
  const totalEgrAnual = FECHAS.reduce((s,f)=>s+totalEgrFecha(f.num),0);
  const resultAnual   = totalIngAnual-totalEgrAnual;

  const secActual = EGRESO_SECCIONES.find(s=>s.id===egrTab);

  // Grilla genérica para ingresos o egresos
  const GrillaConceptos = ({conceptos, grid, setGrid, totalColor, headerColor}) => (
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",fontFamily:C.mono,fontSize:11,minWidth:800}}>
        <thead>
          <tr>
            <th style={{padding:"6px 10px",textAlign:"left",color:C.t2,borderBottom:"1px solid "+C.bd,minWidth:160}}>Concepto</th>
            {FECHAS.map(f=>(
              <th key={f.num} style={{padding:"6px 8px",textAlign:"right",color:C.y,borderBottom:"1px solid "+C.bd,minWidth:78}}>{f.label}</th>
            ))}
            <th style={{padding:"6px 8px",textAlign:"right",color:totalColor,borderBottom:"1px solid "+C.bd}}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {conceptos.map((conc,i)=>(
            <tr key={i} style={{background:i%2===0?C.s2:"transparent"}}>
              <td style={{padding:"6px 10px",color:C.tx}}>{conc}</td>
              {FECHAS.map(fecha=>(
                <td key={fecha.num} style={{padding:"3px 4px"}}>
                  <input type="number" value={grid[conc]?.[fecha.num]??""} placeholder="0"
                    onChange={e=>setVal(grid,setGrid,conc,fecha.num,e.target.value)}
                    style={{width:74,padding:"4px 6px",background:C.s3,border:"1px solid "+C.bd,
                      borderRadius:4,color:C.tx,fontFamily:C.mono,fontSize:11,outline:"none",textAlign:"right"}}/>
                </td>
              ))}
              <td style={{padding:"6px 8px",textAlign:"right",color:totalColor,fontWeight:700}}>
                {f(totalConcepto(grid,conc))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{borderTop:"2px solid "+C.bd}}>
            <td style={{padding:"8px 10px",fontWeight:700,color:totalColor}}>TOTAL</td>
            {FECHAS.map(fecha=>(
              <td key={fecha.num} style={{padding:"8px 8px",textAlign:"right",color:totalColor,fontWeight:700}}>
                {conceptos.reduce((s,c)=>s+getNum(grid,c,fecha.num),0)>0
                  ? f(conceptos.reduce((s,c)=>s+getNum(grid,c,fecha.num),0)):"—"}
              </td>
            ))}
            <td style={{padding:"8px 8px",textAlign:"right",color:totalColor,fontWeight:700}}>
              {f(conceptos.reduce((s,c)=>s+totalConcepto(grid,c),0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.tx,fontFamily:C.sans}}>
      {/* HEADER */}
      <div style={{background:C.s1,borderBottom:"1px solid "+C.bd,padding:"14px 20px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:1,color:C.g}}>PASTOS</span>
          <span style={{fontSize:11,color:C.t2,marginLeft:8,fontFamily:C.mono}}>TORNEO APERTURA 2026 — 14 FECHAS</span>
        </div>
        <div style={{fontSize:12,fontFamily:C.mono,color:C.t2}}>
          Resultado: <span style={{color:resultAnual>=0?C.g:C.r,fontWeight:700}}>{f(resultAnual)}</span>
        </div>
      </div>

      <div style={{padding:16,maxWidth:960,margin:"0 auto"}}>

        {/* KPIs */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
          {[
            {l:"Ingresos",    v:totalIngAnual, c:C.g},
            {l:"Egresos",     v:totalEgrAnual, c:C.r},
            {l:"Resultado",   v:resultAnual,   c:resultAnual>=0?C.g:C.r},
            {l:"Fechas carg.",v:FECHAS.filter(f=>totalIngFecha(f.num)>0||totalEgrFecha(f.num)>0).length+" / 14",c:C.b,raw:true},
          ].map((k,i)=>(
            <div key={i} style={bx({flex:1,minWidth:120,textAlign:"center"})}>
              <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:4,textTransform:"uppercase"}}>{k.l}</div>
              <div style={{fontSize:17,fontFamily:C.mono,fontWeight:700,color:k.c}}>{k.raw?k.v:f(k.v)}</div>
            </div>
          ))}
          {/* Mini breakdown egresos */}
          {EGRESO_SECCIONES.map(sec=>(
            <div key={sec.id} style={bx({flex:1,minWidth:120,textAlign:"center"})}>
              <div style={{fontSize:10,fontFamily:C.mono,marginBottom:4,textTransform:"uppercase",color:sec.color}}>{sec.label}</div>
              <div style={{fontSize:15,fontFamily:C.mono,fontWeight:700,color:sec.color}}>
                {f(sec.conceptos.reduce((s,c)=>s+totalConcepto(egresos,c),0))}
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:3,marginBottom:16,flexWrap:"wrap"}}>
          {["Resumen","Ingresos","Egresos","Por Fecha","Escenarios"].map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{flex:1,minWidth:80,padding:"7px 0",borderRadius:8,
              fontSize:11,fontFamily:C.mono,cursor:"pointer",border:"none",
              background:tab===i?C.g+"22":C.s2,color:tab===i?C.g:C.t2,
              borderBottom:tab===i?"2px solid "+C.g:"2px solid transparent"}}>
              {t}
            </button>
          ))}
        </div>

        {/* RESUMEN */}
        {tab===0&&(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:C.mono,fontSize:12}}>
              <thead>
                <tr>
                  <th style={{padding:"8px 12px",textAlign:"left",color:C.t2,borderBottom:"1px solid "+C.bd}}>Fecha</th>
                  <th style={{padding:"8px 12px",textAlign:"right",color:C.g,borderBottom:"1px solid "+C.bd}}>Ingresos</th>
                  {EGRESO_SECCIONES.map(s=>(
                    <th key={s.id} style={{padding:"8px 8px",textAlign:"right",color:s.color,borderBottom:"1px solid "+C.bd}}>{s.label}</th>
                  ))}
                  <th style={{padding:"8px 12px",textAlign:"right",color:C.r,borderBottom:"1px solid "+C.bd}}>Total Egr.</th>
                  <th style={{padding:"8px 12px",textAlign:"right",color:C.tx,borderBottom:"1px solid "+C.bd}}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {FECHAS.map((fecha,i)=>{
                  const ing=totalIngFecha(fecha.num);
                  const egr=totalEgrFecha(fecha.num);
                  const res=ing-egr;
                  const activa=ing>0||egr>0;
                  return (
                    <tr key={i} style={{opacity:activa?1:0.35,background:i%2===0?C.s2:"transparent"}}>
                      <td style={{padding:"7px 12px",color:C.tx}}>
                        <span style={{color:C.y,marginRight:6}}>{fecha.num}°</span>{fecha.label}
                      </td>
                      <td style={{padding:"7px 12px",textAlign:"right",color:C.g}}>{ing>0?f(ing):"—"}</td>
                      {EGRESO_SECCIONES.map(sec=>(
                        <td key={sec.id} style={{padding:"7px 8px",textAlign:"right",color:sec.color}}>
                          {totalSecFecha(sec,fecha.num)>0?f(totalSecFecha(sec,fecha.num)):"—"}
                        </td>
                      ))}
                      <td style={{padding:"7px 12px",textAlign:"right",color:C.r}}>{egr>0?f(egr):"—"}</td>
                      <td style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:res>=0?C.g:C.r}}>{activa?f(res):"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{borderTop:"2px solid "+C.bd}}>
                  <td style={{padding:"10px 12px",fontWeight:700,color:C.tx}}>TOTAL</td>
                  <td style={{padding:"10px 12px",textAlign:"right",color:C.g,fontWeight:700}}>{f(totalIngAnual)}</td>
                  {EGRESO_SECCIONES.map(sec=>(
                    <td key={sec.id} style={{padding:"10px 8px",textAlign:"right",color:sec.color,fontWeight:700}}>
                      {f(sec.conceptos.reduce((s,c)=>s+totalConcepto(egresos,c),0))}
                    </td>
                  ))}
                  <td style={{padding:"10px 12px",textAlign:"right",color:C.r,fontWeight:700}}>{f(totalEgrAnual)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:resultAnual>=0?C.g:C.r}}>{f(resultAnual)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* INGRESOS */}
        {tab===1&&(
          <div>
            <div style={{fontSize:12,color:C.t2,fontFamily:C.mono,marginBottom:12}}>Ingresos por concepto y fecha</div>
            <GrillaConceptos conceptos={INGRESO_CONCEPTOS} grid={ingresos} setGrid={setIngresos} totalColor={C.g}/>
          </div>
        )}

        {/* EGRESOS */}
        {tab===2&&(
          <div>
            {/* Sub-tabs secciones */}
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {EGRESO_SECCIONES.map(sec=>(
                <button key={sec.id} onClick={()=>setEgrTab(sec.id)}
                  style={{flex:1,minWidth:100,padding:"8px 0",borderRadius:8,fontSize:12,fontFamily:C.mono,
                    cursor:"pointer",border:"none",
                    background:egrTab===sec.id?sec.color+"22":C.s2,
                    color:egrTab===sec.id?sec.color:C.t2,
                    borderBottom:egrTab===sec.id?"2px solid "+sec.color:"2px solid transparent"}}>
                  {sec.label}
                  <div style={{fontSize:10,marginTop:2,fontFamily:C.mono}}>
                    {f(sec.conceptos.reduce((s,c)=>s+totalConcepto(egresos,c),0))}
                  </div>
                </button>
              ))}
            </div>
            {secActual&&(
              <div>
                <div style={{fontSize:12,marginBottom:12,fontFamily:C.mono,color:secActual.color}}>
                  {secActual.label} — detalle por fecha
                </div>
                <GrillaConceptos conceptos={secActual.conceptos} grid={egresos} setGrid={setEgresos} totalColor={secActual.color}/>
              </div>
            )}
          </div>
        )}

        {/* POR FECHA */}
        {tab===3&&(
          <div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
              {FECHAS.map(f=>(
                <button key={f.num} onClick={()=>setFechaSel(f.num)}
                  style={{padding:"5px 10px",borderRadius:7,fontSize:11,fontFamily:C.mono,cursor:"pointer",border:"none",
                    background:fechaSel===f.num?C.y+"22":C.s2,color:fechaSel===f.num?C.y:C.t2,
                    borderBottom:fechaSel===f.num?"2px solid "+C.y:"2px solid transparent"}}>
                  {f.num}° {f.label}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {/* Ingresos */}
              <div style={bx({flex:1,minWidth:220})}>
                <div style={{fontSize:11,color:C.g,fontFamily:C.mono,marginBottom:12,textTransform:"uppercase"}}>Ingresos</div>
                {INGRESO_CONCEPTOS.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                    <span style={{fontSize:11,color:C.t2}}>{c}</span>
                    <input type="number" value={ingresos[c]?.[fechaSel]??""} placeholder="0"
                      onChange={e=>setVal(ingresos,setIngresos,c,fechaSel,e.target.value)}
                      style={{width:100,padding:"4px 7px",background:C.s2,border:"1px solid "+C.bd,
                        borderRadius:6,color:C.g,fontFamily:C.mono,fontSize:11,outline:"none",textAlign:"right"}}/>
                  </div>
                ))}
                <div style={{borderTop:"1px solid "+C.bd,paddingTop:8,marginTop:8,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontFamily:C.mono,fontSize:13,fontWeight:700,color:C.g}}>TOTAL</span>
                  <span style={{fontFamily:C.mono,fontSize:13,fontWeight:700,color:C.g}}>{f(totalIngFecha(fechaSel))}</span>
                </div>
              </div>

              {/* Egresos por sección */}
              <div style={{flex:2,minWidth:300,display:"flex",flexDirection:"column",gap:10}}>
                {EGRESO_SECCIONES.map(sec=>(
                  <div key={sec.id} style={bx()}>
                    <div style={{fontSize:11,fontFamily:C.mono,marginBottom:10,textTransform:"uppercase",color:sec.color}}>{sec.label}</div>
                    {sec.conceptos.map((c,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:11,color:C.t2}}>{c}</span>
                        <input type="number" value={egresos[c]?.[fechaSel]??""} placeholder="0"
                          onChange={e=>setVal(egresos,setEgresos,c,fechaSel,e.target.value)}
                          style={{width:100,padding:"4px 7px",background:C.s2,border:"1px solid "+C.bd,
                            borderRadius:6,color:sec.color,fontFamily:C.mono,fontSize:11,outline:"none",textAlign:"right"}}/>
                      </div>
                    ))}
                    <div style={{borderTop:"1px solid "+C.bd,paddingTop:7,marginTop:6,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:C.mono,fontSize:12,fontWeight:700,color:sec.color}}>Subtotal</span>
                      <span style={{fontFamily:C.mono,fontSize:12,fontWeight:700,color:sec.color}}>{f(totalSecFecha(sec,fechaSel))}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resultado */}
              <div style={bx({minWidth:160,textAlign:"center",alignSelf:"flex-start"})}>
                <div style={{fontSize:11,color:C.t2,fontFamily:C.mono,marginBottom:16,textTransform:"uppercase"}}>Fecha {fechaSel}</div>
                <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:3}}>INGRESOS</div>
                <div style={{fontSize:16,color:C.g,fontFamily:C.mono,fontWeight:700,marginBottom:12}}>{f(totalIngFecha(fechaSel))}</div>
                <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:3}}>EGRESOS</div>
                <div style={{fontSize:16,color:C.r,fontFamily:C.mono,fontWeight:700,marginBottom:12}}>{f(totalEgrFecha(fechaSel))}</div>
                <div style={{borderTop:"1px solid "+C.bd,paddingTop:10}}>
                  <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:4}}>RESULTADO</div>
                  <div style={{fontSize:22,fontFamily:C.mono,fontWeight:700,color:resultFecha(fechaSel)>=0?C.g:C.r}}>
                    {f(resultFecha(fechaSel))}
                  </div>
                  {totalIngFecha(fechaSel)>0&&(
                    <div style={{fontSize:12,color:C.b,fontFamily:C.mono,marginTop:6}}>
                      {Math.round(resultFecha(fechaSel)/totalIngFecha(fechaSel)*100)}% margen
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ESCENARIOS */}
        {tab===4&&(
          <div>
            <div style={{fontSize:12,color:C.t2,fontFamily:C.mono,marginBottom:16}}>Proyección temporada completa</div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {ESCENARIOS.map((e,i)=>(
                <button key={i} onClick={()=>setEscSel(i)}
                  style={{flex:1,minWidth:80,padding:"8px 0",borderRadius:8,fontSize:12,fontFamily:C.mono,cursor:"pointer",border:"none",
                    background:escSel===i?e.color+"22":C.s2,color:escSel===i?e.color:C.t2,
                    borderBottom:escSel===i?"2px solid "+e.color:"2px solid transparent"}}>
                  {e.label}
                </button>
              ))}
            </div>
            {(()=>{
              const esc=ESCENARIOS[escSel];
              const ingT=Object.values(ING_BASE).reduce((s,v)=>s+v*esc.pct,0);
              const egrT=Object.values(EGR_BASE).reduce((s,v)=>s+Math.abs(v),0);
              const util=ingT-egrT;
              return (
                <div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
                    {[{l:"Ingresos Proy.",v:ingT,c:C.g},{l:"Egresos Proy.",v:egrT,c:C.r},{l:"Utilidad Neta",v:util,c:util>=0?C.g:C.r}].map((k,i)=>(
                      <div key={i} style={bx({flex:1,textAlign:"center"})}>
                        <div style={{fontSize:10,color:C.t2,fontFamily:C.mono,marginBottom:4}}>{k.l}</div>
                        <div style={{fontSize:18,fontFamily:C.mono,fontWeight:700,color:k.c}}>{f(k.v)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                    <div style={bx({flex:1,minWidth:200})}>
                      <div style={{fontSize:11,color:C.g,fontFamily:C.mono,marginBottom:12}}>INGRESOS</div>
                      {Object.entries(ING_BASE).map(([k,v],i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.s2}}>
                          <span style={{fontSize:12,color:C.t2}}>{k}</span>
                          <span style={{fontSize:12,fontFamily:C.mono,color:C.g}}>{f(v*esc.pct)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={bx({flex:1,minWidth:200})}>
                      <div style={{fontSize:11,color:C.r,fontFamily:C.mono,marginBottom:12}}>EGRESOS</div>
                      {Object.entries(EGR_BASE).map(([k,v],i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.s2}}>
                          <span style={{fontSize:12,color:C.t2}}>{k}</span>
                          <span style={{fontSize:12,fontFamily:C.mono,color:C.r}}>{f(Math.abs(v))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
