import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   ROCA BRUJA — SISTEMA DE GESTIÓN v3.0
   ═══════════════════════════════════════════ */

const C = {
  bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
  tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
  g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
  b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
  mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
};

const TYPES = [
  { id:"sabado", l:"S\u00e1bado", c:C.y, cap:1200 },
  { id:"viernes", l:"Viernes", c:C.g, cap:800 },
  { id:"master", l:"Master", c:C.p, cap:1500 }
];

const CATS = [
  "DJ/Art\u00edstico","Sonido/T\u00e9cnica","Seguridad","Personal/RRHH",
  "Bebidas(CMV)","Limpieza","Energ\u00eda","Marketing","Comisiones","Otros"
];

const MOS = ["Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov"];

const FIXED0 = {
  "Alquiler/Canon":2500000, "Seguros":350000, "Administraci\u00f3n":600000,
  "Impuestos fijos":450000, "Mantenimiento":300000, "Software":80000
};

const VEND0 = [
  {n:"Juan L",com:10},{n:"Toto M",com:10},{n:"Nacho Zava",com:12},{n:"Fio H",com:10},
  {n:"Martu P",com:10},{n:"Sofi R",com:10},{n:"Nico B",com:8},{n:"Valen G",com:10}
];

const EVT0 = [
  { id:1, t:"sabado", d:"2026-03-07", att:980, rM:1800000, rP:2940000, rB:1470000,
    costs:[850000,280000,350000,420000,735000,80000,65000,180000,294000,50000],
    vS:{"Juan L":380000,"Toto M":290000,"Nacho Zava":450000,"Fio H":210000} },
  { id:2, t:"viernes", d:"2026-03-13", att:620, rM:900000, rP:1860000, rB:930000,
    costs:[450000,200000,250000,300000,465000,60000,55000,120000,186000,40000],
    vS:{"Martu P":320000,"Sofi R":280000,"Nico B":190000} },
  { id:3, t:"master", d:"2026-03-21", att:1350, rM:3200000, rP:5400000, rB:2700000,
    costs:[1500000,450000,500000,580000,1350000,120000,95000,350000,540000,80000],
    vS:{"Juan L":620000,"Nacho Zava":780000,"Fio H":510000,"Valen G":390000} },
  { id:4, t:"sabado", d:"2026-03-28", att:1050, rM:2100000, rP:3150000, rB:1575000,
    costs:[900000,290000,370000,440000,787500,85000,68000,200000,315000,55000],
    vS:{"Toto M":410000,"Martu P":350000,"Sofi R":300000,"Nico B":250000} },
  { id:5, t:"viernes", d:"2026-04-03", att:580, rM:850000, rP:1740000, rB:870000,
    costs:[420000,190000,240000,280000,435000,55000,50000,110000,174000,35000],
    vS:{"Fio H":280000,"Valen G":260000,"Juan L":310000} },
  { id:6, t:"sabado", d:"2026-04-11", att:1100, rM:2300000, rP:3300000, rB:1650000,
    costs:[950000,300000,380000,460000,825000,90000,70000,220000,330000,60000],
    vS:{"Nacho Zava":520000,"Toto M":380000,"Martu P":410000,"Sofi R":340000} }
];

/* ── Helpers ── */
const f = (v) => {
  if (v == null) return "$0";
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 1e9) return s + "$" + (a / 1e9).toFixed(1) + "B";
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return s + "$" + (a / 1e3).toFixed(0) + "K";
  return "$" + a.toLocaleString("es-AR");
};
const ff = (v) => "$" + (v || 0).toLocaleString("es-AR");
const pct = (v) => ((v || 0) * 100).toFixed(1) + "%";
const et = (id) => TYPES.find((x) => x.id === id) || TYPES[0];
const ev$ = (e) => {
  const rev = (e.rM || 0) + (e.rP || 0) + (e.rB || 0);
  const cost = (e.costs || []).reduce((s, c) => s + c, 0);
  return { rev, cost, net: rev - cost, margin: rev > 0 ? (rev - cost) / rev : 0 };
};
const sumFx = (fx) => Object.values(fx).reduce((s, v) => s + v, 0);

/* ── Style helpers ── */
const bx = (extra) => ({
  background: C.s1, border: "1px solid " + C.bd,
  borderRadius: 12, padding: 16, ...(extra || {})
});
const pillSt = (active, color) => ({
  padding: "6px 14px", borderRadius: 20, fontSize: 13,
  fontFamily: C.mono, cursor: "pointer", border: "none",
  background: active ? color + "22" : "transparent",
  color: active ? color : C.t2,
  borderWidth: 1, borderStyle: "solid",
  borderColor: active ? color + "44" : "transparent"
});

