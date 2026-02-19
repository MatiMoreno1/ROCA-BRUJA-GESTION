import Papa from "papaparse";

const BASE = "https://docs.google.com/spreadsheets/d";

export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
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
  if (!val && val !== 0) return 0;
  if (typeof val === "number") return val;
  const clean = String(val).replace(/[^0-9.-]/g, "");
  return parseFloat(clean) || 0;
}

async function fetchIngresosMes(sheetId, tab) {
  try {
    const rows = await fetchSheet(sheetId, tab);
    let total = 0;
    for (const row of rows) {
      const concepto = (row["CONCEPTO"] || "").toUpperCase();
      const monto = parseNum(row["TOTAL"] || row["total"] || "");
      if (monto > 0 && !concepto.includes("TOTAL") && !concepto.includes("EGRESO")) {
        total += monto;
      }
    }
    return total;
  } catch { return 0; }
}

async function fetchPagosMaestro(sheetId) {
  try {
    const rows = await fetchSheet(sheetId, "PAGOS_MAESTRO");
    const porMes = {};
    const porConcepto = {};

    for (const row of rows) {
      const fecha    = row["FECHA"] || "";
      const concepto = row["CONCEPTO"] || "";
      const monto    = parseNum(row["MONTO"] || "");
      if (!fecha || !concepto || monto <= 0) continue;

      let mes = null;
      if (fecha.includes("/")) {
        const p = fecha.split("/");
        mes = p.length === 3 ? parseInt(p[1]) : null;
      } else if (fecha.includes("-")) {
        const p = fecha.split("-");
        mes = p.length === 3 ? parseInt(p[1]) : null;
      }
      if (!mes) continue;

      if (!porMes[mes]) porMes[mes] = { total: 0, porConcepto: {} };
      porMes[mes].total += monto;
      porMes[mes].porConcepto[concepto] = (porMes[mes].porConcepto[concepto] || 0) + monto;
      porConcepto[concepto] = (porConcepto[concepto] || 0) + monto;
    }
    return { porMes, porConcepto };
  } catch { return { porMes: {}, porConcepto: {} }; }
}

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

export async function fetchIndice() {
  const rows = await fetchSheet(SHEET_IDS.indice, "INDICE");
  return rows.map((r) => ({
    fecha:   r["FECHA"] || "",
    nombre:  r["NOMBRE EVENTO"] || "",
    sheetId: r["SHEET ID"] || "",
    estado:  r["ESTADO"] || "",
  })).filter((r) => r.sheetId && !r.sheetId.includes("EJEMPLO"));
}

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

export async function fetchTodosLosEventos() {
  const indice = await fetchIndice();
  if (!indice.length) return [];
  return Promise.all(indice.map((ev) => fetchEvento(ev.sheetId, ev.fecha, ev.nombre, ev.estado)));
}
