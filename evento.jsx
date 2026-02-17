import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";

/* ─── THEME (shared) ─── */
const C = {
  bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
  tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
  g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
  b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
  mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
};

const fmt = n => {
  if (n == null || isNaN(n)) return "$0";
  if (Math.abs(n) >= 1e6) return "$" + (n/1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n/1e3).toFixed(0) + "K";
  return "$" + n.toLocaleString("es-AR");
};
const pct = n => (n == null || isNaN(n)) ? "0%" : (n*100).toFixed(1) + "%";

/* ─── GOOGLE SHEETS ─── */
const INDEX_ID = import.meta.env.VITE_SHEET_INDEX || "";
const BASE = "https://docs.google.com/spreadsheets/d";
const REFRESH_MS = 60000;

async function fetchTab(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

function parseNum(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  let s = String(v).trim();
  s = s.replace(/^\$/, "").replace(/\s/g, "");
  if (s === "" || s === "-") return 0;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    const dots = (s.match(/\./g) || []).length;
    if (dots > 1) s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/* ─── INDEX PARSER ─── */
function parseIndex(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      fecha: get(["fecha", "date"]) || "",
      nombre: get(["nombre", "evento", "name"]) || "",
      sheetId: get(["sheetid", "sheet_id", "id", "sheet"]) || "",
      estado: (get(["estado", "status"]) || "").toUpperCase()
    };
  }).filter(e => e.sheetId);
}

/* ─── DATA PARSERS ─── */
function parseMesas(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      mesa: get(["mesa", "id"]) || "",
      sector: get(["sector"]) || "",
      titular: get(["titular", "nombre"]) || "",
      publica: get(["publica", "rrpp"]) || "",
      importe: parseNum(get(["importe", "total"])),
      abonado: parseNum(get(["abonado", "pagado"])),
      pendiente: parseNum(get(["pendiente", "debe"])),
      consumo: parseNum(get(["consumo"]))
    };
  }).filter(m => m.mesa);
}

function parsePersonal(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      rol: get(["rol", "puesto", "cargo", "concepto"]) || "",
      qty: parseNum(get(["cant", "qty", "cantidad"])) || 1,
      unit: parseNum(get(["unit", "costo", "precio", "valor"])),
      total: parseNum(get(["total", "subtotal"]))
    };
  }).filter(r => r.rol);
}

function parseExtras(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      concepto: get(["concepto", "gasto", "item", "detalle"]) || "",
      monto: parseNum(get(["monto", "total", "importe", "costo"]))
    };
  }).filter(r => r.concepto);
}

function parseComisiones(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      vendedor: get(["vendedor", "rrpp", "nombre"]) || "",
      ventas: parseNum(get(["venta", "total", "recaudado"])),
      rate: parseNum(get(["tasa", "rate", "%", "comision"])) || 0.10,
      comision: parseNum(get(["comision", "monto", "pago"]))
    };
  }).filter(r => r.vendedor);
}

function parseResumen(rows) {
  const res = {};
  rows.forEach(r => {
    const keys = Object.keys(r);
    const concepto = (r[keys[0]] || "").trim().toLowerCase();
    const valor = parseNum(r[keys[1]] || r[keys[2]]);
    if (concepto.includes("mesa")) res.mesas = valor;
    else if (concepto.includes("ticket") || concepto.includes("entrada")) res.tickets = valor;
    else if (concepto.includes("efectivo") || concepto.includes("cash")) res.efectivo = valor;
    else if (concepto.includes("mp") || concepto.includes("mercado")) res.mp = valor;
    else if (concepto.includes("transfer")) res.transfer = valor;
    else if (concepto.includes("ingreso") || concepto.includes("total ing")) res.totalIng = valor;
    else if (concepto.includes("costo") || concepto.includes("gasto")) res.totalCost = valor;
    else if (concepto.includes("utilidad") || concepto.includes("resultado")) res.utilidad = valor;
  });
  return res;
}

