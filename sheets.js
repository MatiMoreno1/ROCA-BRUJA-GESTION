import Papa from "papaparse";

const BASE = "https://docs.google.com/spreadsheets/d";

/* ── Fetch una pestaña como array de objetos ── */
export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

/* ── Fetch múltiples pestañas de un Sheet ── */
export async function fetchAllTabs(sheetId, tabNames) {
  const results = {};
  await Promise.all(
    tabNames.map(async (tab) => {
      try {
        results[tab] = await fetchSheet(sheetId, tab);
      } catch (e) {
        console.warn(`Error fetching tab "${tab}":`, e.message);
        results[tab] = [];
      }
    })
  );
  return results;
}

/* ── Sheet IDs ── */
export const SHEET_IDS = {
  indice:    "1lod65Sae0WkJRq6YVpYj_CtJmeBNPlU1ETRCW2RQBD8", // INDICE_EVENTOS_RB
  ejecutivo: "1FxCTKSlIRNjjIIAcoeLnHYEKIhrTAGsaJkCy41m85bU", // GR_ROCA_BRUJA_2026
  template:  "1b9uAf6a6TaZcEJk204SZ_uOScFXWYf1K",             // EVENTO_TEMPLATE_RB
};

/* ── Carga el índice de eventos ── */
export async function fetchIndice() {
  const rows = await fetchSheet(SHEET_IDS.indice, "INDICE");
  return rows.map((r) => ({
    fecha:    r["FECHA"]         || r["fecha"]         || "",
    nombre:   r["NOMBRE EVENTO"] || r["nombre_evento"] || "",
    sheetId:  r["SHEET ID"]      || r["sheet_id"]      || "",
    estado:   r["ESTADO"]        || r["estado"]        || "",
  })).filter((r) => r.sheetId && !r.sheetId.includes("EJEMPLO"));
}

/* ── Carga un evento completo desde su Sheet ID ── */
export async function fetchEvento(sheetId, fecha, nombre, estado) {
  const tabs = await fetchAllTabs(sheetId, [
    "RESUMEN", "MESAS", "COMISIONES", "BOLETERIA"
  ]);

  // — Resumen: buscar filas clave por CONCEPTO
  const resumen = tabs["RESUMEN"] || [];
  const findMonto = (concepto) => {
    const row = resumen.find((r) =>
      (r["CONCEPTO"] || "").toLowerCase().includes(concepto.toLowerCase())
    );
    return row ? parseFloat((row["MONTO"] || "0").replace(/[^0-9.-]/g, "")) || 0 : 0;
  };

  const rP  = findMonto("boleteria") || findMonto("puerta");
  const rB  = findMonto("barra");
  const rM  = findMonto("mesas");

  const costPersonal    = findMonto("personal");
  const costExtras      = findMonto("extras");
  const costCMV         = findMonto("cmv") || findMonto("bebidas");
  const costComisiones  = findMonto("comisiones");
  const costFijo        = findMonto("fijo");

  // — Boletería: sumar asistencia
  const boleteria = tabs["BOLETERIA"] || [];
  const att = boleteria.reduce((s, r) => {
    const v = parseFloat((r["CANTIDAD"] || r["cantidad"] || "0").replace(/[^0-9.-]/g, ""));
    return s + (isNaN(v) ? 0 : v);
  }, 0) || 0;

  // — Comisiones: ventas por vendedor
  const comisiones = tabs["COMISIONES"] || [];
  const vS = {};
  comisiones.forEach((r) => {
    const nombre = r["VENDEDOR"] || r["vendedor"] || r["NOMBRE"] || r["nombre"] || "";
    const monto  = parseFloat((r["MONTO"] || r["monto"] || r["TOTAL"] || r["total"] || "0").replace(/[^0-9.-]/g, "")) || 0;
    if (nombre && monto) {
      vS[nombre] = (vS[nombre] || 0) + monto;
    }
  });

  // Detectar tipo por nombre del evento
  const nombreLower = nombre.toLowerCase();
  let tipo = "sabado";
  if (nombreLower.includes("viernes") || nombreLower.includes("friday")) tipo = "viernes";
  else if (nombreLower.includes("master") || nombreLower.includes("especial")) tipo = "master";

  return {
    id:     sheetId,
    t:      tipo,
    d:      fecha,
    nombre: nombre,
    estado: estado,
    att:    att,
    rM:     rM,
    rP:     rP,
    rB:     rB,
    costs: [
      costPersonal,   // Personal/RRHH
      0,              // Sonido/Técnica
      0,              // Seguridad
      costPersonal,   // Personal
      costCMV,        // Bebidas CMV
      0,              // Limpieza
      0,              // Energía
      0,              // Marketing
      costComisiones, // Comisiones
      costExtras,     // Otros/Extras
    ],
    vS,
  };
}

/* ── Carga todos los eventos del índice ── */
export async function fetchTodosLosEventos() {
  const indice = await fetchIndice();
  const eventos = await Promise.all(
    indice.map((ev) => fetchEvento(ev.sheetId, ev.fecha, ev.nombre, ev.estado))
  );
  return eventos;
}
