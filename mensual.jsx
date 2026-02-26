import { useState, useEffect } from "react";
import { fetchEjecutivo } from "./sheets.js";
const MensualRB = () => {
  const C = {
    bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
    tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
    g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
    b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
    mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
  };
  const f = (v) => {
    if(v==null)return"$0";
    const a=Math.abs(Math.round(v));
    const s=v<0?"-":"";
    if(a>=1e9)return s+"$"+(a/1e9).toFixed(1)+"B";
    if(a>=1e6)return s+"$"+(a/1e6).toFixed(1)+"M";
    if(a>=1e3)return s+"$"+(a/1e3).toFixed(0)+"K";
    return (v<0?"-":"")+"$"+a.toLocaleString("es-AR");
  };
  const pct = (v) => ((v||0)*100).toFixed(1)+"%";
  const bx = (extra) => ({
    background:C.s1, border:"1px solid "+C.bd, borderRadius:12, padding:16, ...(extra||{})
  });
  const pillSt = (active, color) => ({
    padding:"6px 14px", borderRadius:20, fontSize:13, fontFamily:C.mono,
    cursor:"pointer", border:"none", background:active?color+"22":"transparent",
    color:active?color:C.t2, borderWidth:1, borderStyle:"solid",
    borderColor:active?color+"44":"transparent"
  });
  const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  const MESES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const [tab, setTab] = useState(0);
  const [mesPrincipal, setMesPrincipal] = useState(0);
  const [concepto, setConcepto] = useState(null);
  const [mes1, setMes1] = useState(0);
  const [mes2, setMes2] = useState(1);
  const [ejecutivo, setEjecutivo] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchEjecutivo()
      .then(data => { setEjecutivo(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const getIngresos = (mesIdx) => ejecutivo?.cashflow?.[mesIdx]?.ingresos || 0;
  const getEgresos = (mesIdx) => ejecutivo?.cashflow?.[mesIdx]?.egresos || 0;
  const getResultado = (mesIdx) => getIngresos(mesIdx) - getEgresos(mesIdx);
  const getTotalIngresos = () => ejecutivo?.totalIngresos || 0;
  const getTotalEgresos = () => ejecutivo?.totalEgresos || 0;
  const conceptosData = Object.entries(ejecutivo?.porConcepto || {})
    .filter(([,v]) => v > 0)
    .sort((a,b) => b[1] - a[1]);
  // Datos mensuales por concepto
  const conceptoMensual = ejecutivo?.porConceptoMensual || {};
  const Stat = ({label, value, color, sub}) => (
    <div style={{...bx(), flex:1, minWidth:180}}>
      <div style={{fontSize:12, color:C.t2, fontFamily:C.mono, marginBottom:8}}>{label}</div>
      <div style={{fontSize:22, fontWeight:"bold", color:color||C.tx, fontFamily:C.mono}}>{value}</div>
      {sub && <div style={{fontSize:11, color:C.t2, fontFamily:C.mono, marginTop:4}}>{sub}</div>}
    </div>
  );
  const Bar = ({items}) => {
    const h = 180;
    const maxV = Math.max(...items.map(i => Math.abs(i.v)), 1);
    return (
      <div style={{display:"flex", alignItems:"flex-end", gap:10, height:h+40, overflow:"auto", padding:12}}>
        {items.map((item,i) => (
          <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:44}}>
            <div style={{width:36, height:Math.max((Math.abs(item.v)/maxV)*h, 2), background:item.c, borderRadius:4}} title={f(item.v)}></div>
            <div style={{fontSize:10, color:C.t2, marginTop:6, fontFamily:C.mono, textAlign:"center", width:44}}>{item.l}</div>
          </div>
        ))}
      </div>
    );
  };
  const Table = ({headers, rows, stickyFirst}) => (
    <div style={{overflowX:"auto", ...bx()}}>
      <table style={{width:"100%", borderCollapse:"collapse", fontFamily:C.mono, fontSize:13}}>
        <thead>
          <tr style={{borderBottom:"1px solid "+C.bd}}>
            {headers.map((h,i) => <th key={i} style={{padding:10, textAlign:i===0?"left":"right", color:C.t2, whiteSpace:"nowrap", ...(stickyFirst && i===0 ? {position:"sticky", left:0, background:C.s1, zIndex:1} : {})}}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i) => (
            <tr key={i} style={{borderBottom:"1px solid "+C.bd, cursor:row.onClick?"pointer":"default"}} onClick={row.onClick}>
              {row.cells.map((cell,j) => <td key={j} style={{padding:10, textAlign:j===0?"left":"right", color:cell.color||C.tx, whiteSpace:"nowrap", ...(stickyFirst && j===0 ? {position:"sticky", left:0, background:C.s1, zIndex:1} : {})}}>{cell.value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  if (loading) return (
    <div style={{background:C.bg, color:C.tx, fontFamily:C.mono, padding:40, textAlign:"center"}}>
      Cargando datos del ejecutivo...
    </div>
  );
  // TAB 0: 12 Meses
  const Tab12M = () => {
    const totalIng = getTotalIngresos();
    const totalEgr = getTotalEgresos();
    const resultado = totalIng - totalEgr;
    const margen = totalIng > 0 ? resultado / totalIng : 0;
    const resultados = MESES.map((_,i) => getResultado(i));
    const conData = resultados.filter(r => r !== 0);
    const bestIdx = resultados.indexOf(Math.max(...resultados));
    const worstIdx = resultados.indexOf(Math.min(...resultados));
    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label="Ingresos Anual" value={f(totalIng)} color={C.g} />
          <Stat label="Egresos Anual" value={f(totalEgr)} color={C.r} />
          <Stat label="Resultado" value={f(resultado)} color={resultado>=0?C.g:C.r} />
          <Stat label="Margen" value={pct(margen)} color={margen>=0?C.g:C.r} />
        </div>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label="Mejor Mes" value={MESES[bestIdx]} color={C.b} sub={f(resultados[bestIdx])} />
          <Stat label="Peor Mes" value={MESES[worstIdx]} color={C.o} sub={f(resultados[worstIdx])} />
          <Stat label="Meses con Data" value={conData.length.toString()} color={C.p} />
        </div>
        <div style={bx()}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>Resultado por Mes</h3>
          <Bar items={MESES.map((m,i) => ({l:m, v:resultados[i], c:resultados[i]>=0?C.g:C.r}))} />
        </div>
        <Table headers={["Mes","Ingresos","Egresos","Resultado","Margen"]} rows={MESES.map((m,i) => ({
          cells:[
            {value:m},
            {value:f(getIngresos(i)), color:C.g},
            {value:f(getEgresos(i)), color:C.r},
            {value:f(resultados[i]), color:resultados[i]>=0?C.g:C.r},
            {value:pct(getIngresos(i)>0?resultados[i]/getIngresos(i):0)}
          ],
          onClick: () => { setMesPrincipal(i); setTab(1); }
        }))} />
        {conceptosData.length > 0 && (
          <div style={bx()}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>Top Conceptos de Gasto</h3>
            <Bar items={conceptosData.slice(0,8).map(([k,v]) => ({l:k.substring(0,12), v, c:C.y}))} />
          </div>
        )}
      </div>
    );
  };
  // TAB 1: Detalle Mes
  const TabDetalleMes = () => {
    const ing = getIngresos(mesPrincipal);
    const egr = getEgresos(mesPrincipal);
    const res = ing - egr;
    const mar = ing > 0 ? res / ing : 0;
    // Conceptos del mes seleccionado
    const conceptosMes = conceptosData
      .map(([k]) => [k, (conceptoMensual[k] || [])[mesPrincipal] || 0])
      .filter(([,v]) => v > 0)
      .sort((a,b) => b[1] - a[1]);
    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {MESES.map((m,i) => (
            <button key={i} style={pillSt(i===mesPrincipal, C.b)} onClick={() => setMesPrincipal(i)}>{m}</button>
          ))}
        </div>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label={MESES_FULL[mesPrincipal]} value="" color={C.tx} />
          <Stat label="Ingresos" value={f(ing)} color={C.g} />
          <Stat label="Egresos" value={f(egr)} color={C.r} />
          <Stat label="Resultado" value={f(res)} color={res>=0?C.g:C.r} sub={pct(mar)} />
        </div>
        {conceptosMes.length > 0 && (
          <div style={bx()}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>Conceptos de {MESES_FULL[mesPrincipal]}</h3>
            <Bar items={conceptosMes.slice(0,8).map(([k,v]) => ({l:k.substring(0,12), v, c:C.o}))} />
          </div>
        )}
        {ing === 0 && egr === 0 && conceptosMes.length === 0 && (
          <div style={{...bx(), color:C.t2, textAlign:"center", padding:32}}>
            Sin datos para {MESES_FULL[mesPrincipal]}
          </div>
        )}
      </div>
    );
  };
  // TAB 2: Conceptos (ACTUALIZADO con desglose mensual)
  const TabConceptos = () => {
    const selConcepto = concepto || (conceptosData[0]?.[0] || null);
    const totalEgr = getTotalEgresos();
    const montoConcepto = ejecutivo?.porConcepto?.[selConcepto] || 0;
    const pctTotal = totalEgr > 0 ? montoConcepto / totalEgr : 0;
    // Datos mensuales del concepto seleccionado
    const mensualSel = conceptoMensual[selConcepto] || [];
    // Detectar meses con data para este concepto
    const mesesConData = mensualSel.filter(v => v > 0).length;
    const promedioMes = mesesConData > 0 ? montoConcepto / mesesConData : 0;
    const maxMesVal = Math.max(...mensualSel, 0);
    const maxMesIdx = mensualSel.indexOf(maxMesVal);
    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:6, flexWrap:"wrap", maxHeight:120, overflowY:"auto"}}>
          {conceptosData.map(([k],i) => (
            <button key={i} style={pillSt(k===selConcepto, C.v)} onClick={() => setConcepto(k)}>
              {k.substring(0,16)}
            </button>
          ))}
        </div>
        {selConcepto && (
          <>
            <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
              <Stat label="Total Anual" value={f(montoConcepto)} color={C.r} />
              <Stat label="% del Total" value={pct(pctTotal)} color={C.y} />
              <Stat label="Promedio/Mes" value={f(promedioMes)} color={C.o} sub={mesesConData+" meses con data"} />
              {maxMesVal > 0 && <Stat label="Mes Pico" value={MESES[maxMesIdx]} color={C.p} sub={f(maxMesVal)} />}
            </div>
            {/* Barras mensuales del concepto seleccionado */}
            <div style={bx()}>
              <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>{selConcepto} — por Mes</h3>
              <Bar items={MESES.map((m,i) => ({l:m, v:mensualSel[i]||0, c:mensualSel[i]>0?C.v:C.s2}))} />
            </div>
          </>
        )}
        {/* Tabla completa: concepto + cada mes + total + % */}
        <Table stickyFirst headers={["Concepto", ...MESES, "Total", "% Gasto"]} rows={conceptosData.map(([k,v]) => {
          const mensual = conceptoMensual[k] || [];
          return {
            cells: [
              {value: k.length > 18 ? k.slice(0,17)+"." : k},
              ...MESES.map((_,i) => ({
                value: mensual[i] > 0 ? f(mensual[i]) : "-",
                color: mensual[i] > 0 ? C.o : C.s3
              })),
              {value: f(v), color: C.r},
              {value: pct(totalEgr>0?v/totalEgr:0), color: C.y}
            ],
            onClick: () => setConcepto(k)
          };
        })} />
      </div>
    );
  };
  // TAB 3: Comparar
  const TabComparar = () => {
    const ing1=getIngresos(mes1), egr1=getEgresos(mes1), res1=ing1-egr1;
    const ing2=getIngresos(mes2), egr2=getEgresos(mes2), res2=ing2-egr2;
    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:16}}>
          {[{label:"Mes 1", val:mes1, set:setMes1},{label:"Mes 2", val:mes2, set:setMes2}].map((sel,i) => (
            <div key={i} style={{flex:1}}>
              <label style={{color:C.t2, fontSize:12, fontFamily:C.mono}}>{sel.label}</label>
              <select value={sel.val} onChange={e => sel.set(parseInt(e.target.value))} style={{width:"100%", padding:8, borderRadius:6, background:C.s1, color:C.tx, border:"1px solid "+C.bd, fontFamily:C.mono, marginTop:4}}>
                {MESES.map((m,j) => <option key={j} value={j}>{m}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{display:"flex", gap:12}}>
          {[[mes1,ing1,egr1,res1],[mes2,ing2,egr2,res2]].map(([mi,ing,egr,res],i) => (
            <div key={i} style={{flex:1, ...bx()}}>
              <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>{MESES[mi]}</h3>
              <div style={{fontFamily:C.mono, fontSize:13, display:"flex", flexDirection:"column", gap:8}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>Ingresos:</span><span style={{color:C.g}}>{f(ing)}</span></div>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>Egresos:</span><span style={{color:C.r}}>{f(egr)}</span></div>
                <div style={{display:"flex", justifyContent:"space-between", borderTop:"1px solid "+C.bd, paddingTop:8}}><span>Resultado:</span><span style={{color:res>=0?C.g:C.r}}>{f(res)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // TAB 4: Cash Flow
  const TabCashFlow = () => {
    let acum = 0;
    const data = MESES.map((m,i) => {
      const ing = getIngresos(i);
      const egr = getEgresos(i);
      const neto = ing - egr;
      acum += neto;
      return {mes:m, ing, egr, neto, acum};
    });
    const minAcum = Math.min(...data.map(d => d.acum));
    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <Table headers={["Mes","Ingresos","Egresos","Neto","Acumulado"]} rows={data.map((d,i) => ({
          cells:[
            {value:d.mes},
            {value:f(d.ing), color:C.g},
            {value:f(d.egr), color:C.r},
            {value:f(d.neto), color:d.neto>=0?C.g:C.r},
            {value:f(d.acum), color:d.acum===minAcum?C.r:(d.acum>=0?C.g:C.o)}
          ]
        }))} />
        <div style={bx()}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>Acumulado por Mes</h3>
          <Bar items={data.map(d => ({l:d.mes, v:d.acum, c:d.acum>=0?C.g:C.r}))} />
        </div>
      </div>
    );
  };
  const tabs = ["12 Meses","Detalle Mes","Conceptos","Comparar","Cash Flow"];
  const renders = [<Tab12M/>,<TabDetalleMes/>,<TabConceptos/>,<TabComparar/>,<TabCashFlow/>];
  return (
    <div style={{background:C.bg, color:C.tx, fontFamily:C.sans, padding:24}}>
      <div style={{maxWidth:1400, margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:28, fontWeight:"bold", fontFamily:C.mono}}>ROCA BRUJA</div>
          <div style={{fontSize:12, color:C.t2, fontFamily:C.mono}}>MENSUAL v2.1 — GR Ejecutivo 2026</div>
        </div>
        <div style={{display:"flex", gap:8, marginBottom:24, flexWrap:"wrap"}}>
          {tabs.map((label,i) => (
            <button key={i} style={pillSt(tab===i, C.v)} onClick={() => setTab(i)}>{label}</button>
          ))}
        </div>
        {renders[tab]}
      </div>
    </div>
  );
};
export default MensualRB;
