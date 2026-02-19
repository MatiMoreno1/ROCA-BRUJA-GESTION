import Papa from "papaparse";

const BASE = "https://docs.google.com/spreadsheets/d";

/* ── Fetch via CSV (para datos simples) ── */
export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

/* ── Fetch via JSON (devuelve valores calculados, no fórmulas) ── */
async function fetchSheetJSON(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  // Google devuelve /*O_o*/\ngoogle.visualization.Query.setResponse({...})
  const json = JSON.parse(text.replace(/^[^{]+/, "").replace(/\);?\s*$/, ""));
  const cols = json.table.cols.map((c) => c.label || c.id);
  return (json.table.rows || []).map((row) => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? cell.v : null;
    });
    return obj;
  });
}

export const SHEET_IDS = {
  indice:    "1lod65Sae0WkJRq6YVpYj_CtJmeBNPlU1ETRCW2RQBD8",
  ejecutivo: "1b9uAf6a6TaZcEJk204SZ_uOScFXWYf1K",
};

const MESES = [
  { num:1,  nombre:"ENE", tab:"ENERO_MENSUAL" },
  { num:2,  nombre:"FEB", tab:"FEBRERO_MENSUAL" },
  { num:3,  nombre:"MAR", tab:"MARZO_MENSUAL" },
  { num:4,  nombre:"ABR", tab:"ABRIL_MENSUAL" },
  { num:5,  nombre:"MAY", tab:"MAYO_MENSUAL" },
  { num:6,  nombre:"JUN", tab:"JUNIO_MENSUAL" },
  { num:7,  nombre:"JUL", tab:"JULIO_MENSUAL" },
  { num:8,  nombre:"AGO", tab:"AGOSTO_MENSUAL" },
  { num:9,  nombre:"SEP", tab:"SEPTIEMBRE_MENSUAL" },
  { num:10, nombre:"OCT", tab:"OCTUBRE_MENSUAL" },
  { num:11, nombre:"NOV", tab:"NOVIEMBRE_MENSUAL" },
  { num:12, nombre:"DIC", tab:"DICIEMBRE_MENSUAL" },
];

function parseNum(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const clean = String(val).replace(/[^0-9.-]/g, "");
  return parseFloat(clean) || 0;
}

/* ── Leer ingresos de hoja mensual via JSON (valores calculados) ── */
async function fetchIngresosMes(sheetId, tab) {
  try {
    const rows = await fetchSheetJSON(sheetId, tab);
    let total = 0;
    let enIngresos = false;

    for (const row of rows) {
      // Los valores vienen por índice de columna en JSON
      const vals = Object.values(row);
      const textos = vals.map((v) => String(v || "").toUpperCase());
      const rowText = textos.join(" ");

      if (rowText.includes("INGRESO") && !rowText.includes("TOTAL")) enIngresos = true;
      if (rowText.includes("EGRESO") || rowText.includes("COSTO")) { enIngresos = false; continue; }
      if (rowText.includes("TOTAL INGRESO")) continue;

      if (enIngresos) {
        // Buscar el primer valor numérico positivo en la fila
        for (const v of vals) {
          if (typeof v === "number" && v > 0) {
            total += v;
            break;
          }
        }
      }
    }
    return total;
  } catch (e) {
    console.warn(`fetchIngresosMes ${tab}:`, e.message);
    return 0;
  }
}

/* ── Leer egresos de PAGOS_MAESTRO via JSON ── */
async function fetchPagosMaestro(sheetId) {
  try {
    const rows = await fetchSheetJSON(sheetId, "PAGOS_MAESTRO");
    const porMes = {};
    const porConcepto = {};

    for (const row of rows) {
      // Columnas: FECHA, CONCEPTO, SUB-CONCEPTO, MONTO, MES, ESTADO, NOTAS
      const vals = Object.values(row);
      const fecha    = vals[0]; // Date object o string
      const concepto = String(vals[1] || "");
      const monto    = typeof vals[3] === "number" ? vals[3] : parseNum(vals[3]);

      if (!fecha || !concepto || monto <= 0) continue;

      // Extraer mes
      let mes = null;
      if (fecha instanceof Date || (typeof fecha === "object" && fecha !== null)) {
        mes = new Date(fecha).getMonth() + 1;
      } else if (typeof fecha === "string") {
        const p = fecha.includes("/") ? fecha.split("/") : fecha.split("-");
        mes = p.length === 3 ? parseInt(fecha.includes("/") ? p[1] : p[1]) : null;
      }
      if (!mes || mes < 1 || mes > 12) continue;

      if (!porMes[mes]) porMes[mes] = { total: 0, porConcepto: {} };
      porMes[mes].total += monto;
      porMes[mes].porConcepto[concepto] = (porMes[mes].porConcepto[concepto] || 0) + monto;
      porConcepto[concepto] = (porConcepto[concepto] || 0) + monto;
    }
    return { porMes, porConcepto };
  } catch (e) {
    console.warn("fetchPagosMaestro:", e.message);
    return { porMes: {}, porConcepto: {} };
  }
}

