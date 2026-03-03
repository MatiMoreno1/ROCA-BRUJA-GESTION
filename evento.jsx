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
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const jsonStr = text.replace(/^[^{]*/, "").replace(/\);?\s*$/, "");
  const json = JSON.parse(jsonStr);
  const table = json?.table;
  if (!table || !table.cols || !table.rows) return [];
  const headers = table.cols.map((c, i) => (c.label || c.id || `col_${i}`).trim());
  return table.rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const cell = row.c?.[i];
      obj[h] = cell == null ? "" : (cell.v ?? cell.f ?? "");
    });
    return obj;
  });
}
async function tryFetchTab(sheetId, tabName) {
  try {
    // Usar endpoint JSON para obtener valores numéricos reales sin problemas de formato
    const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text || text.trim() === "") return [];
    // Google devuelve: google.visualization.Query.setResponse({...})
    const jsonStr = text.replace(/^[^{]*/, "").replace(/\);?\s*$/, "");
    const json = JSON.parse(jsonStr);
    const table = json?.table;
    if (!table || !table.cols || !table.rows) return [];
    // Construir headers desde cols[].label
    const headers = table.cols.map((c, i) => (c.label || c.id || `col_${i}`).trim());
    // Construir rows usando el valor numérico real (v) no el formateado (f)
    return table.rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const cell = row.c?.[i];
        if (cell == null) { obj[h] = ""; return; }
        // Preferir valor numérico real, sino formateado, sino vacío
        obj[h] = cell.v ?? cell.f ?? "";
      });
      return obj;
    });
  } catch(e) {
    // Fallback a CSV si JSON falla
    try { return await fetchTab(sheetId, tabName); }
    catch { return []; }
  }
}
function parseNum(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  let s = String(v).trim();
  // Quitar $ y espacios
  s = s.replace(/^\$/, "").replace(/\s/g, "");
  if (s === "" || s === "-") return 0;

  const hasComma = s.includes(",");
  const dotCount = (s.match(/\./g) || []).length;

  if (hasComma && dotCount >= 1) {
    // Formato europeo/AR: 1.234.567,89 → quitar puntos, coma a punto
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && dotCount === 0) {
    // Solo coma: puede ser decimal (1,5) o miles (1,500)
    const afterComma = s.split(",")[1] || "";
    if (afterComma.length === 3) {
      // 1,500 → miles → quitar coma
      s = s.replace(",", "");
    } else {
      // 1,5 → decimal → coma a punto
      s = s.replace(",", ".");
    }
  } else if (dotCount > 1) {
    // Múltiples puntos: 1.234.567 → separadores de miles
    s = s.replace(/\./g, "");
  } else if (dotCount === 1) {
    // Un solo punto: distinguir decimal vs miles
    const afterDot = s.split(".")[1] || "";
    if (afterDot.length === 3) {
      // 4.205 o 1.000 → separador de miles (formato AR)
      s = s.replace(".", "");
    }
    // Si afterDot.length !== 3 → decimal normal (1.5, 3.14)
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
    // Estructura real: SECTOR | TITULAR | PUBLICA | IMPORTE | ABONADO | PENDIENTE | CONSUMO 70% | CONSUMO 100%
    const sector = get(["sector"]) || "";
    const titular = get(["titular", "nombre"]) || "";
    // Ignorar fila de totales
    if (titular.toLowerCase().includes("total") || sector.toLowerCase().includes("total")) return null;
    const importe = parseNum(get(["importe", "total"]));
    const abonado = parseNum(get(["abonado", "pagado"]));
    const pendiente = parseNum(get(["pendiente", "debe"]));
    // Preferir CONSUMO 100% si existe, sino 70%
    const consumo100 = parseNum(get(["consumo 100", "100%"]));
    const consumo70  = parseNum(get(["consumo 70", "70%"]));
    const consumo    = consumo100 || consumo70 || parseNum(get(["consumo"]));
    return {
      mesa: sector,           // SECTOR es el ID de mesa (A, B, C...)
      sector: get(["sector"]) || "",
      titular,
      publica: get(["publica", "rrpp"]) || "",
      importe,
      abonado,
      pendiente,
      consumo
    };
  }).filter(m => m !== null && m.mesa && m.importe > 0 && !m.mesa.toLowerCase().includes("listado") && !m.mesa.toLowerCase().includes("sector"));
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
    const rol = get(["concepto", "rol", "puesto", "cargo"]) || "";
    if (!rol || rol.toLowerCase().includes("total")) return null;
    const qty  = parseNum(get(["cantidad", "cant", "qty"])) || 1;
    const unit = parseNum(get(["costo unit", "unit", "costo", "precio", "valor"]));
    const total = parseNum(get(["subtotal", "total"])) || qty * unit;
    return { rol, qty, unit, total };
  }).filter(r => r !== null && r.rol && r.total > 0);
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
    const concepto = get(["concepto", "gasto", "item", "detalle"]) || "";
    if (!concepto || concepto.toLowerCase().includes("total")) return null;
    const monto = parseNum(get(["importe", "monto", "total", "costo"]));
    return { concepto, monto };
  }).filter(r => r !== null && r.concepto && r.monto > 0);
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
    const vendedor = get(["publica", "vendedor", "rrpp", "nombre"]) || "";
    if (!vendedor || vendedor.toLowerCase().includes("total")) return null;
    // Ventas = suma de MESA $ + COMBOS $ + TICKETS $
    const ventasMesa   = parseNum(get(["mesa $", "mesa"]));
    const ventasCombos = parseNum(get(["combos $", "combos"]));
    const ventasTickets = parseNum(get(["tickets $", "tickets"]));
    const ventas = ventasMesa + ventasCombos + ventasTickets;
    // Comision = SUBTOTAL (suma de COM. MESA + COM. COMBOS + COM. TICKETS)
    const comision = parseNum(get(["subtotal"])) ||
      parseNum(get(["com. mesa"])) + parseNum(get(["com. combos"])) + parseNum(get(["com. tickets"]));
    const rate = ventas > 0 && comision > 0 ? comision / ventas : 0.10;
    return { vendedor, ventas, rate, comision };
  }).filter(r => r !== null && r.vendedor && r.ventas > 0);
}

