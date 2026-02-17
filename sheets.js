import Papa from "papaparse";

const BASE = "https://docs.google.com/spreadsheets/d";

/* Fetch a single sheet tab as array of objects */
export async function fetchSheet(sheetId, tabName) {
  const url = `${BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

/* Fetch all tabs for a given Sheet ID */
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

/* Sheet IDs from env variables */
export const SHEET_IDS = {
  gestion: import.meta.env.VITE_SHEET_ID || "",
  mensual: import.meta.env.VITE_SHEET_MENSUAL || "",
  vendedores: import.meta.env.VITE_SHEET_VENDEDORES || "",
  bebidas: import.meta.env.VITE_SHEET_BEBIDAS || ""
};
