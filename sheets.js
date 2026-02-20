import Papa from "papaparse";

const BASE = "https://docs.google.com/spreadsheets/d";

export const SHEET_IDS = {
  indice:     "1lod65Sae0WkJRq6YVpYj_CtJmeBNPlU1ETRCW2RQBD8",
  ejecutivo:  "1b9uAf6a6TaZcEJk204SZ_uOScFXWYf1K",
  proyeccion: "1z32e52_B6xHsduDsCZZFzpXAUwnCfM5aJ5UAZnz1Iis",
};

export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n");
  const csvData = tabName === "PAGOS_MAESTRO" ? lines.slice(1).join("\n") : text;
  const { data } = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  return data;
}

async function fetchSheetJSON(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^{]+/, "").replace(/\);?\s*$/, ""));
  return (json.table.rows || []).map(row =>
    row.c.map(cell => cell ? cell.v : null)
  );
}

function parseNum(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
}

const MESES_PROY = [
  {nombre:"MAR", mesNum:3},  {nombre:"ABR", mesNum:4},
  {nombre:"MAY", mesNum:5},  {nombre:"JUN", mesNum:6},
  {nombre:"JUL", mesNum:7},  {nombre:"AGO", mesNum:8},
  {nombre:"SEP", mesNum:9},  {nombre:"OCT", mesNum:10},
  {nombre:"NOV", mesNum:11},
];
const COL_START = 4;

export async function fetchProyeccion() {
  const sheetId = SHEET_IDS.proyeccion;
  try {
    const rows = await fetchSheetJSON(sheetId, "Egresos detalladosV2");
    const findRow = (keyword) =>
      rows.find(r => String(r[0] || r[1] || "").toUpperCase().includes(keyword.toUpperCase()));
    const rowIngresos  = findRow("INGRESO TOTAL") || findRow("INGRESO MENSUAL");
    const rowGasto     = findRow("GASTO MENSUAL");
    const rowResOp     = findRow("RESULTADO OPERATIVO ");
    const rowEstruc    = findRow("SUBTOTAL ESTRUCTURA");
    const rowNoche     = findRow("SUBTOTAL GASTOS POR NOCHE");
    const rowVariables = findRow("SUBTOTAL GASTOS VARIABLES");
    const egresosConcepto = {};
    for (const row of rows) {
      const concepto = String(row[0] || "").trim();
      if (!concepto || concepto.length < 3) continue;
      const total = MESES_PROY.reduce((s, _, i) => s + parseNum(row[COL_START + i]), 0);
      if (total > 10000) egresosConcepto[concepto] = total;
    }
    const meses = MESES_PROY.map((m, i) => {
      const col = COL_START + i;
      const ingresos  = parseNum(rowIngresos?.[col]);
      const egresos   = parseNum(rowGasto?.[col]);
      const resultado = rowResOp ? parseNum(rowResOp[col]) : ingresos - egresos;
      const margen    = ingresos > 0 ? resultado / ingresos : 0;
      return {
        mes: m.nombre, mesNombre: m.nombre, mesNum: m.mesNum,
        ingresos, egresos, resultado, margen,
        estructura:  parseNum(rowEstruc?.[col]),
        porNoche:    parseNum(rowNoche?.[col]),
        variables:   parseNum(rowVariables?.[col]),
      };
    });
    const totalIngresos  = meses.reduce((s, m) => s + m.ingresos,  0);
    const totalEgresos   = meses.reduce((s, m) => s + m.egresos,   0);
    const totalResultado = meses.reduce((s, m) => s + m.resultado, 0);
    const margenAnual    = totalIngresos > 0 ? totalResultado / totalIngresos : 0;
    return { meses, totalIngresos, totalEgresos, totalResultado, margenAnual, egresosConcepto, cargado: true };
  } catch (e) {
    console.error("fetchProyeccion:", e);
    return { meses: [], totalIngresos: 0, totalEgresos: 0, totalResultado: 0, margenAnual: 0, egresosConcepto: {}, cargado: false };
  }
}

const MESES_EJ = [
  {num:1,  nombre:"ENE", tab:"ENERO_MENSUAL"},
  {num:2,  nombre:"FEB", tab:"FEBRERO_MENSUAL"},
  {num:3,  nombre:"MAR", tab:"MARZO_MENSUAL"},
  {num:4,  nombre:"ABR", tab:"ABRIL_MENSUAL"},
  {num:5,  nombre:"MAY", tab:"MAYO_MENSUAL"},
  {num:6,  nombre:"JUN", tab:"JUNIO_MENSUAL"},
  {num:7,  nombre:"JUL", tab:"JULIO_MENSUAL"},
  {num:8,  nombre:"AGO", tab:"AGOSTO_MENSUAL"},
  {num:9,  nombre:"SEP", tab:"SEPTIEMBRE_MENSUAL"},
  {num:10, nombre:"OCT", tab:"OCTUBRE_MENSUAL"},
  {num:11, nombre:"NOV", tab:"NOVIEMBRE_MENSUAL"},
  {num:12, nombre:"DIC", tab:"DICIEMBRE_MENSUAL"},
];