/* ═══════════════════════════════════════════════════════════
   PARSE RESUMEN — FIX: detecta "lado a" e "ingresos previos"
   como sección de ingresos y como valor de mesas
   ═══════════════════════════════════════════════════════════ */
function parseResumen(rows) {
  const res = {};
  let seccion = "general";
  let posnetIdx = 0;
  rows.forEach(r => {
    const keys = Object.keys(r);
    const rawConcepto = (r[keys[0]] || "").trim();
    const concepto = rawConcepto.toLowerCase();
    const valor = parseNum(r[keys[1]] || r[keys[2]]);

    /* ── Detectar sección actual ── */
    if (concepto.includes("ingreso") && !concepto.includes("total") && !concepto.includes("sub") && !concepto.includes("comision") && !concepto.includes("neto")) {
      seccion = "ingresos";
    }
    // FIX: "lado a" e "ingresos previos" son sección ingresos
    if ((concepto.includes("lado a") || concepto.includes("ingresos previos")) && !concepto.includes("comision")) {
      seccion = "ingresos";
    }
    if ((concepto.includes("boleter") || concepto.includes("puerta")) && !concepto.includes("comision") && !concepto.includes("sub") && !concepto.includes("total")) {
      seccion = "boleteria";
    }
    if (concepto.includes("barra") && !concepto.includes("comision") && !concepto.includes("sub") && !concepto.includes("total")) {
      seccion = "barra";
    }
    if (concepto.includes("costo") || concepto.includes("egreso")) {
      seccion = "costos";
    }

    /* ── Valores estándar ── */
    // FIX: detectar "mesa", "lado a" e "ingresos lado" como ingresos de mesas/previos
    if ((concepto.includes("mesa") || concepto.includes("lado a") || concepto.includes("ingresos lado")) && !concepto.includes("comision") && !concepto.includes("sub") && !concepto.includes("total")) {
      res.mesas = valor;
    }
    else if (concepto.includes("ticket") || concepto.includes("entrada")) res.tickets = valor;
    else if ((concepto.includes("efectivo") || concepto.includes("cash")) && !concepto.includes("comision")) {
      if (seccion === "boleteria") res.efectivoBoleteria = valor;
      else if (seccion === "barra") res.efectivoBarra = valor;
      else res.efectivo = valor;
    }
    else if ((concepto.includes("mp") || concepto.includes("mercado") || concepto.includes("posnet")) && !concepto.includes("comision")) {
      if (seccion === "boleteria") res.mpBoleteria = valor;
      else if (seccion === "barra") res.mpBarra = valor;
      else res.mp = valor;
    }
    else if (concepto.includes("transfer")) res.transfer = valor;
    else if ((concepto.includes("ingreso") && concepto.includes("total")) || concepto.includes("total ing")) res.totalIng = valor;
    else if ((concepto.includes("costo") || concepto.includes("gasto")) && !concepto.includes("comision")) res.totalCost = valor;
    else if (concepto.includes("utilidad") || concepto.includes("resultado")) res.utilidad = valor;

    /* ── Sub-totales por sección ── */
    if (concepto.includes("sub") && concepto.includes("total")) {
      if (seccion === "ingresos") res.subtotalIngresos = valor;
      else if (seccion === "boleteria") res.subtotalBoleteria = valor;
      else if (seccion === "barra") res.subtotalBarra = valor;
    }
    // FIX: también detectar "subtotal ingresos previos" explícitamente
    if (concepto.includes("subtotal") && (concepto.includes("ingreso") || concepto.includes("previo"))) {
      res.subtotalIngresos = valor;
    }

    /* ══ COMISIONES POSNET ══ */
    if (concepto.includes("comision") && (concepto.includes("posnet") || concepto.includes("pos"))) {
      if (concepto.includes("ingreso") || concepto.includes("mesa")) {
        res.comPosnetIngresos = valor;
      } else if (concepto.includes("boleter") || concepto.includes("puerta")) {
        res.comPosnetBoleteria = valor;
      } else if (concepto.includes("barra")) {
        res.comPosnetBarra = valor;
      } else {
        if (seccion === "ingresos") res.comPosnetIngresos = valor;
        else if (seccion === "boleteria") res.comPosnetBoleteria = valor;
        else if (seccion === "barra") res.comPosnetBarra = valor;
        else {
          posnetIdx++;
          if (posnetIdx === 1) res.comPosnetIngresos = valor;
          else if (posnetIdx === 2) res.comPosnetBoleteria = valor;
          else if (posnetIdx === 3) res.comPosnetBarra = valor;
        }
      }
    }
  });
  res.totalComPosnet = (res.comPosnetIngresos || 0) + (res.comPosnetBoleteria || 0) + (res.comPosnetBarra || 0);
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
    const tipo = get(["tipo entrada", "tipo", "categoria", "entrada"]) || "";
    if (!tipo || tipo.toLowerCase().includes("total")) return null;
    const qty    = parseNum(get(["cantidad", "cant", "qty"]));
    const precio = parseNum(get(["precio unit", "precio", "valor", "unit"]));
    // "Total Persona" es el total recaudado
    const total  = parseNum(get(["total persona", "total", "recaudado", "subtotal"])) || qty * precio;
    return { tipo, qty, precio, total };
  }).filter(r => r !== null && r.tipo);
}
/* ─── SEED DATA (demo) ─── */
const SEED = {
  resumen: {
    mesas: 21000000, tickets: 2700000, efectivo: 13900000, mp: 19300000,
    transfer: 0, totalIng: 55200000, totalCost: 22400000, utilidad: 32800000,
    comPosnetIngresos: 525000, comPosnetBoleteria: 135000, comPosnetBarra: 965000,
    totalComPosnet: 1625000,
    subtotalIngresos: 0, subtotalBoleteria: 0, subtotalBarra: 0,
    efectivoBoleteria: 0, mpBoleteria: 0, efectivoBarra: 0, mpBarra: 0
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
  const [resumenSource, setResumenSource] = useState("");
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

  /* ═══════════════════════════════════════════════════════
     LOAD EVENT DATA
     Prioridad: HOJA FINAL > RESUMEN > RESUMEN LADO A
     FIX: parseResumen ahora detecta "lado a" correctamente
     ═══════════════════════════════════════════════════════ */
  const loadEventData = useCallback(async (sheetId, eventoNombre) => {
    if (!sheetId) return;
    setLoading(true);
    const eViernes = (eventoNombre || "").toLowerCase().includes("viernes");
    try {
      const tabNames = ["MESAS","PERSONAL","EXTRAS","COMISIONES","BOLETERIA"];
      const results = {};
      await Promise.all(tabNames.map(async t => {
        try { results[t] = await fetchTab(sheetId, t); }
        catch(e) { results[t] = []; }
      }));

      /* ── Cargar RESUMEN con prioridad: HOJA FINAL > RESUMEN > RESUMEN LADO A ── */
      let resumenRows = [];
      let source = "";

      // HOJA FINAL solo para sábados (tiene Sabado + Master combinado)
      // Para viernes no existe HOJA FINAL, pero si existe la cargamos igual
      const hojaFinal = await tryFetchTab(sheetId, "HOJA FINAL");
      if (hojaFinal.length > 0) {
        resumenRows = hojaFinal;
        source = "HOJA FINAL";
      }

      if (resumenRows.length === 0) {
        const resumen = await tryFetchTab(sheetId, "RESUMEN");
        if (resumen.length > 0) {
          resumenRows = resumen;
          source = "RESUMEN";
        }
      }

      if (resumenRows.length === 0) {
        const ladoA = await tryFetchTab(sheetId, "RESUMEN LADO A");
        if (ladoA.length > 0) {
          resumenRows = ladoA;
          source = "RESUMEN LADO A";
        }
      }

      /* ── RESUMEN MASTER: solo cargar si NO es viernes ── */
      let resumenMasterRows = [];
      if (!eViernes) {
        resumenMasterRows = await tryFetchTab(sheetId, "RESUMEN MASTER");
      }

      /* ── RESUMEN LADO A para fallback de mesas ── */
      const resumenLadoA = source !== "RESUMEN LADO A"
        ? await tryFetchTab(sheetId, "RESUMEN LADO A")
        : [];

      console.log("📊 Resumen leído de:", source, "| Filas:", resumenRows.length,
        "| Master:", resumenMasterRows.length > 0 ? "SI" : "NO",
        "| Viernes:", eViernes);

      let parsedResumen = resumenRows.length > 0 ? parseResumen(resumenRows) : SEED.resumen;

      // Fallback: si no encontró mesas, buscar en RESUMEN LADO A
      if (!parsedResumen.mesas && resumenLadoA.length > 0) {
        const parsedLadoA = parseResumen(resumenLadoA);
        if (parsedLadoA.mesas) {
          parsedResumen.mesas = parsedLadoA.mesas;
          parsedResumen.subtotalIngresos = parsedLadoA.subtotalIngresos || parsedResumen.subtotalIngresos;
          parsedResumen.comPosnetIngresos = parsedLadoA.comPosnetIngresos || parsedResumen.comPosnetIngresos;
          parsedResumen.totalComPosnet = (parsedResumen.comPosnetIngresos || 0)
            + (parsedResumen.comPosnetBoleteria || 0)
            + (parsedResumen.comPosnetBarra || 0);
          console.log("📊 FIX: mesas completadas desde RESUMEN LADO A:", parsedResumen.mesas);
        }
      }

      const newData = {
        resumen: parsedResumen,
        resumenMaster: resumenMasterRows.length > 0 ? parseResumen(resumenMasterRows) : null,
        resumenLadoA: (source !== "RESUMEN LADO A" && resumenLadoA.length > 0)
          ? parseResumen(resumenLadoA) : null,
        mesas: results.MESAS?.length ? parseMesas(results.MESAS) : SEED.mesas,
        personal: results.PERSONAL?.length ? parsePersonal(results.PERSONAL) : SEED.personal,
        extras: results.EXTRAS?.length ? parseExtras(results.EXTRAS) : SEED.extras,
        comisiones: results.COMISIONES?.length ? parseComisiones(results.COMISIONES) : SEED.comisiones,
        boleteria: results.BOLETERIA?.length ? parseBoleteria(results.BOLETERIA) : SEED.boleteria
      };
      setData(newData);
      setResumenSource(source + (resumenMasterRows.length > 0 ? " + RESUMEN MASTER" : ""));
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
      loadEventData(selectedEvento.sheetId, selectedEvento.nombre);
      const iv = setInterval(() => loadEventData(selectedEvento.sheetId, selectedEvento.nombre), REFRESH_MS);
      return () => clearInterval(iv);
    }
  }, [selectedEvento, loadEventData]);

  /* ─── TIPO EVENTO (viernes / master / sabado) ─── */
  const tipoEvento = selectedEvento
    ? (selectedEvento.nombre || "").toLowerCase().includes("viernes") ? "viernes"
      : (selectedEvento.nombre || "").toLowerCase().includes("master") ? "master"
      : "sabado"
    : "sabado";
  const labelEvento = tipoEvento === "viernes" ? "Viernes"
    : tipoEvento === "master" ? "Master" : "Sabado";

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
  /* ── Comisiones Posnet ── */
  const comPosnetIngresos = resumen.comPosnetIngresos || 0;
  const comPosnetBoleteria = resumen.comPosnetBoleteria || 0;
  const comPosnetBarra = resumen.comPosnetBarra || 0;
  const totalComPosnet = comPosnetIngresos + comPosnetBoleteria + comPosnetBarra;
  const totalCostosConPosnet = totalCostos + totalComPosnet;
  const utilidad = resumen.utilidad || (ingresos - totalCostosConPosnet);
  const margen = ingresos > 0 ? utilidad / ingresos : 0;
  /* ── Resumen Master — solo si el evento NO es viernes y realmente hay datos ── */
  const resMaster = (tipoEvento !== "viernes" && data.resumenMaster) ? data.resumenMaster : null;
  const comPosnetIngresosMaster = resMaster?.comPosnetIngresos || 0;
  const comPosnetBoleteriaMaster = resMaster?.comPosnetBoleteria || 0;
  const comPosnetBarraMaster = resMaster?.comPosnetBarra || 0;
  const totalComPosnetMaster = comPosnetIngresosMaster + comPosnetBoleteriaMaster + comPosnetBarraMaster;

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
  const PosnetCard = ({ titulo, posnetIng, posnetBol, posnetBar, totalPosnet }) => {
    if (!posnetIng && !posnetBol && !posnetBar) return null;
    return (
      <div style={{ ...card, marginTop: 8, border: "1px solid " + C.o + "33" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.o }}>
          {titulo || "Comisiones Posnet"}
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Ingresos Previos (2.5%)</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(posnetIng)}</div>
          </div>
          <div>
            <div style={label}>Boleteria (5%)</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(posnetBol)}</div>
          </div>
          <div>
            <div style={label}>Barra (5%)</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(posnetBar)}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid " + C.bd }}>
          <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>TOTAL COMISIONES POSNET</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.o, fontFamily: C.mono }}>{fmt(totalPosnet)}</span>
        </div>
      </div>
    );
  };
  const EventSelector = () => {
    if (!INDEX_ID) return null;
    if (loadingIndex) return (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: C.t2 }}>Cargando eventos...</div>
      </div>
    );
    if (eventos.length === 0) return (
      <div style={{ ...card, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: C.t2 }}>No hay eventos en el indice.</div>
      </div>
    );
    return (
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginRight: 4 }}>EVENTO:</div>
        {eventos.map((ev, i) => {
          const isActive = selectedEvento?.sheetId === ev.sheetId;
          const isEnVivo = ev.estado === "EN VIVO" || ev.estado === "ABIERTO" || ev.estado === "LIVE";
          return (
            <button key={i} onClick={() => { setSelectedEvento(ev); setIsLive(false); }}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: C.mono,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                border: isActive ? "1px solid " + C.o + "88" : "1px solid " + C.bd,
                background: isActive ? C.o + "18" : C.s2,
                color: isActive ? C.o : C.t2, transition: "all 0.2s"
              }}>
              {isEnVivo && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.g,
                  display: "inline-block", boxShadow: "0 0 6px " + C.g + "88", animation: "pulse 2s infinite" }} />
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

  const TabResumen = () => (
    <div>
      <div style={grid4}>
        <KPI label="Ingresos totales" value={fmt(ingresos)} color={C.g} />
        <KPI label="Costos totales" value={fmt(totalCostosConPosnet)} color={C.r}
          sub={totalComPosnet > 0 ? "incl. " + fmt(totalComPosnet) + " posnet" : ""} />
        <KPI label="Utilidad neta" value={fmt(utilidad)} color={utilidad >= 0 ? C.g : C.r} />
        <KPI label="Margen" value={pct(margen)} color={margen > 0.4 ? C.g : margen > 0.2 ? C.y : C.r} />
      </div>
      {resumenSource && (
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono, marginBottom: 8, textAlign: "right" }}>
          Datos de: {resumenSource}
        </div>
      )}
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.b }}>
          Ingresos Previos {resMaster ? `(${labelEvento})` : ""}
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
            <div style={label}>Comision Posnet 2.5%</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{comPosnetIngresos > 0 ? "-" : ""}{fmt(comPosnetIngresos)}</div>
          </div>
        </div>
        {resumen.subtotalIngresos > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid " + C.bd }}>
            <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>SUBTOTAL INGRESOS PREVIOS</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.b, fontFamily: C.mono }}>{fmt(resumen.subtotalIngresos)}</span>
          </div>
        )}
      </div>
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: C.w }}>
          Desglose general {resMaster ? `(${labelEvento})` : ""}
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Efectivo</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(resumen.efectivo || 0)}</div>
          </div>
          <div>
            <div style={label}>Mercado Pago</div>
            <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resumen.mp || 0)}</div>
          </div>
          <div>
            <div style={label}>Transferencias</div>
            <div style={{ ...val, fontSize: 18, color: C.v }}>{fmt(resumen.transfer || 0)}</div>
          </div>
        </div>
        <div style={{ ...grid3, marginTop: 12 }}>
          <div>
            <div style={label}>Asistencia total</div>
            <div style={{ ...val, fontSize: 18, color: C.w }}>{totalEntradas}</div>
          </div>
          <div>
            <div style={label}>Ingreso total</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(ingresos)}</div>
          </div>
          <div></div>
        </div>
      </div>
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.p }}>
          Boleteria {resMaster ? `(${labelEvento})` : ""}
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Efectivo</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(resumen.efectivoBoleteria || 0)}</div>
          </div>
          <div>
            <div style={label}>MP / Posnet</div>
            <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resumen.mpBoleteria || 0)}</div>
          </div>
          <div>
            <div style={label}>Comision Posnet 5%</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{comPosnetBoleteria > 0 ? "-" : ""}{fmt(comPosnetBoleteria)}</div>
          </div>
        </div>
        {resumen.subtotalBoleteria > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid " + C.bd }}>
            <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>SUBTOTAL BOLETERIA</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.p, fontFamily: C.mono }}>{fmt(resumen.subtotalBoleteria)}</span>
          </div>
        )}
      </div>
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.v }}>
          Barra MP {resMaster ? `(${labelEvento})` : ""}
        </div>
        <div style={grid3}>
          <div>
            <div style={label}>Efectivo</div>
            <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(resumen.efectivoBarra || 0)}</div>
          </div>
          <div>
            <div style={label}>MP / Posnet</div>
            <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resumen.mpBarra || 0)}</div>
          </div>
          <div>
            <div style={label}>Comision Posnet 5%</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{comPosnetBarra > 0 ? "-" : ""}{fmt(comPosnetBarra)}</div>
          </div>
        </div>
        {resumen.subtotalBarra > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid " + C.bd }}>
            <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>SUBTOTAL BARRA</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.v, fontFamily: C.mono }}>{fmt(resumen.subtotalBarra)}</span>
          </div>
        )}
      </div>
      <PosnetCard
        titulo={resMaster ? `Comisiones Posnet (${labelEvento})` : "Comisiones Posnet"}
        posnetIng={comPosnetIngresos} posnetBol={comPosnetBoleteria}
        posnetBar={comPosnetBarra} totalPosnet={totalComPosnet}
      />
      {resMaster && (
        <>
          <div style={{ ...card, marginTop: 16, border: "1px solid " + C.v + "44" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: C.v }}>MASTER</div>
            <div style={grid3}>
              <div>
                <div style={label}>Mesas Master</div>
                <div style={{ ...val, fontSize: 18, color: C.b }}>{fmt(resMaster.mesas || 0)}</div>
                {comPosnetIngresosMaster > 0 && (
                  <div style={{ fontSize: 11, color: C.o, fontFamily: C.mono, marginTop: 4 }}>
                    Posnet 2.5%: -{fmt(comPosnetIngresosMaster)}
                  </div>
                )}
              </div>
              <div>
                <div style={label}>Tickets Master</div>
                <div style={{ ...val, fontSize: 18, color: C.p }}>{fmt(resMaster.tickets || 0)}</div>
              </div>
              <div>
                <div style={label}>Ingreso Total Master</div>
                <div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(resMaster.totalIng || 0)}</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.p, marginBottom: 8 }}>Boleteria Master</div>
              <div style={grid3}>
                <div><div style={label}>Efectivo</div><div style={{ ...val, fontSize: 16, color: C.g }}>{fmt(resMaster.efectivoBoleteria || 0)}</div></div>
                <div><div style={label}>MP / Posnet</div><div style={{ ...val, fontSize: 16, color: C.b }}>{fmt(resMaster.mpBoleteria || 0)}</div></div>
                <div><div style={label}>Comision Posnet 5%</div><div style={{ ...val, fontSize: 16, color: C.o }}>{comPosnetBoleteriaMaster > 0 ? "-" : ""}{fmt(comPosnetBoleteriaMaster)}</div></div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.v, marginBottom: 8 }}>Barra Master</div>
              <div style={grid3}>
                <div><div style={label}>Efectivo</div><div style={{ ...val, fontSize: 16, color: C.g }}>{fmt(resMaster.efectivoBarra || 0)}</div></div>
                <div><div style={label}>MP / Posnet</div><div style={{ ...val, fontSize: 16, color: C.b }}>{fmt(resMaster.mpBarra || 0)}</div></div>
                <div><div style={label}>Comision Posnet 5%</div><div style={{ ...val, fontSize: 16, color: C.o }}>{comPosnetBarraMaster > 0 ? "-" : ""}{fmt(comPosnetBarraMaster)}</div></div>
              </div>
            </div>
          </div>
          <PosnetCard titulo="Comisiones Posnet (Master)"
            posnetIng={comPosnetIngresosMaster} posnetBol={comPosnetBoleteriaMaster}
            posnetBar={comPosnetBarraMaster} totalPosnet={totalComPosnetMaster}
          />
          <div style={{ ...card, marginTop: 8, background: C.s2, border: "1px solid " + C.o + "55" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.o, fontFamily: C.mono }}>TOTAL POSNET SAB + MASTER</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.o, fontFamily: C.mono }}>{fmt(totalComPosnet + totalComPosnetMaster)}</span>
            </div>
          </div>
        </>
      )}
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: C.w }}>Desglose de costos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={label}>Personal</div>
            <div style={{ ...val, fontSize: 18, color: C.r }}>{fmt(totalPersonal)}</div>
            <Bar pct={totalCostosConPosnet > 0 ? totalPersonal / totalCostosConPosnet : 0} color={C.r} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostosConPosnet > 0 ? pct(totalPersonal / totalCostosConPosnet) : "0%"} del total
            </div>
          </div>
          <div>
            <div style={label}>Gastos extra</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(totalExtras)}</div>
            <Bar pct={totalCostosConPosnet > 0 ? totalExtras / totalCostosConPosnet : 0} color={C.o} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostosConPosnet > 0 ? pct(totalExtras / totalCostosConPosnet) : "0%"} del total
            </div>
          </div>
          <div>
            <div style={label}>Comisiones RRPP</div>
            <div style={{ ...val, fontSize: 18, color: C.y }}>{fmt(totalComisiones)}</div>
            <Bar pct={totalCostosConPosnet > 0 ? totalComisiones / totalCostosConPosnet : 0} color={C.y} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostosConPosnet > 0 ? pct(totalComisiones / totalCostosConPosnet) : "0%"} del total
            </div>
          </div>
          <div>
            <div style={label}>Comisiones Posnet</div>
            <div style={{ ...val, fontSize: 18, color: C.o }}>{fmt(totalComPosnet + totalComPosnetMaster)}</div>
            <Bar pct={totalCostosConPosnet > 0 ? totalComPosnet / totalCostosConPosnet : 0} color={C.o} />
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
              {totalCostosConPosnet > 0 ? pct(totalComPosnet / totalCostosConPosnet) : "0%"} del total
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.w }}>Cobros - Senas y tickets</div>
        <div style={grid3}>
          <div><div style={label}>Total comprometido</div><div style={{ ...val, fontSize: 18, color: C.w }}>{fmt(totalMesas)}</div></div>
          <div><div style={label}>Cobrado</div><div style={{ ...val, fontSize: 18, color: C.g }}>{fmt(totalAbonado)}</div></div>
          <div><div style={label}>Pendiente</div><div style={{ ...val, fontSize: 18, color: totalPendiente > 0 ? C.r : C.g }}>{fmt(totalPendiente)}</div></div>
        </div>
        <Bar pct={totalMesas > 0 ? totalAbonado / totalMesas : 0} color={C.g} />
        <div style={{ fontSize: 10, color: C.t2, marginTop: 4, fontFamily: C.mono }}>
          {totalMesas > 0 ? pct(totalAbonado / totalMesas) : "0%"} cobrado
        </div>
      </div>
    </div>
  );

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
              <tr>{["Mesa","Sector","Titular","RRPP","Importe","Abonado","Pendiente","Consumo"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
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

  const TabCostos = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <KPI label="Personal" value={fmt(totalPersonal)} color={C.r} sub={data.personal.length + " puestos"} />
        <KPI label="Gastos extra" value={fmt(totalExtras)} color={C.o} sub={data.extras.length + " items"} />
        <KPI label="Com. Posnet" value={fmt(totalComPosnet + totalComPosnetMaster)} color={C.o} sub="Ing 2.5% + Bol/Bar 5%" />
        <KPI label="Total costos" value={fmt(totalCostosConPosnet)} color={C.r} />
      </div>
      {(totalComPosnet > 0 || totalComPosnetMaster > 0) && (
        <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
          <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.o, borderBottom: "1px solid " + C.bd }}>
            Comisiones Posnet
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Seccion","Tasa","Sabado","Master","Total"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              <tr style={{ background: C.s2 + "44" }}>
                <td style={{ ...tdStyle, color: C.w }}>Ingresos Previos (Mesas + Tickets)</td>
                <td style={{ ...tdStyle, color: C.t2 }}>2.5%</td>
                <td style={{ ...tdStyle, color: C.o }}>{fmt(comPosnetIngresos)}</td>
                <td style={{ ...tdStyle, color: C.v }}>{fmt(comPosnetIngresosMaster)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.o }}>{fmt(comPosnetIngresos + comPosnetIngresosMaster)}</td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, color: C.w }}>Boleteria</td>
                <td style={{ ...tdStyle, color: C.t2 }}>5%</td>
                <td style={{ ...tdStyle, color: C.o }}>{fmt(comPosnetBoleteria)}</td>
                <td style={{ ...tdStyle, color: C.v }}>{fmt(comPosnetBoleteriaMaster)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.o }}>{fmt(comPosnetBoleteria + comPosnetBoleteriaMaster)}</td>
              </tr>
              <tr style={{ background: C.s2 + "44" }}>
                <td style={{ ...tdStyle, color: C.w }}>Barra</td>
                <td style={{ ...tdStyle, color: C.t2 }}>5%</td>
                <td style={{ ...tdStyle, color: C.o }}>{fmt(comPosnetBarra)}</td>
                <td style={{ ...tdStyle, color: C.v }}>{fmt(comPosnetBarraMaster)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.o }}>{fmt(comPosnetBarra + comPosnetBarraMaster)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ background: C.s3 }}>
                <td colSpan={2} style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.o }}>{fmt(totalComPosnet)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.v }}>{fmt(totalComPosnetMaster)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.o }}>{fmt(totalComPosnet + totalComPosnetMaster)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <div style={{ ...card, marginTop: 8, padding: 0, overflow: "auto" }}>
        <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.w, borderBottom: "1px solid " + C.bd }}>Personal</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Rol / Puesto","Cant","Costo unit.","Subtotal"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
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
        <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.w, borderBottom: "1px solid " + C.bd }}>Gastos extra</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Concepto","Monto"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
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
            <thead><tr>{["Vendedor / RRPP","Ventas","Tasa","Comision","% del total"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {data.comisiones.map((r, i) => {
                const com = r.comision || r.ventas * r.rate;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.w }}>{r.vendedor}</td>
                    <td style={tdStyle}>{fmt(r.ventas)}</td>
                    <td style={{ ...tdStyle, color: C.t2 }}>{pct(r.rate)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.y }}>{fmt(com)}</td>
                    <td style={{ ...tdStyle, color: C.t2 }}>{totalComisiones > 0 ? pct(com / totalComisiones) : "0%"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: C.s3 }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: C.w }}>TOTAL</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(data.comisiones.reduce((s, r) => s + r.ventas, 0))}</td>
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
                  <div style={{ height: 6, borderRadius: 3, background: C.y, width: (maxV > 0 ? (r.ventas / maxV) * 100 : 0) + "%", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
          <thead><tr>{["Tipo entrada","Cantidad","Precio unit.","Subtotal","% del total"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data.boleteria.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s2 + "44" }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.w }}>{r.tipo}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{r.qty}</td>
                <td style={tdStyle}>{fmt(r.precio)}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.p }}>{fmt(r.total)}</td>
                <td style={{ ...tdStyle, color: C.t2 }}>{totalBoleteria > 0 ? pct(r.total / totalBoleteria) : "0%"}</td>
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
              <div style={{ height: 6, borderRadius: 3, background: C.p, width: (totalEntradas > 0 ? (r.qty / totalEntradas) * 100 : 0) + "%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      {!INDEX_ID && (
        <div style={{ background: C.o + "15", border: "1px solid " + C.o + "44", borderRadius: 10,
          padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>*</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.o }}>MODO DEMO</div>
            <div style={{ fontSize: 11, color: C.t2 }}>Datos de ejemplo. Conecta el Sheet INDICE para ver eventos reales.</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.w, fontFamily: C.sans }}>Evento Live</div>
          <div style={{ fontSize: 12, color: C.t2, fontFamily: C.mono, marginTop: 2 }}>
            {isLive && selectedEvento ? (selectedEvento.nombre || selectedEvento.fecha) : "Sabado 13/12 - Datos demo"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdate && <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>{lastUpdate.toLocaleTimeString("es-AR")}</div>}
          <div style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: C.mono, fontWeight: 600,
            background: loading ? C.y + "20" : isLive ? C.g + "20" : C.t2 + "20",
            color: loading ? C.y : isLive ? C.g : C.t2,
            border: "1px solid " + (loading ? C.y + "44" : isLive ? C.g + "44" : C.t2 + "44") }}>
            {loading ? "CARGANDO..." : isLive
              ? (selectedEvento?.estado === "EN VIVO" || selectedEvento?.estado === "ABIERTO" ? "EN VIVO" : "CERRADO")
              : "DEMO"}
          </div>
        </div>
      </div>
      <EventSelector />
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "8px 18px", borderRadius: 20, fontSize: 12, fontFamily: C.mono, cursor: "pointer",
              border: tab === t.id ? "1px solid " + t.color + "66" : "1px solid transparent",
              background: tab === t.id ? t.color + "18" : "transparent",
              color: tab === t.id ? t.color : C.t2, transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "resumen" && <TabResumen />}
      {tab === "mesas" && <TabMesas />}
      {tab === "costos" && <TabCostos />}
      {tab === "comisiones" && <TabComisiones />}
      {tab === "boleteria" && <TabBoleteria />}
    </div>
  );
}