/* ── Función principal: cargar todo el ejecutivo ── */
export async function fetchEjecutivo() {
  const sheetId = SHEET_IDS.ejecutivo;
  const [pagos, ...ingresosPorMes] = await Promise.all([
    fetchPagosMaestro(sheetId),
    ...MESES.map((m) => fetchIngresosMes(sheetId, m.tab))
  ]);

  const cashflow = MESES.map((m, i) => {
    const ingresos = ingresosPorMes[i];
    const egresos  = pagos.porMes[m.num]?.total || 0;
    return { mes: m.nombre, mesNum: m.num, ingresos, egresos, resultado: ingresos - egresos };
  });

  const totalIngresos = cashflow.reduce((s, m) => s + m.ingresos, 0);
  const totalEgresos  = cashflow.reduce((s, m) => s + m.egresos, 0);

  return {
    cashflow,
    totalIngresos,
    totalEgresos,
    resultado: totalIngresos - totalEgresos,
    porConcepto: pagos.porConcepto,
  };
}

/* ── Índice de eventos ── */
export async function fetchIndice() {
  const rows = await fetchSheet(SHEET_IDS.indice, "INDICE");
  return rows.map((r) => ({
    fecha:   r["FECHA"] || "",
    nombre:  r["NOMBRE EVENTO"] || "",
    sheetId: r["SHEET ID"] || "",
    estado:  r["ESTADO"] || "",
  })).filter((r) => r.sheetId && !r.sheetId.includes("EJEMPLO"));
}

/* ── Evento individual ── */
export async function fetchEvento(sheetId, fecha, nombre, estado) {
  const tabs = { RESUMEN: [], COMISIONES: [], BOLETERIA: [] };
  await Promise.all(Object.keys(tabs).map(async (tab) => {
    try { tabs[tab] = await fetchSheet(sheetId, tab); } catch { tabs[tab] = []; }
  }));

  const resumen = tabs["RESUMEN"];
  const findMonto = (kw) => {
    const row = resumen.find((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(kw.toLowerCase())));
    return row ? parseNum(row["MONTO"] || row["TOTAL"] || "") : 0;
  };

  const att = tabs["BOLETERIA"].reduce((s, r) => s + parseNum(r["CANTIDAD"] || ""), 0);
  const vS = {};
  tabs["COMISIONES"].forEach((r) => {
    const n = r["VENDEDOR"] || r["NOMBRE"] || "";
    const v = parseNum(r["MONTO"] || r["TOTAL"] || "");
    if (n && v) vS[n] = (vS[n] || 0) + v;
  });

  const t = nombre.toLowerCase().includes("viernes") ? "viernes"
    : nombre.toLowerCase().includes("master") ? "master" : "sabado";

  return {
    id: sheetId, t, d: fecha, nombre, estado, att,
    rM: findMonto("mesa"), rP: findMonto("boleter") || findMonto("puerta"), rB: findMonto("barra"),
    costs: [0,0,0, findMonto("personal"), findMonto("cmv")||findMonto("bebida"), 0,0,0, findMonto("comision"), findMonto("extra")],
    vS,
  };
}

/* ── Todos los eventos ── */
export async function fetchTodosLosEventos() {
  const indice = await fetchIndice();
  if (!indice.length) return [];
  return Promise.all(indice.map((ev) => fetchEvento(ev.sheetId, ev.fecha, ev.nombre, ev.estado)));
}
