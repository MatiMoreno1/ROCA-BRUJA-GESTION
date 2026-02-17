import { useState } from "react";

const C = {
  bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
  tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
  g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
  b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
  mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
};

const f = n => {
  if(n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if(n >= 1000) return (n/1000).toFixed(1) + "K";
  return "$" + n.toLocaleString();
};

const ff = n => "$" + n.toLocaleString();

const pct = (n, decimals = 1) => {
  const v = Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return v.toFixed(decimals) + "%";
};

const bx = () => ({
  background: C.s2,
  border: `1px solid ${C.bd}`,
  borderRadius: "8px",
  padding: "16px",
  color: C.tx
});

const pillSt = (active = false) => ({
  padding: "6px 12px",
  borderRadius: "20px",
  border: active ? "none" : `1px solid ${C.bd}`,
  cursor: "pointer",
  fontSize: "13px",
  fontFamily: C.sans,
  fontWeight: "500",
  transition: "all 0.2s",
  background: active ? C.g : C.s3,
  color: active ? C.bg : C.tx
});

const Stat = ({ label, value, unit = "", color = C.tx }) => (
  <div style={{ ...bx(), textAlign: "center" }}>
    <div style={{ fontSize: "12px", color: C.t2, marginBottom: "8px", fontFamily: C.sans }}>
      {label}
    </div>
    <div style={{ fontSize: "20px", fontWeight: "700", color, fontFamily: C.mono }}>
      {value}{unit}
    </div>
  </div>
);

const Bar = ({ label, value, max = 100, color = C.g }) => (
  <div style={{ marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontFamily: C.sans }}>
      <span style={{ color: C.tx }}>{label}</span>
      <span style={{ color: C.t2, fontFamily: C.mono }}>{pct(value)}</span>
    </div>
    <div style={{ background: C.s3, height: "6px", borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ background: color, height: "100%", width: pct(value), transition: "width 0.3s" }} />
    </div>
  </div>
);

const Table = ({ columns, rows }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: C.sans,
      fontSize: "13px"
    }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${C.bd}` }}>
          {columns.map((col, i) => (
            <th key={i} style={{
              textAlign: col.align || "left",
              padding: "10px",
              color: C.t2,
              fontWeight: "600",
              fontSize: "12px"
            }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.bd}` }}>
            {columns.map((col, j) => (
              <td key={j} style={{
                textAlign: col.align || "left",
                padding: "10px",
                color: C.tx
              }}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CATEGORIAS = [
  { id:"bebidas", label:"Bebidas", color: C.b },
  { id:"espumantes", label:"Espumantes", color: C.p },
  { id:"whisky", label:"Whisky", color: C.y },
  { id:"vodka", label:"Vodka", color: C.b },
  { id:"destilados", label:"Destilados", color: C.o },
  { id:"tragos", label:"Tragos", color: C.v },
  { id:"champagne", label:"Champagne", color: C.p },
  { id:"combos", label:"Combos", color: C.g }
];

const PRODUCTOS_INICIAL = [
  // BEBIDAS
  { id:"gaseosa", name:"Gaseosa", category:"bebidas", unit:"Unidad", costUnit:990, salePrice:6000, rendimiento:6.1, parStock:20, currentStock:30 },
  { id:"speed", name:"Speed", category:"bebidas", unit:"Unidad", costUnit:970, salePrice:6000, rendimiento:6.2, parStock:20, currentStock:30 },
  { id:"agua", name:"Agua", category:"bebidas", unit:"Unidad", costUnit:950, salePrice:6000, rendimiento:6.3, parStock:25, currentStock:40 },
  { id:"miller", name:"Miller", category:"bebidas", unit:"Unidad", costUnit:1476, salePrice:8000, rendimiento:5.4, parStock:30, currentStock:50 },
  { id:"speed_pack_x6", name:"Speed Pack x6", category:"bebidas", unit:"Pack x6", costUnit:5820, salePrice:30000, rendimiento:5.2, parStock:5, currentStock:8 },
  { id:"gaseosas_pack_x6", name:"Gaseosas Pack x6", category:"bebidas", unit:"Pack x6", costUnit:5940, salePrice:30000, rendimiento:5.1, parStock:5, currentStock:8 },

  // ESPUMANTES
  { id:"liason_botella", name:"Liason Botella", category:"espumantes", unit:"Botella", costUnit:12820, salePrice:60000, rendimiento:4.7, parStock:3, currentStock:5 },
  { id:"chandon_delice", name:"Chandon Delice", category:"espumantes", unit:"Botella", costUnit:26276, salePrice:100000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"chandon_eb", name:"Chandon EB", category:"espumantes", unit:"Botella", costUnit:26276, salePrice:100000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"chandon_rose", name:"Chandon Rose", category:"espumantes", unit:"Botella", costUnit:26276, salePrice:100000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"chandon_aperitif", name:"Chandon Aperitif", category:"espumantes", unit:"Botella", costUnit:26276, salePrice:100000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"liason_magnum", name:"Liason Magnum", category:"espumantes", unit:"Magnum", costUnit:10880, salePrice:180000, rendimiento:16.5, parStock:1, currentStock:2 },
  { id:"baron_b_eb", name:"Baron B EB", category:"espumantes", unit:"Botella", costUnit:37203, salePrice:140000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"baron_b_rose", name:"Baron B Rose", category:"espumantes", unit:"Botella", costUnit:37203, salePrice:140000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"baron_b_nature", name:"Baron B Nature", category:"espumantes", unit:"Botella", costUnit:37203, salePrice:140000, rendimiento:3.8, parStock:2, currentStock:3 },
  { id:"chandon_magnum", name:"Chandon Magnum", category:"espumantes", unit:"Magnum", costUnit:40935, salePrice:180000, rendimiento:4.4, parStock:1, currentStock:2 },

  // WHISKY
  { id:"jw_red_label", name:"JW Red Label", category:"whisky", unit:"Botella", costUnit:28001, salePrice:220000, rendimiento:7.9, parStock:2, currentStock:3 },
  { id:"jw_black_label", name:"JW Black Label", category:"whisky", unit:"Botella", costUnit:44493, salePrice:280000, rendimiento:6.3, parStock:2, currentStock:3 },
  { id:"jw_gold_label", name:"JW Gold Label", category:"whisky", unit:"Botella", costUnit:189572, salePrice:400000, rendimiento:2.1, parStock:1, currentStock:1 },
  { id:"the_macallan", name:"The Macallan", category:"whisky", unit:"Show Botella", costUnit:199480, salePrice:1100000, rendimiento:5.5, parStock:1, currentStock:1 },
  { id:"jw_blue_label", name:"JW Blue Label", category:"whisky", unit:"Show Botella", costUnit:350625, salePrice:1800000, rendimiento:5.1, parStock:1, currentStock:1 },

  // VODKA
  { id:"sernova", name:"Sernova", category:"vodka", unit:"Botella", costUnit:11729, salePrice:120000, rendimiento:10.2, parStock:3, currentStock:5 },
  { id:"sernova_sab", name:"Sernova SAB", category:"vodka", unit:"Botella", costUnit:11729, salePrice:120000, rendimiento:10.2, parStock:3, currentStock:5 },
  { id:"absolut", name:"Absolut", category:"vodka", unit:"Botella", costUnit:22739, salePrice:220000, rendimiento:9.7, parStock:2, currentStock:3 },
  { id:"absolut_sab", name:"Absolut SAB", category:"vodka", unit:"Botella", costUnit:20255, salePrice:240000, rendimiento:11.9, parStock:2, currentStock:3 },
  { id:"absolut_elyx", name:"Absolut Elyx", category:"vodka", unit:"Show Botella", costUnit:31334, salePrice:380000, rendimiento:12.1, parStock:1, currentStock:1 },
  { id:"belvedere", name:"Belvedere", category:"vodka", unit:"Show Botella", costUnit:50782, salePrice:400000, rendimiento:7.9, parStock:1, currentStock:1 },
  { id:"belvedere_magnum", name:"Belvedere Magnum", category:"vodka", unit:"Magnum", costUnit:109315, salePrice:700000, rendimiento:6.4, parStock:1, currentStock:1 },

  // DESTILADOS
  { id:"gin_blu", name:"Gin Blu", category:"destilados", unit:"Botella", costUnit:15115, salePrice:110000, rendimiento:7.3, parStock:2, currentStock:3 },
  { id:"malibu", name:"Malibu", category:"destilados", unit:"Botella", costUnit:18652, salePrice:110000, rendimiento:5.9, parStock:2, currentStock:3 },
  { id:"fernet_branca", name:"Fernet Branca", category:"destilados", unit:"Botella", costUnit:14760, salePrice:140000, rendimiento:9.5, parStock:3, currentStock:5 },
  { id:"fernet_branca_menta", name:"Fernet Branca Menta", category:"destilados", unit:"Botella", costUnit:14760, salePrice:120000, rendimiento:8.1, parStock:2, currentStock:4 },
  { id:"havana_3_anos", name:"Havana 3 A\u00f1os", category:"destilados", unit:"Botella", costUnit:20553, salePrice:130000, rendimiento:6.3, parStock:2, currentStock:3 },
  { id:"hodlmoser", name:"Hodlmoser", category:"destilados", unit:"Botella", costUnit:23060, salePrice:170000, rendimiento:7.4, parStock:2, currentStock:3 },
  { id:"havana_7_anos", name:"Havana 7 A\u00f1os", category:"destilados", unit:"Botella", costUnit:39269, salePrice:180000, rendimiento:4.6, parStock:1, currentStock:2 },
  { id:"beefeater", name:"Beefeater", category:"destilados", unit:"Botella", costUnit:19737, salePrice:200000, rendimiento:10.1, parStock:2, currentStock:3 },
  { id:"jagermeister", name:"Jagermeister", category:"destilados", unit:"Botella", costUnit:26486, salePrice:230000, rendimiento:8.7, parStock:2, currentStock:3 },
  { id:"hennesy", name:"Hennesy", category:"destilados", unit:"Botella", costUnit:54045, salePrice:220000, rendimiento:4.1, parStock:1, currentStock:2 },
  { id:"nuvo", name:"Nuvo", category:"destilados", unit:"Show Botella", costUnit:71925, salePrice:500000, rendimiento:6.9, parStock:1, currentStock:1 },

  // TRAGOS
  { id:"blu_tonic", name:"Blu Tonic", category:"tragos", unit:"Vaso", costUnit:1256, salePrice:17000, rendimiento:13.5, parStock:20, currentStock:40 },
  { id:"sernova_c_speed", name:"Sernova c/Speed", category:"tragos", unit:"Vaso", costUnit:1643, salePrice:17000, rendimiento:10.3, parStock:15, currentStock:30 },
  { id:"sernova_candy_c_speed", name:"Sernova Candy c/Speed", category:"tragos", unit:"Vaso", costUnit:1643, salePrice:17000, rendimiento:10.3, parStock:15, currentStock:30 },
  { id:"hodlmoser_c_speed", name:"Hodlmoser c/Speed", category:"tragos", unit:"Vaso", costUnit:2614, salePrice:17000, rendimiento:6.5, parStock:10, currentStock:20 },
  { id:"jagermeister_c_speed", name:"Jagermeister c/Speed", category:"tragos", unit:"Vaso", costUnit:2907, salePrice:21000, rendimiento:7.2, parStock:12, currentStock:25 },
  { id:"absolut_c_speed", name:"Absolut c/Speed", category:"tragos", unit:"Vaso", costUnit:2586, salePrice:21000, rendimiento:8.1, parStock:12, currentStock:25 },
  { id:"aperol_spritz", name:"Aperol Spritz", category:"tragos", unit:"Vaso", costUnit:7711, salePrice:21000, rendimiento:2.7, parStock:10, currentStock:20 },
  { id:"johnni_lemon", name:"Johnni & Lemon", category:"tragos", unit:"Vaso", costUnit:2567, salePrice:21000, rendimiento:8.2, parStock:12, currentStock:25 },
  { id:"fernet_c_coca", name:"Fernet c/Coca", category:"tragos", unit:"Vaso", costUnit:1205, salePrice:17000, rendimiento:14.1, parStock:18, currentStock:35 },

  // CHAMPAGNE
  { id:"moet_brut_imperial", name:"Moet Brut Imperial", category:"champagne", unit:"Show Botella", costUnit:118519, salePrice:650000, rendimiento:5.5, parStock:1, currentStock:1 },
  { id:"veuve_clicquot_yellow", name:"Veuve Clicquot Yellow", category:"champagne", unit:"Show Botella", costUnit:149387, salePrice:650000, rendimiento:4.3, parStock:1, currentStock:1 },
  { id:"moet_ice_imperial", name:"Moet Ice Imperial", category:"champagne", unit:"Show Botella", costUnit:144437, salePrice:800000, rendimiento:5.5, parStock:1, currentStock:1 },
  { id:"veuve_clicquot_rich", name:"Veuve Clicquot Rich", category:"champagne", unit:"Show Botella", costUnit:138552, salePrice:800000, rendimiento:5.8, parStock:1, currentStock:1 },
  { id:"dom_perignon", name:"Dom Perignon", category:"champagne", unit:"Show Botella", costUnit:435638, salePrice:1700000, rendimiento:3.9, parStock:1, currentStock:1 },

  // COMBOS
  { id:"combo_2_belvedere_1_magnum", name:"2 Belvedere + 1 Belvedere Magnum", category:"combos", unit:"Combo", costUnit:210880, salePrice:1100000, rendimiento:5.2, parStock:1, currentStock:1 },
  { id:"combo_2_veuve_yellow_2_baron_b", name:"2 Veuve Clicquot Yellow + 2 Baron B", category:"combos", unit:"Combo", costUnit:373181, salePrice:1440000, rendimiento:3.9, parStock:1, currentStock:1 },
  { id:"combo_2_veuve_rich_2_baron_b", name:"2 Veuve Clicquot Rich + 2 Baron B", category:"combos", unit:"Combo", costUnit:351512, salePrice:1740000, rendimiento:5.0, parStock:1, currentStock:1 },
];

const EVENTOS_INICIAL = [
  {
    id: "event_1",
    cycle: "sabado",
    date: "2026-02-15",
    consumption: [
      { productId: "belvedere", cantidadUsada: 2, totalVenta: 800000 },
      { productId: "moet_brut_imperial", cantidadUsada: 1, totalVenta: 650000 },
      { productId: "jagermeister_c_speed", cantidadUsada: 25, totalVenta: 525000 },
      { productId: "sernova_c_speed", cantidadUsada: 30, totalVenta: 510000 },
      { productId: "aperol_spritz", cantidadUsada: 18, totalVenta: 378000 },
      { productId: "blu_tonic", cantidadUsada: 40, totalVenta: 680000 },
      { productId: "gaseosa", cantidadUsada: 50, totalVenta: 300000 },
      { productId: "speed", cantidadUsada: 45, totalVenta: 270000 },
    ]
  },
  {
    id: "event_2",
    cycle: "viernes",
    date: "2026-02-14",
    consumption: [
      { productId: "absolut", cantidadUsada: 3, totalVenta: 660000 },
      { productId: "veuve_clicquot_yellow", cantidadUsada: 1, totalVenta: 650000 },
      { productId: "fernet_branca", cantidadUsada: 8, totalVenta: 1120000 },
      { productId: "absolut_c_speed", cantidadUsada: 22, totalVenta: 462000 },
      { productId: "fernet_c_coca", cantidadUsada: 35, totalVenta: 595000 },
      { productId: "gaseosa", cantidadUsada: 35, totalVenta: 210000 },
      { productId: "agua", cantidadUsada: 40, totalVenta: 240000 },
    ]
  },
  {
    id: "event_3",
    cycle: "sabado",
    date: "2026-02-08",
    consumption: [
      { productId: "chandon_delice", cantidadUsada: 3, totalVenta: 300000 },
      { productId: "jw_black_label", cantidadUsada: 2, totalVenta: 560000 },
      { productId: "gin_blu", cantidadUsada: 4, totalVenta: 440000 },
      { productId: "hodlmoser_c_speed", cantidadUsada: 28, totalVenta: 476000 },
      { productId: "johnni_lemon", cantidadUsada: 32, totalVenta: 672000 },
      { productId: "blu_tonic", cantidadUsada: 38, totalVenta: 646000 },
      { productId: "speed_pack_x6", cantidadUsada: 2, totalVenta: 60000 },
      { productId: "miller", cantidadUsada: 60, totalVenta: 480000 },
    ]
  },
  {
    id: "event_4",
    cycle: "master",
    date: "2026-02-01",
    consumption: [
      { productId: "dom_perignon", cantidadUsada: 1, totalVenta: 1700000 },
      { productId: "jw_blue_label", cantidadUsada: 1, totalVenta: 1800000 },
      { productId: "belvedere_magnum", cantidadUsada: 1, totalVenta: 700000 },
      { productId: "combo_2_veuve_yellow_2_baron_b", cantidadUsada: 1, totalVenta: 1440000 },
      { productId: "sernova_c_speed", cantidadUsada: 15, totalVenta: 255000 },
      { productId: "aperol_spritz", cantidadUsada: 10, totalVenta: 210000 },
      { productId: "gaseosas_pack_x6", cantidadUsada: 3, totalVenta: 90000 },
    ]
  },
  {
    id: "event_5",
    cycle: "viernes",
    date: "2026-02-07",
    consumption: [
      { productId: "chandon_magnum", cantidadUsada: 1, totalVenta: 180000 },
      { productId: "absolut", cantidadUsada: 2, totalVenta: 440000 },
      { productId: "havana_3_anos", cantidadUsada: 5, totalVenta: 650000 },
      { productId: "sernova_candy_c_speed", cantidadUsada: 26, totalVenta: 442000 },
      { productId: "fernet_branca_menta", cantidadUsada: 12, totalVenta: 1440000 },
      { productId: "fernet_c_coca", cantidadUsada: 28, totalVenta: 476000 },
      { productId: "gaseosa", cantidadUsada: 38, totalVenta: 228000 },
      { productId: "agua", cantidadUsada: 45, totalVenta: 270000 },
    ]
  },
  {
    id: "event_6",
    cycle: "sabado",
    date: "2026-02-22",
    consumption: [
      { productId: "moet_brut_imperial", cantidadUsada: 2, totalVenta: 1300000 },
      { productId: "jw_red_label", cantidadUsada: 3, totalVenta: 660000 },
      { productId: "jagermeister", cantidadUsada: 6, totalVenta: 1380000 },
      { productId: "jagermeister_c_speed", cantidadUsada: 30, totalVenta: 630000 },
      { productId: "hodlmoser_c_speed", cantidadUsada: 25, totalVenta: 425000 },
      { productId: "aperol_spritz", cantidadUsada: 22, totalVenta: 462000 },
      { productId: "speed_pack_x6", cantidadUsada: 3, totalVenta: 90000 },
      { productId: "miller", cantidadUsada: 55, totalVenta: 440000 },
    ]
  },
];

export default function BebidasCMV() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIAL);
  const [eventos, setEventos] = useState(EVENTOS_INICIAL);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(eventos[0]?.id);
  const [filterCategory, setFilterCategory] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchCatalogo, setSearchCatalogo] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [eventsPlanned, setEventsPlanned] = useState({ sabado: 4, viernes: 4, master: 2 });

  // Helpers
  const getProducto = id => productos.find(p => p.id === id);
  const getCategoria = id => CATEGORIAS.find(c => c.id === id);
  const getCMV = (cost, revenue) => revenue > 0 ? (cost / revenue) * 100 : 0;
  const getMargen = (sale, cost) => sale - cost;

  // Tab 0: CMV General
  const calcTotalStats = () => {
    let totalCost = 0, totalRevenue = 0;
    eventos.forEach(e => {
      e.consumption.forEach(c => {
        const p = getProducto(c.productId);
        if(p) {
          totalCost += p.costUnit * c.cantidadUsada;
          totalRevenue += c.totalVenta;
        }
      });
    });
    return { totalCost, totalRevenue, cmv: getCMV(totalCost, totalRevenue), margen: totalRevenue - totalCost };
  };

  const stats = calcTotalStats();

  const cmvByCategory = () => {
    const data = {};
    CATEGORIAS.forEach(cat => {
      let cost = 0, revenue = 0;
      eventos.forEach(e => {
        e.consumption.forEach(c => {
          const p = getProducto(c.productId);
          if(p && p.category === cat.id) {
            cost += p.costUnit * c.cantidadUsada;
            revenue += c.totalVenta;
          }
        });
      });
      if(revenue > 0) data[cat.id] = { label: cat.label, cmv: getCMV(cost, revenue), color: cat.color };
    });
    return Object.values(data).sort((a,b) => b.cmv - a.cmv);
  };

  const top10ProductsByMargin = () => {
    return productos
      .map(p => {
        const margen = getMargen(p.salePrice, p.costUnit);
        const pctMargen = (margen / p.salePrice) * 100;
        return { ...p, margen, pctMargen };
      })
      .sort((a,b) => b.margen - a.margen)
      .slice(0, 10);
  };

  const top10ProductsByVolume = () => {
    const volume = {};
    eventos.forEach(e => {
      e.consumption.forEach(c => {
        volume[c.productId] = (volume[c.productId] || 0) + c.cantidadUsada;
      });
    });
    return productos
      .map(p => ({ ...p, volumen: volume[p.id] || 0 }))
      .filter(p => p.volumen > 0)
      .sort((a,b) => b.volumen - a.volumen)
      .slice(0, 10);
  };

  const productosBajoStock = () => {
    return productos.filter(p => p.currentStock < p.parStock);
  };

  // Tab 1: Catalogo
  const productosFiltrados = () => {
    let filtered = productos;
    if(filterCategory) filtered = filtered.filter(p => p.category === filterCategory);
    if(searchCatalogo) {
      const q = searchCatalogo.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    if(sortCol) {
      filtered = filtered.sort((a, b) => {
        let aVal = a[sortCol];
        let bVal = b[sortCol];
        if(typeof aVal === "string") aVal = aVal.toLowerCase();
        if(typeof bVal === "string") bVal = bVal.toLowerCase();
        return sortAsc ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
      });
    }
    return filtered;
  };

  const handleSort = (col) => {
    if(sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  // Tab 2: Consumo
  const selectedEventData = () => eventos.find(e => e.id === selectedEvent);

  const eventStats = () => {
    const event = selectedEventData();
    if(!event) return { cost: 0, revenue: 0, cmv: 0, margen: 0 };
    let cost = 0, revenue = 0;
    event.consumption.forEach(c => {
      const p = getProducto(c.productId);
      if(p) {
        cost += p.costUnit * c.cantidadUsada;
        revenue += c.totalVenta;
      }
    });
    return { cost, revenue, cmv: getCMV(cost, revenue), margen: revenue - cost };
  };

  const eventConsumptionTable = () => {
    const event = selectedEventData();
    if(!event) return [];
    return event.consumption.map(c => {
      const p = getProducto(c.productId);
      if(!p) return { producto: "???", usado: "-", costoUsado: "$0", vendido: ff(c.totalVenta), cmv: "0%", margen: ff(c.totalVenta) };
      const cost = p.costUnit * c.cantidadUsada;
      return {
        producto: p.name,
        usado: c.cantidadUsada + " " + p.unit,
        costoUsado: ff(cost),
        vendido: ff(c.totalVenta),
        cmv: pct(getCMV(cost, c.totalVenta)),
        margen: ff(c.totalVenta - cost)
      };
    });
  };

  const eventCategoryBreakdown = () => {
    const event = selectedEventData();
    if(!event) return [];
    const data = {};
    event.consumption.forEach(c => {
      const p = getProducto(c.productId);
      if(!p) return;
      const cat = getCategoria(p.category);
      const catLabel = cat ? cat.label : p.category;
      if(!data[p.category]) data[p.category] = { label: catLabel, cantidad: 0, costo: 0, revenue: 0 };
      data[p.category].cantidad += c.cantidadUsada;
      data[p.category].costo += p.costUnit * c.cantidadUsada;
      data[p.category].revenue += c.totalVenta;
    });
    return Object.values(data).sort((a,b) => b.revenue - a.revenue);
  };

  // Tab 3: Compras
  const suggestedPurchases = () => {
    const { sabado: numSab, viernes: numVier, master: numMast } = eventsPlanned;
    const totalEventos = numSab + numVier + numMast;

    const consumoPromedio = {};
    productos.forEach(p => {
      consumoPromedio[p.id] = { sabado: 0, viernes: 0, master: 0 };
    });
    eventos.forEach(e => {
      e.consumption.forEach(c => {
        if(consumoPromedio[c.productId]) {
          consumoPromedio[c.productId][e.cycle] += c.cantidadUsada;
        }
      });
    });
    CATEGORIAS.forEach(cat => {
      Object.keys(consumoPromedio).forEach(pid => {
        const p = getProducto(pid);
        if(!p) delete consumoPromedio[pid];
      });
    });

    return productos.map(p => {
      const sabCount = eventos.filter(e => e.cycle === "sabado").length || 1;
      const vierCount = eventos.filter(e => e.cycle === "viernes").length || 1;
      const mastCount = eventos.filter(e => e.cycle === "master").length || 1;

      const avgSab = (consumoPromedio[p.id]?.sabado || 0) / sabCount;
      const avgVier = (consumoPromedio[p.id]?.viernes || 0) / vierCount;
      const avgMast = (consumoPromedio[p.id]?.master || 0) / mastCount;

      const needed = (avgSab * numSab + avgVier * numVier + avgMast * numMast) - p.currentStock + p.parStock;
      const toOrder = Math.max(0, Math.ceil(needed));
      const costCompra = toOrder * p.costUnit;

      return {
        producto: p.name,
        stockActual: p.currentStock + " " + p.unit,
        consumoPromedio: (avgSab + avgVier + avgMast).toFixed(2),
        eventosPlaneados: totalEventos,
        necesidad: needed.toFixed(2),
        aComprar: toOrder + " " + p.unit,
        costoCompra: ff(costCompra)
      };
    }).filter(r => parseInt(r.aComprar) > 0);
  };

  // Tab 4: Tendencias
  const consumoTrend = () => {
    return eventos.map(e => {
      let total = 0;
      e.consumption.forEach(c => {
        const p = getProducto(c.productId);
        if(selectedProduct && p && p.id === selectedProduct) {
          total += c.cantidadUsada;
        }
      });
      return { date: e.date, cantidad: total };
    });
  };

  const topGrowingProducts = () => {
    if(eventos.length < 2) return [];
    const consumoByEvent = {};
    eventos.forEach((e, idx) => {
      e.consumption.forEach(c => {
        if(!consumoByEvent[c.productId]) consumoByEvent[c.productId] = [];
        consumoByEvent[c.productId][idx] = c.cantidadUsada;
      });
    });

    return productos.map(p => {
      const consumo = consumoByEvent[p.id] || [];
      const first = consumo[0] || 0;
      const last = consumo[consumo.length - 1] || 0;
      const change = last - first;
      return { ...p, change, trend: change > 0 ? "UP" : change < 0 ? "DOWN" : "STABLE" };
    })
    .filter(p => p.change !== 0)
    .sort((a,b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10);
  };

  // Tab 5: Admin - Add/Edit Products
  const [newProduct, setNewProduct] = useState({
    name: "", category: "vodka", unit: "botella", costUnit: 0,
    salePrice: 0, rendimiento: 1, parStock: 0, currentStock: 0
  });

  const handleAddProduct = () => {
    if(!newProduct.name) return;
    const id = "prod_" + Date.now();
    setProductos([...productos, { id, ...newProduct }]);
    setNewProduct({
      name: "", category: "vodka", unit: "botella", costUnit: 0,
      salePrice: 0, rendimiento: 1, parStock: 0, currentStock: 0
    });
  };

  const handleUpdateStock = (productId, newStock) => {
    setProductos(productos.map(p => p.id === productId ? { ...p, currentStock: newStock } : p));
  };

  const handleUpdatePrice = (productId, newPrice, isStock = false) => {
    setProductos(productos.map(p => {
      if(p.id === productId) {
        return isStock ? { ...p, currentStock: newPrice } : { ...p, salePrice: newPrice };
      }
      return p;
    }));
  };

  return (
    <div style={{ background: C.bg, color: C.tx, fontFamily: C.sans, padding: "20px" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select { background: ${C.s3}; border: 1px solid ${C.bd}; color: ${C.tx}; padding: 8px; border-radius: 4px; font-family: ${C.sans}; }
        input:focus, select:focus { outline: none; border-color: ${C.g}; }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "20px", fontFamily: C.mono }}>
          Roca Bruja - CMV Bebidas
        </h1>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
          {[
            "CMV General",
            "Cat\u00e1logo",
            "Consumo",
            "Compras",
            "Tendencias",
            "Admin"
          ].map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                ...pillSt(activeTab === i),
                padding: "10px 16px",
                whiteSpace: "nowrap"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 0: CMV General */}
        {activeTab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <Stat label="Total Compras" value={f(stats.totalCost)} color={C.r} />
              <Stat label="Total Ventas" value={f(stats.totalRevenue)} color={C.g} />
              <Stat label="CMV %" value={pct(stats.cmv, 1)} color={stats.cmv > 50 ? C.r : C.g} />
              <Stat label="Margen Bruto" value={f(stats.margen)} color={C.b} />
            </div>

            <div style={{ ...bx(), marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>CMV por Categor\u00eda</h2>
              {cmvByCategory().map((cat, i) => (
                <Bar key={i} label={cat.label} value={cat.cmv} max={100} color={cat.color} />
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={bx()}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Top 10 - Margen</h2>
                <div>
                  {top10ProductsByMargin().map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bd}`, fontSize: "12px" }}>
                      <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden" }}>{p.name}</span>
                      <span style={{ color: C.g, fontFamily: C.mono }}>{pct(p.pctMargen, 1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={bx()}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Top 10 - Volumen</h2>
                <div>
                  {top10ProductsByVolume().map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bd}`, fontSize: "12px" }}>
                      <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden" }}>{p.name}</span>
                      <span style={{ color: C.y, fontFamily: C.mono }}>{p.volumen}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {productosBajoStock().length > 0 && (
              <div style={{ ...bx(), background: C.s1, border: `1px solid ${C.r}` }}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono, color: C.r }}>
                  Alerta: Stock Bajo ({productosBajoStock().length})
                </h2>
                <div style={{ fontSize: "12px" }}>
                  {productosBajoStock().map((p, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.bd}`, color: C.tx }}>
                      <span style={{ fontWeight: "500" }}>{p.name}</span>
                      <span style={{ color: C.t2, marginLeft: "12px" }}>Stock: {p.currentStock}/{p.parStock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: Catálogo */}
        {activeTab === 1 && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchCatalogo}
                onChange={e => setSearchCatalogo(e.target.value)}
                style={{ width: "100%", marginBottom: "12px" }}
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setFilterCategory(null)}
                  style={pillSt(filterCategory === null)}
                >
                  Todos
                </button>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    style={pillSt(filterCategory === cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={bx()}>
              <Table
                columns={[
                  { label: "Producto", key: "name" },
                  { label: "Categor\u00eda", key: "category" },
                  { label: "Costo", key: "costUnit", align: "right" },
                  { label: "Precio Venta", key: "salePrice", align: "right" },
                  { label: "CMV %", key: "cmv", align: "right" },
                  { label: "Margen $", key: "margen", align: "right" },
                  { label: "Stock", key: "stock", align: "right" },
                  { label: "Par", key: "parStock", align: "right" },
                  { label: "Estado", key: "estado" }
                ]}
                rows={productosFiltrados().map(p => ({
                  name: p.name,
                  category: getCategoria(p.category)?.label || p.category,
                  costUnit: ff(p.costUnit),
                  salePrice: ff(p.salePrice),
                  cmv: pct(getCMV(p.costUnit, p.salePrice), 1),
                  margen: ff(getMargen(p.salePrice, p.costUnit)),
                  stock: p.currentStock + " " + p.unit,
                  parStock: p.parStock,
                  estado: p.currentStock >= p.parStock ? "OK" : p.currentStock < p.parStock / 2 ? "CR\u00cdTICO" : "BAJO",
                  ...p
                }))}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Consumo */}
        {activeTab === 2 && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: C.t2 }}>
                Seleccionar Evento:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {eventos.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvent(e.id)}
                    style={pillSt(selectedEvent === e.id)}
                  >
                    {e.date} ({e.cycle})
                  </button>
                ))}
              </div>
            </div>

            {selectedEventData() && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <Stat label="Costo Consumido" value={f(eventStats().cost)} color={C.r} />
                  <Stat label="Ventas" value={f(eventStats().revenue)} color={C.g} />
                  <Stat label="CMV %" value={pct(eventStats().cmv, 1)} color={eventStats().cmv > 50 ? C.r : C.g} />
                  <Stat label="Margen" value={f(eventStats().margen)} color={C.b} />
                </div>

                <div style={{ ...bx(), marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Consumo por Producto</h2>
                  <Table
                    columns={[
                      { label: "Producto", key: "producto" },
                      { label: "Usado", key: "usado", align: "right" },
                      { label: "Costo Usado", key: "costoUsado", align: "right" },
                      { label: "Vendido", key: "vendido", align: "right" },
                      { label: "CMV %", key: "cmv", align: "right" },
                      { label: "Margen", key: "margen", align: "right" }
                    ]}
                    rows={eventConsumptionTable()}
                  />
                </div>

                <div style={bx()}>
                  <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Desglose por Categor\u00eda</h2>
                  {eventCategoryBreakdown().map((cat, i) => (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "500" }}>{cat.label}</span>
                        <span style={{ color: C.t2, fontFamily: C.mono }}>
                          CMV: {pct(cat.costo / cat.revenue * 100, 1)} | Margen: {f(cat.revenue - cat.costo)}
                        </span>
                      </div>
                      <Bar label="Cantidad" value={(cat.cantidad / Math.max(...eventCategoryBreakdown().map(c => c.cantidad))) * 100} color={getCategoria(Object.keys({ sabado: 0, viernes: 0, master: 0 }).find(k => eventCategoryBreakdown().find(c => c.label === cat.label))?.category)?.color || C.g} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: Compras */}
        {activeTab === 3 && (
          <div>
            <div style={{ ...bx(), marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Eventos Planeados</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {["sabado", "viernes", "master"].map(cycle => (
                  <div key={cycle}>
                    <label style={{ display: "block", fontSize: "12px", color: C.t2, marginBottom: "4px", textTransform: "capitalize" }}>
                      {cycle}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={eventsPlanned[cycle]}
                      onChange={e => setEventsPlanned({ ...eventsPlanned, [cycle]: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={bx()}>
              <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Sugerencia de Compras</h2>
              <Table
                columns={[
                  { label: "Producto", key: "producto" },
                  { label: "Stock Actual", key: "stockActual", align: "right" },
                  { label: "Consumo Promedio", key: "consumoPromedio", align: "right" },
                  { label: "Eventos", key: "eventosPlaneados", align: "right" },
                  { label: "Necesidad", key: "necesidad", align: "right" },
                  { label: "A Comprar", key: "aComprar", align: "right" },
                  { label: "Costo Compra", key: "costoCompra", align: "right" }
                ]}
                rows={suggestedPurchases()}
              />
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${C.bd}`, textAlign: "right", fontWeight: "600" }}>
                Total Compra: {f(suggestedPurchases().reduce((sum, r) => { const p = productos.find(x => x.name === r.producto); return sum + (parseInt(r.aComprar) || 0) * (p ? p.costUnit : 0); }, 0))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Tendencias */}
        {activeTab === 4 && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: C.t2 }}>
                Seleccionar Producto:
              </label>
              <select
                value={selectedProduct || ""}
                onChange={e => setSelectedProduct(e.target.value || null)}
                style={{ width: "100%", maxWidth: "400px" }}
              >
                <option value="">-- Seleccionar --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={bx()}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Consumo en el Tiempo</h2>
                {selectedProduct ? (
                  <div>
                    {consumoTrend().filter(t => t.cantidad > 0).map((t, i) => (
                      <div key={i} style={{ padding: "8px 0", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: C.t2 }}>{t.date}</span>
                        <span style={{ fontFamily: C.mono }}>{t.cantidad} unidades</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: C.t2, fontSize: "12px" }}>Selecciona un producto</p>
                )}
              </div>

              <div style={bx()}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Productos en Crecimiento</h2>
                {topGrowingProducts().map((p, i) => (
                  <div key={i} style={{ padding: "8px 0", fontSize: "12px", borderBottom: `1px solid ${C.bd}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{p.name}</span>
                      <span style={{ color: p.change > 0 ? C.g : C.r, fontFamily: C.mono }}>
                        {p.change > 0 ? "+" : ""}{p.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Admin */}
        {activeTab === 5 && (
          <div>
            <div style={{ ...bx(), marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>A\u00f1adir Nuevo Producto</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {CATEGORIAS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={newProduct.unit}
                  onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                >
                  {["botella", "lata", "unidad", "barril"].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Costo"
                  value={newProduct.costUnit}
                  onChange={e => setNewProduct({ ...newProduct, costUnit: parseInt(e.target.value) || 0 })}
                />
                <input
                  type="number"
                  placeholder="Precio Venta"
                  value={newProduct.salePrice}
                  onChange={e => setNewProduct({ ...newProduct, salePrice: parseInt(e.target.value) || 0 })}
                />
                <input
                  type="number"
                  placeholder="Rendimiento"
                  value={newProduct.rendimiento}
                  onChange={e => setNewProduct({ ...newProduct, rendimiento: parseInt(e.target.value) || 1 })}
                />
                <input
                  type="number"
                  placeholder="Par Stock"
                  value={newProduct.parStock}
                  onChange={e => setNewProduct({ ...newProduct, parStock: parseInt(e.target.value) || 0 })}
                />
                <input
                  type="number"
                  placeholder="Stock Actual"
                  value={newProduct.currentStock}
                  onChange={e => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <button
                onClick={handleAddProduct}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: C.g,
                  color: C.bg,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontFamily: C.sans
                }}
              >
                A\u00f1adir Producto
              </button>
            </div>

            <div style={bx()}>
              <h2 style={{ fontSize: "16px", marginBottom: "16px", fontFamily: C.mono }}>Actualizar Stock</h2>
              <div style={{ fontSize: "12px" }}>
                {productos.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: `1px solid ${C.bd}` }}>
                    <span style={{ flex: 1 }}>{p.name}</span>
                    <input
                      type="number"
                      value={p.currentStock}
                      onChange={e => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                      style={{ width: "80px", padding: "4px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
