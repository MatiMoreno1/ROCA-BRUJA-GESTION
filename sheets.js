import Papa from "papaparse";
const BASE = "https://docs.google.com/spreadsheets/d";
export const SHEET_IDS = {
  indice:       "1lod65Sae0WkJRq6YVpYj_CtJmeBNPlU1ETRCW2RQBD8",
  ejecutivo:    "10FKXj1lIE7dN5UHkP9i0c8eb3G1gkYnes4HjE-GyZ_A",
  proyeccion:   "1z32e52_B6xHsduDsCZZFzpXAUwnCfM5aJ5UAZnz1Iis",
  baseClientes: "1HDrFsfNxEtSD_2KZqFJukK8XaLWd7s2VYabwcnfRjmI",
};
export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (tabName !== "PAGOS_MAESTRO") {
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
    return data;
  }
  const lines = text.split("\n");
  const headerIdx = lines.findIndex(l => l.includes("FECHA") && l.includes("CONCEPTO") && l.includes("MONTO"));
  const csvData = headerIdx >= 0 ? lines.slice(headerIdx).join("\n") : lines.slice(1).join("\n");
  const { data } = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim()
  });
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
function parseMesFromFecha(fechaStr) {
  if (!fechaStr) return -1;
  // Limpiar comillas, espacios, caracteres raros
  const s = String(fechaStr).trim().replace(/^["']+|["']+$/g, "").trim();
  if (!s || s === "0" || s === "null" || s === "undefined" || s === "#N/A" || s === "#REF!") return -1;
  // Google Sheets gviz JSON: Date(2026,0,15)
  if (s.includes("Date(")) {
    const m = s.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (m) return parseInt(m[2]); // already 0-indexed
  }
  // Slash format: DD/MM/YYYY or MM/DD/YYYY or D/M/YY
  const slashParts = s.split("/");
  if (slashParts.length === 3) {
    const p1 = parseInt(slashParts[0]);
    const p2 = parseInt(slashParts[1]);
    if (isNaN(p1) || isNaN(p2)) return -1;
    if (p1 > 12) return p2 - 1; // must be DD/MM/YYYY
    if (p2 > 12) return p1 - 1; // must be MM/DD/YYYY
    return p2 - 1; // ambiguous, assume DD/MM/YYYY (Argentina)
  }
  // Dash format: YYYY-MM-DD or DD-MM-YYYY
  const dashParts = s.split("-");
  if (dashParts.length === 3) {
    if (dashParts[0].length === 4) return parseInt(dashParts[1]) - 1;
    return parseInt(dashParts[1]) - 1;
  }
  // Dot format: DD.MM.YYYY
  const dotParts = s.split(".");
  if (dotParts.length === 3) {
    const p2 = parseInt(dotParts[1]);
    if (!isNaN(p2) && p2 >= 1 && p2 <= 12) return p2 - 1;
  }
  // Excel serial date number (int or float)
  const num = parseFloat(s);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const d = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) return d.getMonth();
  }
  // Try native Date parse as last resort
  const d = new Date(s);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2000) return d.getMonth();
  return -1;
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
  let porConceptoMensual = {};
  try {
    const rows = await fetchSheet(sheetId, "PAGOS_MAESTRO");
    // Buscar columnas dinámicamente (case-insensitive, trim)
    const allCols = rows.length > 0 ? Object.keys(rows[0]) : [];
    const findColName = (keyword) => allCols.find(c => c.trim().toUpperCase().includes(keyword.toUpperCase())) || "";
    const colFecha = findColName("FECHA");
    const colConcepto = findColName("CONCEPTO");
    const colSubConcepto = findColName("SUB") || findColName("SUBCONCEPTO");
    const colMonto = findColName("MONTO");
    console.log("[PAGOS] Columnas encontradas:", JSON.stringify({allCols, colFecha, colConcepto, colSubConcepto, colMonto}));
    if (rows.length > 0) {
      console.log("[PAGOS] Raw primeras 3 filas:", JSON.stringify(rows.slice(0,3)));
    }
    let fechasOK = 0, fechasFail = 0;
    rows.forEach(r => {
      const monto = parseNum(colMonto ? r[colMonto] : "");
      if (monto <= 0) return;
      const concepto = String(colConcepto ? r[colConcepto] : "").trim().replace(/\.{2,}$/, "").trim();
      const subConcepto = String(colSubConcepto ? r[colSubConcepto] : "").trim();
      const fechaRaw = colFecha ? r[colFecha] : "";
      const mesIdx = parseMesFromFecha(fechaRaw);
      if (mesIdx >= 0) fechasOK++; else { fechasFail++; if (fechasFail <= 3) console.log("[PAGOS] fecha fallida:", JSON.stringify(fechaRaw), typeof fechaRaw); }
      if (concepto && concepto.length >= 3) {
        porConcepto[concepto] = (porConcepto[concepto] || 0) + monto;
        if (!porConceptoMensual[concepto]) porConceptoMensual[concepto] = [0,0,0,0,0,0,0,0,0,0,0,0];
        if (mesIdx >= 0 && mesIdx < 12) porConceptoMensual[concepto][mesIdx] += monto;
      }
      if (subConcepto && subConcepto.length >= 2) {
        porSubConcepto[subConcepto] = (porSubConcepto[subConcepto] || 0) + monto;
      }
    });
    console.log(`[PAGOS] Fechas OK: ${fechasOK}, fallidas: ${fechasFail}`);
    if (Object.keys(porConcepto).length === 0) {
      porConcepto = { ...porSubConcepto };
      porConceptoMensual = {};
      rows.forEach(r => {
        const monto = parseNum(colMonto ? r[colMonto] : "");
        if (monto <= 0) return;
        const subConcepto = String(colSubConcepto ? r[colSubConcepto] : "").trim();
        const fechaRaw = colFecha ? r[colFecha] : "";
        const mesIdx = parseMesFromFecha(fechaRaw);
        if (subConcepto && subConcepto.length >= 2) {
          if (!porConceptoMensual[subConcepto]) porConceptoMensual[subConcepto] = [0,0,0,0,0,0,0,0,0,0,0,0];
          if (mesIdx >= 0 && mesIdx < 12) porConceptoMensual[subConcepto][mesIdx] += monto;
        }
      });
    }
  } catch (e) {
    console.error("fetchEjecutivo -> PAGOS_MAESTRO:", e);
  }
  const totalIngresos = cashflow.reduce((s, m) => s + m.ingresos, 0);
  const totalEgresos  = cashflow.reduce((s, m) => s + m.egresos,  0);
  return { cashflow, totalIngresos, totalEgresos, resultado: totalIngresos - totalEgresos, porConcepto, porSubConcepto, porConceptoMensual };
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
  let resumenMasterRows = [];
  let resumenLadoARows = [];
  try { resumenMasterRows = await fetchSheet(sheetId, "RESUMEN MASTER"); } catch {}
  try { resumenLadoARows = await fetchSheet(sheetId, "RESUMEN LADO A"); } catch {}
  const resumen = tabs["RESUMEN"];
  const findMonto = kw => {
    const row = resumen.find(r => Object.values(r).some(v => String(v).toLowerCase().includes(kw.toLowerCase())));
    return row ? parseNum(row["MONTO"] || row["TOTAL"] || "") : 0;
  };
  let seccion = "general";
  let comPosnetIngresos = 0, comPosnetBoleteria = 0, comPosnetBarra = 0;
  let posnetIdx = 0;
  resumen.forEach(r => {
    const keys = Object.keys(r);
    const concepto = (r[keys[0]] || "").trim().toLowerCase();
    const valor = parseNum(r[keys[1]] || r[keys[2]] || "");
    if (concepto.includes("ingreso") && !concepto.includes("total") && !concepto.includes("sub") && !concepto.includes("comision")) seccion = "ingresos";
    if ((concepto.includes("boleter") || concepto.includes("puerta")) && !concepto.includes("comision") && !concepto.includes("sub")) seccion = "boleteria";
    if (concepto.includes("barra") && !concepto.includes("comision") && !concepto.includes("sub")) seccion = "barra";
    if (concepto.includes("comision") && (concepto.includes("posnet") || concepto.includes("pos"))) {
      if (concepto.includes("ingreso") || concepto.includes("mesa")) comPosnetIngresos = valor;
      else if (concepto.includes("boleter")) comPosnetBoleteria = valor;
      else if (concepto.includes("barra")) comPosnetBarra = valor;
      else if (seccion === "ingresos") comPosnetIngresos = valor;
      else if (seccion === "boleteria") comPosnetBoleteria = valor;
      else if (seccion === "barra") comPosnetBarra = valor;
      else { posnetIdx++; if (posnetIdx===1) comPosnetIngresos=valor; else if (posnetIdx===2) comPosnetBoleteria=valor; else if (posnetIdx===3) comPosnetBarra=valor; }
    }
  });
  const totalComPosnet = comPosnetIngresos + comPosnetBoleteria + comPosnetBarra;
  let comPosnetIngresosMaster = 0, comPosnetBoleteriaMaster = 0, comPosnetBarraMaster = 0;
  if (resumenMasterRows.length > 0) {
    let secM = "general";
    let posnetIdxM = 0;
    resumenMasterRows.forEach(r => {
      const keys = Object.keys(r);
      const concepto = (r[keys[0]] || "").trim().toLowerCase();
      const valor = parseNum(r[keys[1]] || r[keys[2]] || "");
      if (concepto.includes("ingreso") && !concepto.includes("total") && !concepto.includes("sub") && !concepto.includes("comision")) secM = "ingresos";
      if ((concepto.includes("boleter") || concepto.includes("puerta")) && !concepto.includes("comision") && !concepto.includes("sub")) secM = "boleteria";
      if (concepto.includes("barra") && !concepto.includes("comision") && !concepto.includes("sub")) secM = "barra";
      if (concepto.includes("comision") && (concepto.includes("posnet") || concepto.includes("pos"))) {
        if (concepto.includes("ingreso") || concepto.includes("mesa")) comPosnetIngresosMaster = valor;
        else if (concepto.includes("boleter")) comPosnetBoleteriaMaster = valor;
        else if (concepto.includes("barra")) comPosnetBarraMaster = valor;
        else if (secM === "ingresos") comPosnetIngresosMaster = valor;
        else if (secM === "boleteria") comPosnetBoleteriaMaster = valor;
        else if (secM === "barra") comPosnetBarraMaster = valor;
        else { posnetIdxM++; if (posnetIdxM===1) comPosnetIngresosMaster=valor; else if (posnetIdxM===2) comPosnetBoleteriaMaster=valor; else if (posnetIdxM===3) comPosnetBarraMaster=valor; }
      }
    });
  }
  const totalComPosnetMaster = comPosnetIngresosMaster + comPosnetBoleteriaMaster + comPosnetBarraMaster;
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
    posnet: { ingresos: comPosnetIngresos, boleteria: comPosnetBoleteria, barra: comPosnetBarra, total: totalComPosnet },
    posnetMaster: { ingresos: comPosnetIngresosMaster, boleteria: comPosnetBoleteriaMaster, barra: comPosnetBarraMaster, total: totalComPosnetMaster }
  };
}
export async function fetchTodosLosEventos() {
  const indice = await fetchIndice();
  if (!indice.length) return [];
  return Promise.all(indice.map(ev => fetchEvento(ev.sheetId, ev.fecha, ev.nombre, ev.estado)));
}