async function fetchTotalesMes(sheetId, tab) {
  try {
    const rows = await fetchSheetJSON(sheetId, tab);
    let totalIngresos = 0, totalEgresos = 0;
    for (const row of rows) {
      const rowText = row.map(v => String(v || "").toUpperCase()).join(" ");
      if (rowText.includes("TOTAL INGRESOS")) {
        for (let i = row.length - 1; i >= 0; i--) {
          if (typeof row[i] === "number" && row[i] > 0) { totalIngresos = row[i]; break; }
        }
      }
      if (rowText.includes("TOTAL EGRESOS")) {
        for (let i = row.length - 1; i >= 0; i--) {
          if (typeof row[i] === "number" && row[i] > 0) { totalEgresos = row[i]; break; }
        }
      }
    }
    return { totalIngresos, totalEgresos };
  } catch { return { totalIngresos: 0, totalEgresos: 0 }; }
}

export async function fetchEjecutivo() {
  const sheetId = SHEET_IDS.ejecutivo;
  const totalesPorMes = await Promise.all(MESES_EJ.map(m => fetchTotalesMes(sheetId, m.tab)));
  const cashflow = MESES_EJ.map((m, i) => {
    const { totalIngresos, totalEgresos } = totalesPorMes[i];
    return { mes: m.nombre, mesNum: m.num, ingresos: totalIngresos, egresos: totalEgresos, resultado: totalIngresos - totalEgresos };
  });

  let porConcepto = {};
  let porSubConcepto = {};
  try {
    const rows = await fetchSheet(sheetId, "PAGOS_MAESTRO");
    rows.forEach(r => {
      const monto = parseNum(r["MONTO"] || "");
      if (monto <= 0) return;
      const concepto = String(r["CONCEPTO"] || "").trim().replace(/\.{2,}$/, "").trim();
      const subConcepto = String(r["SUB-CONCEPTO"] || "").trim();
      if (concepto && concepto.length >= 3) {
        porConcepto[concepto] = (porConcepto[concepto] || 0) + monto;
      }
      if (subConcepto && subConcepto.length >= 2) {
        porSubConcepto[subConcepto] = (porSubConcepto[subConcepto] || 0) + monto;
      }
    });
    if (Object.keys(porConcepto).length === 0) {
      porConcepto = { ...porSubConcepto };
    }
  } catch (e) {
    console.error("fetchEjecutivo -> PAGOS_MAESTRO:", e);
  }

  const totalIngresos = cashflow.reduce((s, m) => s + m.ingresos, 0);
  const totalEgresos  = cashflow.reduce((s, m) => s + m.egresos,  0);
  return { cashflow, totalIngresos, totalEgresos, resultado: totalIngresos - totalEgresos, porConcepto, porSubConcepto };
}

export async function fetchIndice() {
  const rows = await fetchSheet(SHEET_IDS.indice, "INDICE");
  return rows.map(r => ({
    fecha:   r["FECHA"] || "",
    nombre:  r["NOMBRE EVENTO"] || "",
    sheetId: r["SHEET ID"] || "",
    estado:  r["ESTADO"] || "",
  })).filter(r => r.sheetId && !r.sheetId.includes("EJEMPLO"));
}

export async function fetchEvento(sheetId, fecha, nombre, estado) {
  const tabs = { RESUMEN: [], COMISIONES: [], BOLETERIA: [] };
  await Promise.all(Object.keys(tabs).map(async tab => {
    try { tabs[tab] = await fetchSheet(sheetId, tab); } catch { tabs[tab] = []; }
  }));
  const resumen = tabs["RESUMEN"];
  const findMonto = kw => {
    const row = resumen.find(r => Object.values(r).some(v => String(v).toLowerCase().includes(kw.toLowerCase())));
    return row ? parseNum(row["MONTO"] || row["TOTAL"] || "") : 0;
  };
  const att = tabs["BOLETERIA"].reduce((s, r) => s + parseNum(r["CANTIDAD"] || ""), 0);
  const vS = {};
  tabs["COMISIONES"].forEach(r => {
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

export async function fetchTodosLosEventos() {
  const indice = await fetchIndice();
  if (!indice.length) return [];
  return Promise.all(indice.map(ev => fetchEvento(ev.sheetId, ev.fecha, ev.nombre, ev.estado)));
}
