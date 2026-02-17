/**
 * ROCA BRUJA — Google Sheets Data Layer
 *
 * Lee datos en vivo de Google Sheets sin API key.
 * Solo necesitas que el Sheet esté "Publicado en la web".
 *
 * CONFIGURACION: Cambiá SHEET_ID por el ID de tu Google Sheet.
 * El ID está en la URL: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
 */

import Papa from 'papaparse';

// ══════════════════════════════════════════════════
// CAMBIAR ESTO POR TU SHEET ID REAL
// ══════════════════════════════════════════════════
const SHEET_ID = import.meta.env.VITE_SHEET_ID || 'TU_SHEET_ID_ACA';

// URL base para leer CSV de Google Sheets (no requiere API key)
const csvUrl = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

// Parsear CSV a array de objetos
const parseCSV = (text) => {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  return result.data;
};

// Fetch una hoja
const fetchSheet = async (sheetName) => {
  try {
    const res = await fetch(csvUrl(sheetName));
    if (!res.ok) throw new Error(`Error ${res.status} fetching ${sheetName}`);
    const text = await res.text();
    return parseCSV(text);
  } catch (err) {
    console.error(`Error leyendo hoja "${sheetName}":`, err);
    return null;
  }
};

/**
 * Carga TODOS los datos del Sheet y los transforma al formato
 * que usan los dashboards JSX.
 *
 * Retorna: { events, vendors, fixed, config, loading, error }
 */
export async function loadAllData() {
  const [rawEvents, rawVendors, rawVentas, rawFijos, rawConfig] = await Promise.all([
    fetchSheet('Eventos'),
    fetchSheet('Vendedores'),
    fetchSheet('VentasVendedores'),
    fetchSheet('CostosFijos'),
    fetchSheet('Config'),
  ]);

  // Si alguna hoja falla, retornar error
  if (!rawEvents || !rawVendors || !rawFijos) {
    return { events: [], vendors: [], fixed: {}, config: [], error: 'No se pudieron cargar los datos del Sheet.' };
  }

  // Transformar EVENTOS al formato del dashboard
  const events = rawEvents.map((row) => {
    const id = row.id || 0;
    // Agrupar ventas de vendedores para este evento
    const vS = {};
    if (rawVentas) {
      rawVentas
        .filter((v) => v.evento_id === id)
        .forEach((v) => { vS[v.vendedor] = v.monto || 0; });
    }

    return {
      id,
      t: row.tipo || 'sabado',
      d: row.fecha || '',
      att: row.asistencia || 0,
      rM: row.rev_mesas || 0,
      rP: row.rev_puerta || 0,
      rB: row.rev_barra || 0,
      costs: [
        row.cost_dj || 0,
        row.cost_sonido || 0,
        row.cost_seguridad || 0,
        row.cost_personal || 0,
        row.cost_bebidas || 0,
        row.cost_limpieza || 0,
        row.cost_energia || 0,
        row.cost_marketing || 0,
        row.cost_comisiones || 0,
        row.cost_otros || 0,
      ],
      vS,
    };
  });

  // Transformar VENDEDORES
  const vendors = rawVendors.map((row) => ({
    n: row.nombre || '',
    com: row.comision_pct || 10,
  }));

  // Transformar COSTOS FIJOS
  const fixed = {};
  rawFijos.forEach((row) => {
    if (row.concepto) fixed[row.concepto] = row.monto_mensual || 0;
  });

  // Config de tipos de evento
  const config = (rawConfig || []).map((row) => ({
    id: row.tipo_id || 'sabado',
    l: row.nombre || 'Evento',
    cap: row.capacidad || 1000,
    color: row.color || '#34D399',
  }));

  return { events, vendors, fixed, config, error: null };
}

/**
 * Auto-refresh: recarga datos cada N segundos.
 * Uso: const cleanup = autoRefresh(callback, 60)
 */
export function autoRefresh(callback, intervalSeconds = 60) {
  const id = setInterval(async () => {
    const data = await loadAllData();
    callback(data);
  }, intervalSeconds * 1000);
  return () => clearInterval(id);
}