/* ═══ MAIN COMPONENT ═══ */
export default function GestionRB({ liveEvents, liveVendors, liveFixed, lastUpdate }) {
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState(liveEvents || EVT0);
  const [fixed, setFixed] = useState(liveFixed || FIXED0);
  const [vendors, setVendors] = useState(liveVendors || VEND0);

  // Sync con datos live cuando se actualizan desde Google Sheets
  useEffect(() => {
    if (liveEvents && liveEvents.length > 0) setEvents(liveEvents);
  }, [liveEvents]);
  useEffect(() => {
    if (liveVendors && liveVendors.length > 0) setVendors(liveVendors);
  }, [liveVendors]);
  useEffect(() => {
    if (liveFixed && Object.keys(liveFixed).length > 0) setFixed(liveFixed);
  }, [liveFixed]);
  const [expandedEvt, setExpandedEvt] = useState(null);
  const [cStep, setCStep] = useState(0);
  const [cData, setCData] = useState({
    t: "sabado", d: "", att: 0, rM: 0, rP: 0, rB: 0,
    costs: CATS.map(() => 0), vS: {}
  });
  const [cmpA, setCmpA] = useState(0);
  const [cmpB, setCmpB] = useState(1);
  const [scVol, setScVol] = useState(0);
  const [scPrice, setScPrice] = useState(0);
  const [scCost, setScCost] = useState(0);
  const [editFx, setEditFx] = useState(null);
  const [editFxVal, setEditFxVal] = useState("");
  const [newVName, setNewVName] = useState("");
  const [newVCom, setNewVCom] = useState(10);

  /* ── Computed ── */
  const totals = events.reduce((acc, e) => {
    const { rev, cost, net } = ev$(e);
    acc.rev += rev; acc.cost += cost; acc.net += net; acc.att += (e.att || 0);
    return acc;
  }, { rev: 0, cost: 0, net: 0, att: 0 });

  const fxTotal = sumFx(fixed);
  const avgContrib = events.length > 0 ? totals.net / events.length : 0;
  const breakEven = avgContrib > 0 ? Math.ceil((fxTotal * 9) / avgContrib) : "---";

  const TABS = [
    "Dashboard", "Cerrar", "Eventos", "Comparar",
    "Escenarios", "Vendedores", "Cash Flow", "Costos", "Admin"
  ];

  /* ── Micro: Stat ── */
  const Stat = (props) => (
    <div style={bx({ flex: "1 1 200px", minWidth: 160 })}>
      <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, textTransform: "uppercase", marginBottom: 4 }}>
        {props.label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: props.color || C.g, fontFamily: C.mono }}>
        {props.value}
      </div>
      {props.sub && <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>{props.sub}</div>}
    </div>
  );

  /* ── Micro: Bar ── */
  const Bar = (props) => {
    const mx = props.maxVal || Math.max(...props.items.map((i) => Math.abs(i.v)), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {props.items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, fontSize: 11, color: C.t2, fontFamily: C.mono, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {it.l}
            </div>
            <div style={{ flex: 1, height: 18, background: C.s2, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: Math.max((Math.abs(it.v) / mx) * 100, 2) + "%",
                height: "100%", background: it.c || C.g, borderRadius: 4
              }} />
            </div>
            <div style={{ width: 70, fontSize: 11, color: C.tx, fontFamily: C.mono }}>{f(it.v)}</div>
          </div>
        ))}
      </div>
    );
  };

  /* ── Micro: Input ── */
  const Inp = (props) => (
    <div style={{ marginBottom: 8, flex: props.flex || "unset" }}>
      {props.label && (
        <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginBottom: 2 }}>{props.label}</div>
      )}
      <input
        type={props.type || "number"}
        value={props.value}
        onChange={(e) => props.onChange(
          (props.type || "number") === "number" ? Number(e.target.value) : e.target.value
        )}
        style={{
          width: "100%", padding: "8px 10px", background: C.s2,
          border: "1px solid " + C.bd, borderRadius: 8, color: C.tx,
          fontFamily: C.mono, fontSize: 13, outline: "none", boxSizing: "border-box"
        }}
      />
    </div>
  );

  /* ── Micro: Slider ── */
  const Sld = (props) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>{props.label}</span>
        <span style={{
          fontSize: 13, fontFamily: C.mono, fontWeight: 700,
          color: props.value >= 0 ? C.g : C.r
        }}>
          {props.value > 0 ? "+" : ""}{props.value}%
        </span>
      </div>
      <input
        type="range" min={props.min || -50} max={props.max || 50}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: props.color || C.g }}
      />
    </div>
  );

  /* ── Micro: Button ── */
  const Btn = (props) => (
    <button onClick={props.onClick} style={{
      padding: "8px 18px", borderRadius: 8, fontSize: 13,
      fontFamily: C.mono, cursor: "pointer",
      background: props.outline ? "transparent" : (props.color || C.g) + "22",
      color: props.color || C.g,
      border: props.outline ? "1px solid " + (props.color || C.g) + "44" : "none"
    }}>
      {props.children}
    </button>
  );

  /* ═══════════════════════════════════
     TAB 0: DASHBOARD
     ═══════════════════════════════════ */
  const renderDash = () => {
    const revByType = TYPES.map((tp) => {
      const evs = events.filter((e) => e.t === tp.id);
      const rev = evs.reduce((s, e) => s + (e.rM || 0) + (e.rP || 0) + (e.rB || 0), 0);
      return { l: tp.l, v: rev, c: tp.c };
    });
    const margin = totals.rev > 0 ? totals.net / totals.rev : 0;
    const netAfterFx = totals.net - fxTotal;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Resumen Ejecutivo
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Stat label="Eventos" value={events.length} sub={"BE: " + breakEven + " eventos"} color={C.b} />
          <Stat label="Asistencia" value={totals.att.toLocaleString()}
            sub={events.length > 0 ? "Prom: " + Math.round(totals.att / events.length) : "-"} color={C.v} />
          <Stat label="Revenue Total" value={f(totals.rev)} color={C.g} />
          <Stat label="Costos Variables" value={f(totals.cost)} color={C.o} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Stat label="Resultado Operativo" value={f(totals.net)}
            sub={"Margen: " + pct(margin)} color={totals.net >= 0 ? C.g : C.r} />
          <Stat label="Costos Fijos / Mes" value={f(fxTotal)} color={C.y} />
          <Stat label="Resultado Neto" value={f(netAfterFx)}
            sub="Despu\u00e9s de fijos" color={netAfterFx >= 0 ? C.g : C.r} />
          <Stat label="Break-Even" value={breakEven + " evts"}
            sub="Para cubrir 9 meses" color={C.p} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12, fontFamily: C.sans }}>
            Revenue por Tipo
          </div>
          <Bar items={revByType} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12, fontFamily: C.sans }}>
            Revenue Mix
          </div>
          <Bar items={[
            { l: "Mesas", v: events.reduce((s, e) => s + (e.rM || 0), 0), c: C.y },
            { l: "Puerta", v: events.reduce((s, e) => s + (e.rP || 0), 0), c: C.g },
            { l: "Barra", v: events.reduce((s, e) => s + (e.rB || 0), 0), c: C.b }
          ]} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12, fontFamily: C.sans }}>
            Eventos Recientes
          </div>
          {events.slice(-4).reverse().map((e) => {
            const { rev, net, margin: mg } = ev$(e);
            const tp = et(e.t);
            return (
              <div key={e.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid " + C.bd
              }}>
                <div>
                  <span style={{ color: tp.c, fontFamily: C.mono, fontSize: 12, marginRight: 8 }}>{tp.l}</span>
                  <span style={{ color: C.t2, fontSize: 12 }}>{e.d}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: C.tx, fontFamily: C.mono, fontSize: 13 }}>{f(rev)}</span>
                  <span style={{
                    color: net >= 0 ? C.g : C.r, fontFamily: C.mono, fontSize: 12, marginLeft: 8
                  }}>{pct(mg)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 1: CERRAR EVENTO
     ═══════════════════════════════════ */
  const renderCerrar = () => {
    var steps = ["Tipo y Fecha", "Ingresos", "Costos", "Vendedores", "Confirmar"];
    var upC = (k, v) => setCData({ ...cData, [k]: v });
    var upCost = (i, v) => {
      var nc = [...cData.costs];
      nc[i] = v;
      setCData({ ...cData, costs: nc });
    };
    var upVS = (n, v) => setCData({ ...cData, vS: { ...cData.vS, [n]: v } });
    var cRev = (cData.rM || 0) + (cData.rP || 0) + (cData.rB || 0);
    var cCost = cData.costs.reduce((s, c) => s + c, 0);

    var doSave = () => {
      var newEvt = { ...cData, id: Date.now(), vS: { ...cData.vS } };
      setEvents([...events, newEvt]);
      setCStep(0);
      setCData({ t: "sabado", d: "", att: 0, rM: 0, rP: 0, rB: 0, costs: CATS.map(() => 0), vS: {} });
      setTab(2);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Cerrar Evento
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => setCStep(i)} style={{
              flex: 1, textAlign: "center", padding: "6px 0", fontSize: 11,
              fontFamily: C.mono, cursor: "pointer",
              color: i === cStep ? C.g : C.t2,
              borderBottom: i === cStep ? "2px solid " + C.g : "2px solid " + C.bd
            }}>{s}</div>
          ))}
        </div>

        {cStep === 0 && (
          <div style={bx()}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {TYPES.map((tp) => (
                <button key={tp.id} onClick={() => upC("t", tp.id)}
                  style={pillSt(cData.t === tp.id, tp.c)}>{tp.l}</button>
              ))}
            </div>
            <Inp label="Fecha" value={cData.d} onChange={(v) => upC("d", v)} type="date" />
            <Inp label="Asistencia" value={cData.att} onChange={(v) => upC("att", v)} />
          </div>
        )}

        {cStep === 1 && (
          <div style={bx()}>
            <Inp label="Mesas ($)" value={cData.rM} onChange={(v) => upC("rM", v)} />
            <Inp label="Puerta ($)" value={cData.rP} onChange={(v) => upC("rP", v)} />
            <Inp label="Barra ($)" value={cData.rB} onChange={(v) => upC("rB", v)} />
            <div style={{ marginTop: 8, padding: 8, background: C.s2, borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Total Revenue: </span>
              <span style={{ fontSize: 14, color: C.g, fontFamily: C.mono, fontWeight: 700 }}>{f(cRev)}</span>
            </div>
          </div>
        )}

        {cStep === 2 && (
          <div style={bx()}>
            {CATS.map((cat, i) => (
              <Inp key={i} label={cat} value={cData.costs[i]} onChange={(v) => upCost(i, v)} />
            ))}
            <div style={{ marginTop: 8, padding: 8, background: C.s2, borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Total Costos: </span>
              <span style={{ fontSize: 14, color: C.o, fontFamily: C.mono, fontWeight: 700 }}>{f(cCost)}</span>
            </div>
          </div>
        )}

        {cStep === 3 && (
          <div style={bx()}>
            {vendors.map((v) => (
              <Inp key={v.n} label={v.n + " (" + v.com + "%)"}
                value={cData.vS[v.n] || 0} onChange={(val) => upVS(v.n, val)} />
            ))}
          </div>
        )}

        {cStep === 4 && (
          <div style={bx()}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12 }}>
              Resumen del Evento
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Tipo: </span>
                <span style={{ color: et(cData.t).c }}>{et(cData.t).l}</span>
              </div>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Fecha: </span>
                <span style={{ color: C.tx }}>{cData.d || "-"}</span>
              </div>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Asistencia: </span>
                <span style={{ color: C.tx }}>{cData.att}</span>
              </div>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Revenue: </span>
                <span style={{ color: C.g }}>{f(cRev)}</span>
              </div>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Costos: </span>
                <span style={{ color: C.o }}>{f(cCost)}</span>
              </div>
              <div>
                <span style={{ color: C.t2, fontSize: 12 }}>Resultado: </span>
                <span style={{ color: cRev - cCost >= 0 ? C.g : C.r }}>{f(cRev - cCost)}</span>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn onClick={doSave} color={C.g}>Guardar Evento</Btn>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {cStep > 0 && <Btn onClick={() => setCStep(cStep - 1)} color={C.t2} outline>Anterior</Btn>}
          {cStep < 4 && (
            <div style={{ marginLeft: "auto" }}>
              <Btn onClick={() => setCStep(cStep + 1)} color={C.g}>Siguiente</Btn>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 2: EVENTOS
     ═══════════════════════════════════ */
  const renderEvts = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Eventos ({events.length})
        </div>
        <Btn onClick={() => { setTab(1); setCStep(0); }} color={C.g}>+ Nuevo</Btn>
      </div>
      {events.map((e) => {
        var info = ev$(e);
        var tp = et(e.t);
        var isExp = expandedEvt === e.id;
        return (
          <div key={e.id} style={bx({ cursor: "pointer" })}
            onClick={() => setExpandedEvt(isExp ? null : e.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: tp.c, fontFamily: C.mono, fontSize: 13, fontWeight: 600 }}>
                  {tp.l}
                </span>
                <span style={{ color: C.t2, fontSize: 12, marginLeft: 8 }}>{e.d}</span>
                <span style={{ color: C.t2, fontSize: 11, marginLeft: 8 }}>({e.att} pers)</span>
              </div>
              <div>
                <span style={{ color: C.tx, fontFamily: C.mono, fontSize: 14 }}>{f(info.rev)}</span>
                <span style={{
                  color: info.net >= 0 ? C.g : C.r, fontFamily: C.mono, fontSize: 12, marginLeft: 8
                }}>{f(info.net)}</span>
              </div>
            </div>
            {isExp && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.bd }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div>
                    <span style={{ color: C.t2, fontSize: 11 }}>Mesas</span>
                    <div style={{ color: C.y, fontFamily: C.mono }}>{f(e.rM)}</div>
                  </div>
                  <div>
                    <span style={{ color: C.t2, fontSize: 11 }}>Puerta</span>
                    <div style={{ color: C.g, fontFamily: C.mono }}>{f(e.rP)}</div>
                  </div>
                  <div>
                    <span style={{ color: C.t2, fontSize: 11 }}>Barra</span>
                    <div style={{ color: C.b, fontFamily: C.mono }}>{f(e.rB)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.tx, marginBottom: 6 }}>Costos</div>
                {CATS.map((cat, i) => (e.costs[i] || 0) > 0 ? (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                    <span style={{ color: C.t2 }}>{cat}</span>
                    <span style={{ color: C.o, fontFamily: C.mono }}>{f(e.costs[i])}</span>
                  </div>
                ) : null)}
                <div style={{
                  display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700,
                  marginTop: 8, paddingTop: 8, borderTop: "1px solid " + C.bd
                }}>
                  <span style={{ color: C.tx }}>Resultado</span>
                  <span style={{ color: info.net >= 0 ? C.g : C.r, fontFamily: C.mono }}>
                    {f(info.net)} ({pct(info.margin)})
                  </span>
                </div>
                {Object.keys(e.vS || {}).length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.tx, marginBottom: 4 }}>
                      Vendedores
                    </div>
                    {Object.entries(e.vS).map(([n, val]) => (
                      <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                        <span style={{ color: C.t2 }}>{n}</span>
                        <span style={{ color: C.v, fontFamily: C.mono }}>{f(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <Btn onClick={(ev) => {
                    ev.stopPropagation();
                    setEvents(events.filter((x) => x.id !== e.id));
                  }} color={C.r} outline>Eliminar</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════
     TAB 3: COMPARAR
     ═══════════════════════════════════ */
  const renderCompare = () => {
    if (events.length < 2) {
      return (
        <div style={bx()}>
          <span style={{ color: C.t2 }}>Necesit\u00e1s al menos 2 eventos para comparar.</span>
        </div>
      );
    }
    var a = events[cmpA] || events[0];
    var b2 = events[cmpB] || events[1];
    var pa = ev$(a);
    var pb = ev$(b2);
    var tpa = et(a.t);
    var tpb = et(b2.t);

    var CmpRow = (rp) => (
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "6px 0", borderBottom: "1px solid " + C.s2
      }}>
        <span style={{ color: C.t2, fontSize: 12 }}>{rp.label}</span>
        <span style={{ color: C.tx, fontFamily: C.mono, fontSize: 13, textAlign: "right" }}>
          {(rp.fmt || f)(rp.va)}
        </span>
        <span style={{ color: C.tx, fontFamily: C.mono, fontSize: 13, textAlign: "right" }}>
          {(rp.fmt || f)(rp.vb)}
        </span>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Comparar Eventos
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={cmpA} onChange={(e) => setCmpA(Number(e.target.value))}
            style={{
              flex: 1, padding: 8, background: C.s2, border: "1px solid " + C.bd,
              borderRadius: 8, color: C.tx, fontFamily: C.mono
            }}>
            {events.map((e, i) => (
              <option key={i} value={i}>{et(e.t).l + " " + e.d}</option>
            ))}
          </select>
          <span style={{ color: C.t2, alignSelf: "center" }}>vs</span>
          <select value={cmpB} onChange={(e) => setCmpB(Number(e.target.value))}
            style={{
              flex: 1, padding: 8, background: C.s2, border: "1px solid " + C.bd,
              borderRadius: 8, color: C.tx, fontFamily: C.mono
            }}>
            {events.map((e, i) => (
              <option key={i} value={i}>{et(e.t).l + " " + e.d}</option>
            ))}
          </select>
        </div>
        <div style={bx()}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            paddingBottom: 8, borderBottom: "1px solid " + C.bd, marginBottom: 4
          }}>
            <span></span>
            <span style={{ color: tpa.c, fontFamily: C.mono, fontSize: 12, textAlign: "right" }}>
              {tpa.l + " " + a.d}
            </span>
            <span style={{ color: tpb.c, fontFamily: C.mono, fontSize: 12, textAlign: "right" }}>
              {tpb.l + " " + b2.d}
            </span>
          </div>
          <CmpRow label="Asistencia" va={a.att} vb={b2.att} fmt={String} />
          <CmpRow label="Revenue" va={pa.rev} vb={pb.rev} />
          <CmpRow label="Costos" va={pa.cost} vb={pb.cost} />
          <CmpRow label="Resultado" va={pa.net} vb={pb.net} />
          <CmpRow label="Margen" va={pa.margin} vb={pb.margin} fmt={pct} />
          <CmpRow label="Mesas" va={a.rM} vb={b2.rM} />
          <CmpRow label="Puerta" va={a.rP} vb={b2.rP} />
          <CmpRow label="Barra" va={a.rB} vb={b2.rB} />
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 4: ESCENARIOS
     ═══════════════════════════════════ */
  const renderScenarios = () => {
    var adjRev = totals.rev * (1 + scPrice / 100) * (1 + scVol / 100);
    var adjCost = totals.cost * (1 + scCost / 100) * (1 + scVol / 100);
    var adjNet = adjRev - adjCost;
    var adjNetFx = adjNet - fxTotal;
    var adjMargin = adjRev > 0 ? adjNet / adjRev : 0;

    var presets = [
      { l: "Optimista", vol: 15, price: 10, cost: -5, c: C.g },
      { l: "Base", vol: 0, price: 0, cost: 0, c: C.b },
      { l: "Pesimista", vol: -20, price: -10, cost: 15, c: C.r }
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Simulador de Escenarios
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {presets.map((pr) => (
            <Btn key={pr.l} onClick={() => {
              setScVol(pr.vol); setScPrice(pr.price); setScCost(pr.cost);
            }} color={pr.c} outline>{pr.l}</Btn>
          ))}
        </div>

        <div style={bx()}>
          <Sld label="Volumen (asistencia)" value={scVol} onChange={setScVol} color={C.b} />
          <Sld label="Precio (ticket / consumo)" value={scPrice} onChange={setScPrice} color={C.g} />
          <Sld label="Costos variables" value={scCost} onChange={setScCost} color={C.o} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Stat label="Revenue Ajustado" value={f(adjRev)} color={C.g} />
          <Stat label="Costos Ajustados" value={f(adjCost)} color={C.o} />
          <Stat label="Resultado Op." value={f(adjNet)} color={adjNet >= 0 ? C.g : C.r} />
          <Stat label="Resultado Neto" value={f(adjNetFx)}
            sub="Despu\u00e9s de fijos" color={adjNetFx >= 0 ? C.g : C.r} />
          <Stat label="Margen" value={pct(adjMargin)} color={adjMargin > 0.2 ? C.g : C.r} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>
            Base vs Escenario
          </div>
          <Bar items={[
            { l: "Base Rev", v: totals.rev, c: C.g },
            { l: "Esc Rev", v: adjRev, c: C.b },
            { l: "Base Net", v: totals.net, c: C.y },
            { l: "Esc Net", v: adjNet, c: adjNet >= 0 ? C.v : C.r }
          ]} />
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 5: VENDEDORES
     ═══════════════════════════════════ */
  const renderVend = () => {
    var vendTotals = {};
    vendors.forEach((v) => { vendTotals[v.n] = { sales: 0, events: 0, com: v.com }; });
    events.forEach((e) => {
      Object.entries(e.vS || {}).forEach(([n, v]) => {
        if (!vendTotals[n]) vendTotals[n] = { sales: 0, events: 0, com: 10 };
        vendTotals[n].sales += v;
        vendTotals[n].events += 1;
      });
    });
    var ranked = Object.entries(vendTotals).sort((a, b) => b[1].sales - a[1].sales);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Ranking Vendedores
        </div>
        <Bar items={ranked.map(([n, d]) => ({ l: n, v: d.sales, c: C.v }))} />
        <div style={bx()}>
          {ranked.map(([n, d], i) => (
            <div key={n} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: "1px solid " + C.s2
            }}>
              <div>
                <span style={{
                  color: i < 3 ? C.v : C.t2, fontFamily: C.mono,
                  fontSize: 14, fontWeight: 600, marginRight: 8
                }}>#{i + 1}</span>
                <span style={{ color: C.tx, fontSize: 13 }}>{n}</span>
                <span style={{ color: C.t2, fontSize: 11, marginLeft: 6 }}>
                  ({d.events} evts)
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.tx, fontFamily: C.mono, fontSize: 14 }}>{f(d.sales)}</div>
                <div style={{ color: C.t2, fontSize: 11 }}>
                  Com: {f(d.sales * d.com / 100)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 6: CASH FLOW
     ═══════════════════════════════════ */
  const renderCash = () => {
    var monthly = MOS.map((m) => ({ m: m, rev: 0, cost: 0, fx: fxTotal, net: 0, running: 0 }));
    events.forEach((e) => {
      var mo = e.d ? parseInt(e.d.split("-")[1], 10) : 3;
      var idx = mo - 3;
      if (idx >= 0 && idx < MOS.length) {
        var info = ev$(e);
        monthly[idx].rev += info.rev;
        monthly[idx].cost += info.cost;
      }
    });
    var running = 0;
    monthly.forEach((m) => {
      m.net = m.rev - m.cost - m.fx;
      running += m.net;
      m.running = running;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          Cash Flow Mensual
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Stat label="Acumulado" value={f(running)} color={running >= 0 ? C.g : C.r} />
          <Stat label="Meses Negativos" value={monthly.filter((m) => m.net < 0).length} color={C.r} />
        </div>

        <div style={bx()}>
          <div style={{
            display: "grid", gridTemplateColumns: "50px 1fr 1fr 1fr 1fr", gap: 8,
            padding: "6px 0", fontSize: 11, color: C.t2, fontFamily: C.mono,
            borderBottom: "1px solid " + C.bd, marginBottom: 4
          }}>
            <span>Mes</span>
            <span style={{ textAlign: "right" }}>Revenue</span>
            <span style={{ textAlign: "right" }}>Variable</span>
            <span style={{ textAlign: "right" }}>Fijos</span>
            <span style={{ textAlign: "right" }}>Neto</span>
          </div>
          {monthly.map((m, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "50px 1fr 1fr 1fr 1fr", gap: 8,
              padding: "6px 0", borderBottom: "1px solid " + C.s2,
              fontSize: 12, fontFamily: C.mono
            }}>
              <span style={{ color: C.tx, fontWeight: 600 }}>{m.m}</span>
              <span style={{ color: C.g, textAlign: "right" }}>{f(m.rev)}</span>
              <span style={{ color: C.o, textAlign: "right" }}>{f(m.cost)}</span>
              <span style={{ color: C.y, textAlign: "right" }}>{f(m.fx)}</span>
              <span style={{
                color: m.net >= 0 ? C.g : C.r, textAlign: "right", fontWeight: 700
              }}>{f(m.net)}</span>
            </div>
          ))}
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>
            Saldo Acumulado
          </div>
          <Bar items={monthly.map((m) => ({
            l: m.m, v: m.running, c: m.running >= 0 ? C.g : C.r
          }))} />
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 7: COSTOS
     ═══════════════════════════════════ */
  const renderCosts = () => {
    var catTotals = CATS.map((cat, i) => ({
      cat: cat,
      total: events.reduce((s, e) => s + (e.costs[i] || 0), 0)
    })).sort((a, b) => b.total - a.total);
    var totalVar = catTotals.reduce((s, c) => s + c.total, 0);
    var totalAnual = totalVar + fxTotal * 9;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
          An\u00e1lisis de Costos
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Stat label="Variables Total" value={f(totalVar)} color={C.o} />
          <Stat label="Fijos / Mes" value={f(fxTotal)} color={C.y} />
          <Stat label="Fijos 9 Meses" value={f(fxTotal * 9)} color={C.r} />
          <Stat label="Costo Total Anual" value={f(totalAnual)} color={C.p} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12 }}>
            Variables por Categor\u00eda
          </div>
          <Bar items={catTotals.map((c) => ({
            l: c.cat.length > 14 ? c.cat.slice(0, 12) + ".." : c.cat,
            v: c.total, c: C.o
          }))} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12 }}>
            Costos Fijos
          </div>
          <Bar items={Object.entries(fixed).map(([k, v]) => ({
            l: k.length > 14 ? k.slice(0, 12) + ".." : k,
            v: v, c: C.y
          }))} />
        </div>

        <div style={bx()}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>Insights</div>
          <div style={{ fontSize: 13, color: C.tx, lineHeight: 1.7 }}>
            {catTotals.length > 0 && (
              <div>
                <span style={{ color: C.r, fontWeight: 600 }}>Mayor costo variable: </span>
                {catTotals[0].cat} ({f(catTotals[0].total)} - {pct(totalVar > 0 ? catTotals[0].total / totalVar : 0)} del total)
              </div>
            )}
            <div style={{ marginTop: 4 }}>
              <span style={{ color: C.y, fontWeight: 600 }}>Fijos representan: </span>
              {pct(totalAnual > 0 ? (fxTotal * 9) / totalAnual : 0)} del costo total anual
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: C.g, fontWeight: 600 }}>Costo variable prom/evento: </span>
              {f(events.length > 0 ? totalVar / events.length : 0)}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: C.b, fontWeight: 600 }}>Ticket m\u00ednimo para BE: </span>
              {f(events.length > 0 ? (fxTotal * 9) / events.length : 0)} extra por evento
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════
     TAB 8: ADMIN
     ═══════════════════════════════════ */
  const renderAdmin = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, fontFamily: C.sans }}>
        Administraci\u00f3n
      </div>

      <div style={bx()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12 }}>
          Costos Fijos Mensuales
        </div>
        {Object.entries(fixed).map(([k, v]) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 0", borderBottom: "1px solid " + C.s2
          }}>
            <span style={{ color: C.tx, fontSize: 13 }}>{k}</span>
            {editFx === k ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input type="number" value={editFxVal}
                  onChange={(e) => setEditFxVal(e.target.value)}
                  style={{
                    width: 120, padding: "4px 8px", background: C.s2,
                    border: "1px solid " + C.g, borderRadius: 6,
                    color: C.tx, fontFamily: C.mono, fontSize: 13, outline: "none"
                  }} />
                <Btn onClick={() => {
                  setFixed({ ...fixed, [k]: Number(editFxVal) });
                  setEditFx(null);
                }} color={C.g}>OK</Btn>
              </div>
            ) : (
              <span style={{
                color: C.y, fontFamily: C.mono, fontSize: 13, cursor: "pointer"
              }} onClick={() => { setEditFx(k); setEditFxVal(String(v)); }}>
                {ff(v)}
              </span>
            )}
          </div>
        ))}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "8px 0", fontWeight: 700
        }}>
          <span style={{ color: C.tx }}>Total</span>
          <span style={{ color: C.y, fontFamily: C.mono }}>{ff(sumFx(fixed))}</span>
        </div>
      </div>

      <div style={bx()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 12 }}>
          Vendedores ({vendors.length})
        </div>
        {vendors.map((v, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 0", borderBottom: "1px solid " + C.s2
          }}>
            <span style={{ color: C.tx, fontSize: 13 }}>{v.n}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.v, fontFamily: C.mono, fontSize: 12 }}>{v.com}%</span>
              <Btn onClick={() => setVendors(vendors.filter((_, j) => j !== i))}
                color={C.r} outline>x</Btn>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Inp label="Nombre" value={newVName} onChange={setNewVName} type="text" />
          </div>
          <div style={{ width: 80 }}>
            <Inp label="Com %" value={newVCom} onChange={setNewVCom} />
          </div>
          <Btn onClick={() => {
            if (newVName.trim()) {
              setVendors([...vendors, { n: newVName.trim(), com: newVCom }]);
              setNewVName("");
            }
          }} color={C.g}>+</Btn>
        </div>
      </div>

      <div style={bx()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>
          Datos del Sistema
        </div>
        <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>
          <div>{events.length} eventos cargados</div>
          <div>{vendors.length} vendedores activos</div>
          <div>{Object.keys(fixed).length} categor\u00edas de costos fijos</div>
          <div>Temporada: Mar - Nov ({MOS.length} meses)</div>
        </div>
      </div>
    </div>
  );

  /* ═══ Tab render map ═══ */
  var renderTab = [
    renderDash, renderCerrar, renderEvts, renderCompare,
    renderScenarios, renderVend, renderCash, renderCosts, renderAdmin
  ];

  /* ═══ MAIN RENDER ═══ */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.tx, fontFamily: C.sans }}>
      <div style={{
        background: C.s1, borderBottom: "1px solid " + C.bd,
        padding: "12px 16px", display: "flex",
        justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.tx }}>ROCA BRUJA</span>
          <span style={{
            fontSize: 11, color: C.t2, marginLeft: 8, fontFamily: C.mono
          }}>GESTI\u00d3N v3.0</span>
        </div>
        <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, textAlign: 'right' }}>
          <div>{events.length} eventos | {f(totals.rev)} rev</div>
          {lastUpdate && (
            <div style={{ fontSize: 10, color: C.t2, opacity: 0.6 }}>
              Actualizado: {lastUpdate.toLocaleTimeString('es-AR')}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: "flex", gap: 2, padding: "8px 12px",
        overflowX: "auto", background: C.s1,
        borderBottom: "1px solid " + C.bd
      }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12,
            fontFamily: C.mono, cursor: "pointer", border: "none",
            whiteSpace: "nowrap",
            background: tab === i ? C.g + "22" : "transparent",
            color: tab === i ? C.g : C.t2
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        {renderTab[tab]()}
      </div>
    </div>
  );
}