function parseBoleteria(rows) {
  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (patterns) => {
      for (const p of patterns) {
        const k = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (k) return r[k];
      }
      return "";
    };
    return {
      tipo: get(["tipo", "categoria", "entrada"]) || "",
      qty: parseNum(get(["cant", "qty", "cantidad"])),
      precio: parseNum(get(["precio", "valor", "unit"])),
      total: parseNum(get(["total", "recaudado", "subtotal"]))
    };
  }).filter(r => r.tipo);
}

/* ─── SEED DATA (Sabado 13/12 demo) ─── */
const SEED = {
  resumen: {
    mesas: 21000000, tickets: 2700000, efectivo: 13900000, mp: 19300000,
    transfer: 0, totalIng: 55200000, totalCost: 22400000, utilidad: 32800000
  },
  mesas: [
    { mesa:"A", sector:"VIP1", titular:"Fede L.", publica:"Toto M", importe:1800000, abonado:1800000, pendiente:0, consumo:450000 },
    { mesa:"B", sector:"VIP1", titular:"Nico R.", publica:"Zurdo", importe:1500000, abonado:1200000, pendiente:300000, consumo:380000 },
    { mesa:"C", sector:"VIP1", titular:"Manu G.", publica:"Toto M", importe:1800000, abonado:1800000, pendiente:0, consumo:520000 },
    { mesa:"D", sector:"VIP2", titular:"Santi P.", publica:"Juli", importe:1200000, abonado:1000000, pendiente:200000, consumo:310000 },
    { mesa:"E", sector:"VIP2", titular:"Gonza M.", publica:"Emi", importe:1200000, abonado:1200000, pendiente:0, consumo:290000 },
    { mesa:"F", sector:"VIP2", titular:"Facu T.", publica:"Zurdo", importe:1000000, abonado:800000, pendiente:200000, consumo:260000 },
    { mesa:"G", sector:"PISTA", titular:"Agus B.", publica:"Tomi", importe:900000, abonado:900000, pendiente:0, consumo:220000 },
    { mesa:"H", sector:"PISTA", titular:"Lucas V.", publica:"Emi", importe:900000, abonado:700000, pendiente:200000, consumo:180000 },
    { mesa:"I", sector:"PISTA", titular:"Mateo S.", publica:"Juli", importe:800000, abonado:800000, pendiente:0, consumo:200000 },
    { mesa:"J", sector:"PISTA", titular:"Thiago R.", publica:"Toto M", importe:1000000, abonado:900000, pendiente:100000, consumo:350000 },
    { mesa:"K", sector:"BARRA", titular:"Franco D.", publica:"Zurdo", importe:700000, abonado:700000, pendiente:0, consumo:150000 },
    { mesa:"L", sector:"BARRA", titular:"Benja A.", publica:"Tomi", importe:700000, abonado:500000, pendiente:200000, consumo:170000 },
    { mesa:"M", sector:"VIP1", titular:"Alan C.", publica:"Emi", importe:1600000, abonado:1600000, pendiente:0, consumo:410000 },
    { mesa:"N", sector:"VIP1", titular:"Tomas H.", publica:"Juli", importe:1500000, abonado:1300000, pendiente:200000, consumo:390000 },
    { mesa:"O", sector:"VIP2", titular:"Maxi L.", publica:"Toto M", importe:1100000, abonado:1100000, pendiente:0, consumo:280000 },
    { mesa:"P", sector:"VIP2", titular:"Ramiro F.", publica:"Zurdo", importe:1000000, abonado:800000, pendiente:200000, consumo:250000 },
    { mesa:"Q", sector:"PISTA", titular:"Julian K.", publica:"Tomi", importe:800000, abonado:800000, pendiente:0, consumo:190000 },
    { mesa:"R", sector:"PISTA", titular:"Nahuel M.", publica:"Emi", importe:850000, abonado:650000, pendiente:200000, consumo:210000 },
    { mesa:"S", sector:"BARRA", titular:"Ivan G.", publica:"Juli", importe:600000, abonado:600000, pendiente:0, consumo:130000 },
    { mesa:"T", sector:"BARRA", titular:"Leo P.", publica:"Toto M", importe:550000, abonado:400000, pendiente:150000, consumo:120000 },
    { mesa:"U", sector:"BARRA", titular:"Kevin S.", publica:"Zurdo", importe:500000, abonado:500000, pendiente:0, consumo:100000 }
  ],
  personal: [
    { rol:"Jefa camareras", qty:1, unit:65000, total:65000 },
    { rol:"Camareras", qty:6, unit:30000, total:180000 },
    { rol:"Barman", qty:4, unit:35000, total:140000 },
    { rol:"Seguridad interna", qty:9, unit:75000, total:675000 },
    { rol:"Bachero", qty:2, unit:25000, total:50000 },
    { rol:"Cajera barra", qty:2, unit:30000, total:60000 },
    { rol:"Cajera mesas", qty:1, unit:35000, total:35000 },
    { rol:"RRPP puerta", qty:2, unit:40000, total:80000 },
    { rol:"Luces", qty:1, unit:50000, total:50000 },
    { rol:"Sonido", qty:1, unit:60000, total:60000 },
    { rol:"Limpieza", qty:3, unit:20000, total:60000 },
    { rol:"Cortador de fiambre", qty:1, unit:25000, total:25000 },
    { rol:"Encargado barra", qty:1, unit:50000, total:50000 },
    { rol:"Coordinador general", qty:1, unit:80000, total:80000 },
    { rol:"Runner", qty:2, unit:25000, total:50000 },
    { rol:"Guardarropa", qty:1, unit:25000, total:25000 },
    { rol:"Auxiliar cocina", qty:1, unit:25000, total:25000 },
    { rol:"Control stock", qty:1, unit:30000, total:30000 },
    { rol:"Mantenimiento", qty:1, unit:30000, total:30000 },
    { rol:"Ticketera", qty:2, unit:25000, total:50000 }
  ],
  extras: [
    { concepto:"CDJ", monto:150000 },
    { concepto:"Policia adicional", monto:175000 },
    { concepto:"DJ Principal", monto:500000 },
    { concepto:"DJ Warm-up", monto:200000 },
    { concepto:"Hielo (bolsas)", monto:120000 },
    { concepto:"Seguridad extra", monto:350000 },
    { concepto:"Ambulancia", monto:80000 },
    { concepto:"Decoracion", monto:200000 },
    { concepto:"Flyerista + redes", monto:150000 },
    { concepto:"Limpieza extra", monto:60000 },
    { concepto:"Transporte artistas", monto:90000 },
    { concepto:"Gastos varios", monto:85000 }
  ],
  comisiones: [
    { vendedor:"Toto M", ventas:4860000, rate:0.10, comision:486000 },
    { vendedor:"Zurdo", ventas:6000000, rate:0.10, comision:600000 },
    { vendedor:"Juli", ventas:3500000, rate:0.10, comision:350000 },
    { vendedor:"Emi", ventas:3950000, rate:0.10, comision:395000 },
    { vendedor:"Tomi", ventas:2400000, rate:0.10, comision:240000 }
  ],
  boleteria: [
    { tipo:"Hombre", qty:320, precio:5000, total:1600000 },
    { tipo:"Mujer", qty:280, precio:3500, total:980000 },
    { tipo:"2x1", qty:60, precio:5000, total:300000 },
    { tipo:"Free / Lista", qty:85, precio:0, total:0 }
  ]
};

/* ─── TABS CONFIG ─── */
const TABS = [
  { id:"resumen", label:"Resumen", color:C.o },
  { id:"mesas", label:"Mesas", color:C.b },
  { id:"costos", label:"Costos", color:C.r },
  { id:"comisiones", label:"Comisiones", color:C.y },
  { id:"boleteria", label:"Boleteria", color:C.p }
];

/* ══════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                       */
/* ══════════════════════════════════════════════════════ */
export default function EventoLive() {
  const [tab, setTab] = useState("resumen");
  const [data, setData] = useState(SEED);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  /* ─── MULTI-EVENT STATE ─── */
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(false);

  /* ─── LOAD INDEX ─── */
  const loadIndex = useCallback(async () => {
    if (!INDEX_ID) return;
    setLoadingIndex(true);
    try {
      const rows = await fetchTab(INDEX_ID, "INDICE");
      const parsed = parseIndex(rows);
      setEventos(parsed);
      /* Auto-select EN VIVO event, or most recent */
      if (parsed.length > 0 && !selectedEvento) {
        const live = parsed.find(e => e.estado === "EN VIVO" || e.estado === "ABIERTO" || e.estado === "LIVE");
        setSelectedEvento(live || parsed[parsed.length - 1]);
      }
    } catch(e) {
      console.error("Error cargando indice:", e);
    } finally {
      setLoadingIndex(false);
    }
  }, [selectedEvento]);

  /* ─── LOAD EVENT DATA ─── */
  const loadEventData = useCallback(async (sheetId) => {
    if (!sheetId) return;
    setLoading(true);
    try {
      const tabNames = ["RESUMEN","MESAS","PERSONAL","EXTRAS","COMISIONES","BOLETERIA"];
      const results = {};
      await Promise.all(tabNames.map(async t => {
        try { results[t] = await fetchTab(sheetId, t); }
        catch(e) { console.warn("Tab " + t + ":", e.message); results[t] = []; }
      }));
      const newData = {
        resumen: results.RESUMEN?.length ? parseResumen(results.RESUMEN) : SEED.resumen,
        mesas: results.MESAS?.length ? parseMesas(results.MESAS) : SEED.mesas,
        personal: results.PERSONAL?.length ? parsePersonal(results.PERSONAL) : SEED.personal,
        extras: results.EXTRAS?.length ? parseExtras(results.EXTRAS) : SEED.extras,
        comisiones: results.COMISIONES?.length ? parseComisiones(results.COMISIONES) : SEED.comisiones,
        boleteria: results.BOLETERIA?.length ? parseBoleteria(results.BOLETERIA) : SEED.boleteria
      };
      setData(newData);
      setIsLive(true);
      setLastUpdate(new Date());
    } catch(e) {
      console.error("Error cargando evento:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── EFFECTS ─── */
  useEffect(() => {
    if (INDEX_ID) loadIndex();
  }, []);

  useEffect(() => {
    if (selectedEvento?.sheetId) {
      loadEventData(selectedEvento.sheetId);
      const iv = setInterval(() => loadEventData(selectedEvento.sheetId), REFRESH_MS);
      return () => clearInterval(iv);
    }
  }, [selectedEvento, loadEventData]);

  /* ─── DERIVED CALCS ─── */
  const totalPersonal = data.personal.reduce((s,r) => s + (r.total || r.qty * r.unit), 0);
  const totalExtras = data.extras.reduce((s,r) => s + r.monto, 0);
  const totalComisiones = data.comisiones.reduce((s,r) => s + r.comision, 0);
  const totalCostos = totalPersonal + totalExtras + totalComisiones;
  const totalMesas = data.mesas.reduce((s,m) => s + m.importe, 0);
  const totalAbonado = data.mesas.reduce((s,m) => s + m.abonado, 0);
  const totalPendiente = data.mesas.reduce((s,m) => s + m.pendiente, 0);
  const totalConsumo = data.mesas.reduce((s,m) => s + m.consumo, 0);
  const totalBoleteria = data.boleteria.reduce((s,b) => s + b.total, 0);
  const totalEntradas = data.boleteria.reduce((s,b) => s + b.qty, 0);

  const resumen = data.resumen || {};
  const ingresos = resumen.totalIng || (totalMesas + totalBoleteria);
  const utilidad = resumen.utilidad || (ingresos - totalCostos);
  const margen = ingresos > 0 ? utilidad / ingresos : 0;

  /* ─── STYLES ─── */
  const card = { background: C.s1, borderRadius: 12, border: "1px solid " + C.bd, padding: 20, marginBottom: 12 };
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
  const grid4 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 };
  const label = { fontSize: 10, color: C.t2, fontFamily: C.mono, textTransform: "uppercase", marginBottom: 4 };
  const val = { fontSize: 22, fontWeight: 700, fontFamily: C.mono };
  const thStyle = {
    padding: "8px 12px", textAlign: "left", fontSize: 10, color: C.t2,
    fontFamily: C.mono, textTransform: "uppercase", borderBottom: "1px solid " + C.bd
  };
  const tdStyle = {
    padding: "8px 12px", fontSize: 13, fontFamily: C.mono,
    borderBottom: "1px solid " + C.bd + "44"
  };

  const KPI = ({ label: lb, value, color = C.w, sub }) => (
    <div style={card}>
      <div style={label}>{lb}</div>
      <div style={{ ...val, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const Bar = ({ pct: p, color = C.g }) => (
    <div style={{ height: 4, background: C.s3, borderRadius: 2, marginTop: 6 }}>
      <div style={{ height: 4, background: color, borderRadius: 2, width: Math.min(p * 100, 100) + "%", transition: "width 0.5s" }} />
    </div>
  );

  /* ══════════════════════════════ */
  /*   EVENT SELECTOR COMPONENT    */
  /* ══════════════════════════════ */
  const EventSelector = () => {
    if (!INDEX_ID) return null;
    if (loadingIndex) return (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: C.t2 }}>Cargando eventos...</div>
      </div>
    );
    if (eventos.length === 0) return (
      <div style={{ ...card, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: C.t2 }}>No hay eventos en el indice. Agrega filas en la hoja INDICE.</div>
      </div>
    );
    return (
      <div style={{
        display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginRight: 4 }}>EVENTO:</div>
        {eventos.map((ev, i) => {
          const isActive = selectedEvento?.sheetId === ev.sheetId;
          const isEnVivo = ev.estado === "EN VIVO" || ev.estado === "ABIERTO" || ev.estado === "LIVE";
          return (
            <button
              key={i}
              onClick={() => { setSelectedEvento(ev); setIsLive(false); }}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: C.mono,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                border: isActive ? "1px solid " + C.o + "88" : "1px solid " + C.bd,
                background: isActive ? C.o + "18" : C.s2,
                color: isActive ? C.o : C.t2,
                transition: "all 0.2s"
              }}
            >
              {isEnVivo && (
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.g, display: "inline-block",
                  boxShadow: "0 0 6px " + C.g + "88",
                  animation: "pulse 2s infinite"
                }} />
              )}
              <span>{ev.nombre || ev.fecha}</span>
              {ev.fecha && ev.nombre && (
                <span style={{ fontSize: 10, color: C.t2, marginLeft: 2 }}>{ev.fecha}</span>
              )}
            </button>
          );
        })}
        <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
      </div>
    );
  };

  /* ══════════════════════════════ */
  /*       TAB: RESUMEN            */
  /* ══════════════════════════════ */
  const TabResumen = () => (
    <div>
      <div style={grid4}>
        <KPI label="Ingresos totales" value={fmt(ingresos)} color={C.g} />
        <KPI label="Costos totales" value={fmt(totalCostos)} color={C.r} />
        <KPI label="Utilidad neta" value={fmt(utilidad)} color={utilidad >= 0 ? C.g : C.r} />
        <KPI label="Margen" value={pct(margen)} color={margen > 0.4 ? C.g : margen > 0.2 ? C.y : C.r} />
      </div>

      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: C.w }}>
          Desglose de ingresos
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Mesas</div>
            <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resumen.mesas || totalMesas)}</div>
          </div>
          <div>
            <div style={label}>Tickets / Entradas</div>
            <div style={{ ...val, fontSize: 18, color: C.p }}>{fmt(resumen.tickets || totalBoleteria)}</div>
          </div>
          <div>
            <div style={label}>Efectivo</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(resumen.efectivo || 0)}</div>
          </div>
        </div>
        <div style={{ ...grid3, marginTop: 12 }}>
          <div>
            <div style={label}>Mercado Pago</div>
            <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resumen.mp || 0)}</div>
          </div>
          <div>
            <div style={label}>Transferencias</div>
            <div style={{ ...val, fontSize: 18, color: C.v }}>{fmt(resumen.transfer || 0)}</div>
          </div>
          <div>
            <div style={label}>Asistencia total</div>
            <div style={{ ...val, fontSize: 18, color: C.w }}>{totalEntradas}</div>
          </div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: C.w }}>
          Desglose de costos
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Personal</div>
            <div style={{ ...val, fontSize: 18, color: C.r }}>{fmt(totalPersonal)}</div>
            <Bar pct={totalCostos > 0 ? totalPersonal / totalCostos : 0} color={C.r} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostos > 0 ? pct(totalPersonal / totalCostos) : "0%"} del total
            </div>
          </div>
          <div>
            <div style={label}>Gastos extra</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(totalExtras)}</div>
            <Bar pct={totalCostos > 0 ? totalExtras / totalCostos : 0} color={C.o} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostos > 0 ? pct(totalExtras / totalCostos) : "0%"} del total
            </div>
          </div>
          <div>
            <div style={label}>Comisiones RRPP</div>
            <div style={{ ...val, fontSize: 18, color: C.y }}>{fmt(totalComisiones)}</div>
            <Bar pct={totalCostos > 0 ? totalComisiones / totalCostos : 0} color={C.y} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostos > 0 ? pct(totalComisiones / totalCostos) : "0%"} del total
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.w }}>
          Cobros - Senas y tickets
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Total comprometido</div>
            <div style={{ ...val, fontSize: 18, color: C.w }}>{fmt(totalMesas)}</div>
          </div>
          <div>
            <div style={label}>Cobrado</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(totalAbonado)}</div>
          </div>
          <div>
            <div style={label}>Pendiente</div>
            <div style={{ ...val, fontSize: 18, color: totalPendiente > 0 ? C.r : C.g }}>{fmt(totalPendiente)}</div>
          </div>
        </div>
        <Bar pct={totalMesas > 0 ? totalAbonado / totalMesas : 0} color={C.g} />
        <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
          {totalMesas > 0 ? pct(totalAbonado / totalMesas) : "0%"} cobrado
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════ */
  /*       TAB: MESAS              */
  /* ══════════════════════════════ */
  const TabMesas = () => {
    const sectors = [...new Set(data.mesas.map(m => m.sector))];
    return (
      <div>
        <div style={grid4}>
          <KPI label="Total mesas" value={data.mesas.length} color={C.b} />
          <KPI label="Importe total" value={fmt(totalMesas)} color={C.w} />
          <KPI label="Cobrado" value={fmt(totalAbonado)} color={C.g} sub={totalMesas > 0 ? pct(totalAbonado / totalMesas) : ""} />
          <KPI label="Pendiente" value={fmt(totalPendiente)} color={totalPendiente > 0 ? C.r : C.g} />
        </div>

        <div style={{ ...card, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.w }}>Por sector</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {sectors.map(sec => {
              const sm = data.mesas.filter(m => m.sector === sec);
              const si = sm.reduce((s,m) => s + m.importe, 0);
              return (
                <div key={sec} style={{ background: C.s2, borderRadius: 8, padding: 12, minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono }}>{sec}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.b, fontFamily: C.mono }}>{sm.length} mesas</div>
                  <div style={{ fontSize: 13, color: C.w, fontFamily: C.mono }}>{fmt(si)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Mesa","Sector","Titular","RRPP","Importe","Abonado","Pendiente","Consumo"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.mesas.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: C.b }}>{m.mesa}</td>
                  <td style={tdStyle}>{m.sector}</td>
                  <td style={{ ...tdStyle, color: C.w }}>{m.titular}</td>
                  <td style={{ ...tdStyle, color: C.t2 }}>{m.publica}</td>
                  <td style={{ ...tdStyle, color: C.w }}>{fmt(m.importe)}</td>
                  <td style={{ ...tdStyle, color: C.g }}>{fmt(m.abonado)}</td>
                  <td style={{ ...tdStyle, color: m.pendiente > 0 ? C.r : C.g }}>{fmt(m.pendiente)}</td>
                  <td style={{ ...tdStyle, color: C.v }}>{fmt(m.consumo)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: C.s3 }}>
                <td colSpan={4} style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.w }}>{fmt(totalMesas)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.g }}>{fmt(totalAbonado)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.r }}>{fmt(totalPendiente)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.v }}>{fmt(totalConsumo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════ */
  /*       TAB: COSTOS             */
  /* ══════════════════════════════ */
  const TabCostos = () => (
    <div>
      <div style={grid3}>
        <KPI label="Personal" value={fmt(totalPersonal)} color={C.r} sub={data.personal.length + " puestos"} />
        <KPI label="Gastos extra" value={fmt(totalExtras)} color={C.o} sub={data.extras.length + " items"} />
        <KPI label="Total costos" value={fmt(totalPersonal + totalExtras)} color={C.r} />
      </div>

      <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
        <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.w, borderBottom: "1px solid " + C.bd }}>
          Personal
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Rol / Puesto","Cant","Costo unit.","Subtotal"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.personal.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                <td style={{ ...tdStyle, color: C.w }}>{r.rol}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{r.qty}</td>
                <td style={tdStyle}>{fmt(r.unit)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.r }}>{fmt(r.total || r.qty * r.unit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.s3 }}>
              <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL PERSONAL</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: C.r }}>{fmt(totalPersonal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
        <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.w, borderBottom: "1px solid " + C.bd }}>
          Gastos extra
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Concepto","Monto"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.extras.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                <td style={{ ...tdStyle, color: C.w }}>{r.concepto}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.o }}>{fmt(r.monto)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.s3 }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL EXTRAS</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: C.o }}>{fmt(totalExtras)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════ */
  /*       TAB: COMISIONES         */
  /* ══════════════════════════════ */
  const TabComisiones = () => {
    const topV = data.comisiones.length > 0
      ? data.comisiones.reduce((a, b) => a.ventas > b.ventas ? a : b) : null;
    return (
      <div>
        <div style={grid3}>
          <KPI label="Total comisiones" value={fmt(totalComisiones)} color={C.y} />
          <KPI label="Vendedores activos" value={data.comisiones.length} color={C.w} />
          <KPI label="Top vendedor" value={topV ? topV.vendedor : "-"} color={C.g}
            sub={topV ? fmt(topV.ventas) + " en ventas" : ""} />
        </div>

        <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Vendedor / RRPP","Ventas","Tasa","Comision","% del total"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.comisiones.map((r, i) => {
                const com = r.comision || r.ventas * r.rate;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.w }}>{r.vendedor}</td>
                    <td style={tdStyle}>{fmt(r.ventas)}</td>
                    <td style={{ ...tdStyle, color: C.t2 }}>{pct(r.rate)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.y }}>{fmt(com)}</td>
                    <td style={{ ...tdStyle, color: C.t2 }}>
                      {totalComisiones > 0 ? pct(com / totalComisiones) : "0%"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: C.s3 }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>
                  {fmt(data.comisiones.reduce((s, r) => s + r.ventas, 0))}
                </td>
                <td style={tdStyle}></td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.y }}>{fmt(totalComisiones)}</td>
                <td style={tdStyle}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ ...card, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.w }}>Ranking por ventas</div>
          {[...data.comisiones].sort((a, b) => b.ventas - a.ventas).map((r, i) => {
            const maxV = Math.max(...data.comisiones.map(c => c.ventas));
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: C.mono, marginBottom: 4 }}>
                  <span style={{ color: C.w }}>{r.vendedor}</span>
                  <span style={{ color: C.y }}>{fmt(r.ventas)}</span>
                </div>
                <div style={{ height: 6, background: C.s3, borderRadius: 3 }}>
                  <div style={{
                    height: 6, borderRadius: 3, background: C.y,
                    width: (maxV > 0 ? (r.ventas / maxV) * 100 : 0) + "%",
                    transition: "width 0.5s"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════ */
  /*       TAB: BOLETERIA          */
  /* ══════════════════════════════ */
  const TabBoleteria = () => (
    <div>
      <div style={grid4}>
        <KPI label="Total recaudado" value={fmt(totalBoleteria)} color={C.p} />
        <KPI label="Entradas vendidas" value={totalEntradas} color={C.w} />
        <KPI label="Ticket promedio" value={totalEntradas > 0 ? fmt(totalBoleteria / totalEntradas) : "$0"} color={C.v} />
        <KPI label="Tipos de entrada" value={data.boleteria.length} color={C.t2} />
      </div>

      <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Tipo entrada","Cantidad","Precio unit.","Subtotal","% del total"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.boleteria.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.w }}>{r.tipo}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{r.qty}</td>
                <td style={tdStyle}>{fmt(r.precio)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.p }}>{fmt(r.total)}</td>
                <td style={{ ...tdStyle, color: C.t2 }}>
                  {totalBoleteria > 0 ? pct(r.total / totalBoleteria) : "0%"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.s3 }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL</td>
              <td style={{ ...tdStyle, fontWeight: 700, textAlign: "center" }}>{totalEntradas}</td>
              <td style={tdStyle}></td>
              <td style={{ ...tdStyle, fontWeight: 700, color: C.p }}>{fmt(totalBoleteria)}</td>
              <td style={tdStyle}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.w }}>Composicion de entradas</div>
        {data.boleteria.map((r, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: C.mono, marginBottom: 4 }}>
              <span style={{ color: C.w }}>{r.tipo}</span>
              <span style={{ color: C.p }}>{r.qty} entradas</span>
            </div>
            <div style={{ height: 6, background: C.s3, borderRadius: 3 }}>
              <div style={{
                height: 6, borderRadius: 3, background: C.p,
                width: (totalEntradas > 0 ? (r.qty / totalEntradas) * 100 : 0) + "%"
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ══════════════════════════════ */
  /*       RENDER                  */
  /* ══════════════════════════════ */
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>

      {/* MODO DEMO banner */}
      {!INDEX_ID && (
        <div style={{
          background: C.o + "15", border: "1px solid " + C.o + "44", borderRadius: 10,
          padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 18 }}>*</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.o }}>MODO DEMO</div>
            <div style={{ fontSize: 11, color: C.t2 }}>
              Datos de ejemplo (Sabado 13/12). Conecta el Sheet INDICE para ver eventos reales.
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.w, fontFamily: C.sans }}>
            Evento Live
          </div>
          <div style={{ fontSize: 12, color: C.t2, fontFamily: C.mono, marginTop: 2 }}>
            {isLive && selectedEvento
              ? (selectedEvento.nombre || selectedEvento.fecha)
              : "Sabado 13/12 - Datos demo"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdate && (
            <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
              {lastUpdate.toLocaleTimeString("es-AR")}
            </div>
          )}
          <div style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: C.mono, fontWeight: 600,
            background: loading ? C.y + "20" : isLive ? C.g + "20" : C.t2 + "20",
            color: loading ? C.y : isLive ? C.g : C.t2,
            border: "1px solid " + (loading ? C.y + "44" : isLive ? C.g + "44" : C.t2 + "44")
          }}>
            {loading ? "CARGANDO..." : isLive
              ? (selectedEvento?.estado === "EN VIVO" || selectedEvento?.estado === "ABIERTO" ? "EN VIVO" : "CERRADO")
              : "DEMO"}
          </div>
        </div>
      </div>

      {/* EVENT SELECTOR */}
      <EventSelector />

      {/* TAB NAV */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px", borderRadius: 20, fontSize: 12, fontFamily: C.mono,
              cursor: "pointer",
              border: tab === t.id ? "1px solid " + t.color + "66" : "1px solid transparent",
              background: tab === t.id ? t.color + "18" : "transparent",
              color: tab === t.id ? t.color : C.t2,
              transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === "resumen" && <TabResumen />}
      {tab === "mesas" && <TabMesas />}
      {tab === "costos" && <TabCostos />}
      {tab === "comisiones" && <TabComisiones />}
      {tab === "boleteria" && <TabBoleteria />}
    </div>
  );
}
