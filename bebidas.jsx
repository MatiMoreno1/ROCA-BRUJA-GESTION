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
  { id:"vodka", label:"Vodka", color: C.b },
  { id:"fernet", label:"Fernet", color: C.g },
  { id:"whisky", label:"Whisky", color: C.y },
  { id:"gin", label:"Gin", color: C.v },
  { id:"ron", label:"Ron", color: C.o },
  { id:"tequila", label:"Tequila", color: C.r },
  { id:"champagne", label:"Champagne/Espumante", color: C.p },
  { id:"cerveza", label:"Cerveza", color: C.y },
  { id:"energizante", label:"Energizantes", color: C.g },
  { id:"soft", label:"Gaseosas/Agua", color: C.b },
  { id:"otros", label:"Otros", color: C.t2 }
];

const PRODUCTOS_INICIAL = [
  // Vodka
  { id:"vodka_smirnoff", name:"Smirnoff 750ml", category:"vodka", unit:"botella", costUnit:8500, salePrice:45000, rendimiento:1, parStock:8, currentStock:12 },
  { id:"vodka_absolut", name:"Absolut 750ml", category:"vodka", unit:"botella", costUnit:15000, salePrice:65000, rendimiento:1, parStock:6, currentStock:9 },
  { id:"vodka_greygoose", name:"Grey Goose 750ml", category:"vodka", unit:"botella", costUnit:35000, salePrice:120000, rendimiento:1, parStock:4, currentStock:5 },
  // Fernet
  { id:"fernet_branca", name:"Fernet Branca 750ml", category:"fernet", unit:"botella", costUnit:7500, salePrice:40000, rendimiento:1, parStock:10, currentStock:14 },
  { id:"fernet_1882", name:"Fernet 1882 750ml", category:"fernet", unit:"botella", costUnit:5500, salePrice:32000, rendimiento:1, parStock:12, currentStock:16 },
  // Whisky
  { id:"whisky_jwred", name:"Johnnie Walker Red 750ml", category:"whisky", unit:"botella", costUnit:12000, salePrice:55000, rendimiento:1, parStock:6, currentStock:8 },
  { id:"whisky_jwblack", name:"Johnnie Walker Black 750ml", category:"whisky", unit:"botella", costUnit:22000, salePrice:85000, rendimiento:1, parStock:4, currentStock:6 },
  { id:"whisky_jackdaniels", name:"Jack Daniels 750ml", category:"whisky", unit:"botella", costUnit:18000, salePrice:70000, rendimiento:1, parStock:5, currentStock:7 },
  // Gin
  { id:"gin_bombay", name:"Bombay Sapphire 750ml", category:"gin", unit:"botella", costUnit:16000, salePrice:65000, rendimiento:1, parStock:5, currentStock:7 },
  { id:"gin_beefeater", name:"Beefeater 750ml", category:"gin", unit:"botella", costUnit:12000, salePrice:55000, rendimiento:1, parStock:6, currentStock:8 },
  { id:"gin_tanqueray", name:"Tanqueray 750ml", category:"gin", unit:"botella", costUnit:18000, salePrice:72000, rendimiento:1, parStock:5, currentStock:6 },
  // Ron
  { id:"ron_havana3", name:"Havana Club 3 A\u00f1os 750ml", category:"ron", unit:"botella", costUnit:9000, salePrice:42000, rendimiento:1, parStock:8, currentStock:11 },
  { id:"ron_bacardi", name:"Bacardi 750ml", category:"ron", unit:"botella", costUnit:8000, salePrice:38000, rendimiento:1, parStock:9, currentStock:13 },
  // Tequila
  { id:"tequila_cuervo", name:"Jos\u00e9 Cuervo 750ml", category:"tequila", unit:"botella", costUnit:12000, salePrice:50000, rendimiento:1, parStock:5, currentStock:7 },
  { id:"tequila_jimador", name:"Jimador 750ml", category:"tequila", unit:"botella", costUnit:14000, salePrice:55000, rendimiento:1, parStock:5, currentStock:6 },
  // Champagne/Espumante
  { id:"champagne_chandon", name:"Chandon Cl\u00e1sico 750ml", category:"champagne", unit:"botella", costUnit:8000, salePrice:45000, rendimiento:1, parStock:6, currentStock:8 },
  { id:"champagne_moet", name:"Mo\u00ebt & Chandon 750ml", category:"champagne", unit:"botella", costUnit:45000, salePrice:180000, rendimiento:1, parStock:2, currentStock:3 },
  { id:"champagne_baronb", name:"Bar\u00f3n B. Extra Brut 750ml", category:"champagne", unit:"botella", costUnit:15000, salePrice:75000, rendimiento:1, parStock:5, currentStock:7 },
  // Cerveza
  { id:"cerveza_stella_lata", name:"Stella Artois Lata 473ml", category:"cerveza", unit:"lata", costUnit:1200, salePrice:5000, rendimiento:1, parStock:80, currentStock:120 },
  { id:"cerveza_corona_botella", name:"Corona Botella 355ml", category:"cerveza", unit:"botella", costUnit:1800, salePrice:6500, rendimiento:1, parStock:60, currentStock:90 },
  { id:"cerveza_miller_lata", name:"Miller Lata 473ml", category:"cerveza", unit:"lata", costUnit:1000, salePrice:4500, rendimiento:1, parStock:100, currentStock:150 },
  { id:"cerveza_heineken_lata", name:"Heineken Lata 473ml", category:"cerveza", unit:"lata", costUnit:1400, salePrice:5500, rendimiento:1, parStock:80, currentStock:110 },
  { id:"cerveza_tirada", name:"Tirada Barril 50L", category:"cerveza", unit:"barril", costUnit:35000, salePrice:3500, rendimiento:100, parStock:1, currentStock:2 },
  // Energizantes
  { id:"energizante_redbull", name:"Red Bull 250ml", category:"energizante", unit:"lata", costUnit:2500, salePrice:6000, rendimiento:1, parStock:60, currentStock:85 },
  { id:"energizante_speed", name:"Speed 250ml", category:"energizante", unit:"lata", costUnit:1500, salePrice:4000, rendimiento:1, parStock:70, currentStock:100 },
  // Soft
  { id:"soft_coca", name:"Coca Cola 2.25L", category:"soft", unit:"botella", costUnit:2500, salePrice:8000, rendimiento:6, parStock:8, currentStock:12 },
  { id:"soft_sprite", name:"Sprite 2.25L", category:"soft", unit:"botella", costUnit:2500, salePrice:8000, rendimiento:6, parStock:8, currentStock:10 },
  { id:"soft_agua", name:"Agua Mineral 500ml", category:"soft", unit:"unidad", costUnit:500, salePrice:3000, rendimiento:1, parStock:100, currentStock:150 },
  { id:"soft_tonica", name:"T\u00f3nica Schweppes 200ml", category:"soft", unit:"lata", costUnit:1500, salePrice:5000, rendimiento:1, parStock:40, currentStock:60 },
  // Otros
  { id:"otros_aperol", name:"Aperol 750ml", category:"otros", unit:"botella", costUnit:10000, salePrice:48000, rendimiento:1, parStock:4, currentStock:5 },
  { id:"otros_campari", name:"Campari 750ml", category:"otros", unit:"botella", costUnit:9000, salePrice:45000, rendimiento:1, parStock:4, currentStock:6 },
  { id:"otros_jagermeister", name:"J\u00e4germeister 750ml", category:"otros", unit:"botella", costUnit:11000, salePrice:50000, rendimiento:1, parStock:4, currentStock:5 },
  { id:"otros_baileys", name:"Bailey's 750ml", category:"otros", unit:"botella", costUnit:14000, salePrice:60000, rendimiento:1, parStock:3, currentStock:4 },
  { id:"otros_gancia", name:"Gancia 750ml", category:"otros", unit:"botella", costUnit:5000, salePrice:28000, rendimiento:1, parStock:6, currentStock:8 },
  { id:"otros_cynar", name:"Cynar 750ml", category:"otros", unit:"botella", costUnit:6000, salePrice:32000, rendimiento:1, parStock:5, currentStock:7 },
  { id:"otros_hesperidina", name:"Hesperidina 750ml", category:"otros", unit:"botella", costUnit:4500, salePrice:24000, rendimiento:1, parStock:6, currentStock:9 },
  { id:"otros_malibu", name:"Malibu 750ml", category:"otros", unit:"botella", costUnit:13000, salePrice:55000, rendimiento:1, parStock:3, currentStock:4 },
];

const EVENTOS_INICIAL = [
  {
    id: "event_1",
    cycle: "sabado",
    date: "2026-02-15",
    consumption: [
      { productId: "vodka_smirnoff", cantidadUsada: 18, totalVenta: 810000 },
      { productId: "vodka_absolut", cantidadUsada: 12, totalVenta: 780000 },
      { productId: "fernet_branca", cantidadUsada: 22, totalVenta: 880000 },
      { productId: "fernet_1882", cantidadUsada: 20, totalVenta: 640000 },
      { productId: "cerveza_stella_lata", cantidadUsada: 180, totalVenta: 900000 },
      { productId: "cerveza_miller_lata", cantidadUsada: 150, totalVenta: 675000 },
      { productId: "energizante_redbull", cantidadUsada: 95, totalVenta: 570000 },
      { productId: "soft_agua", cantidadUsada: 120, totalVenta: 360000 },
    ]
  },
  {
    id: "event_2",
    cycle: "viernes",
    date: "2026-02-14",
    consumption: [
      { productId: "vodka_smirnoff", cantidadUsada: 12, totalVenta: 540000 },
      { productId: "fernet_branca", cantidadUsada: 16, totalVenta: 640000 },
      { productId: "whisky_jwred", cantidadUsada: 8, totalVenta: 440000 },
      { productId: "cerveza_corona_botella", cantidadUsada: 140, totalVenta: 910000 },
      { productId: "energizante_speed", cantidadUsada: 70, totalVenta: 280000 },
      { productId: "soft_sprite", cantidadUsada: 5, totalVenta: 40000 },
    ]
  },
  {
    id: "event_3",
    cycle: "sabado",
    date: "2026-02-08",
    consumption: [
      { productId: "vodka_absolut", cantidadUsada: 14, totalVenta: 910000 },
      { productId: "gin_bombay", cantidadUsada: 10, totalVenta: 650000 },
      { productId: "champagne_chandon", cantidadUsada: 8, totalVenta: 360000 },
      { productId: "cerveza_heineken_lata", cantidadUsada: 160, totalVenta: 880000 },
      { productId: "energizante_redbull", cantidadUsada: 85, totalVenta: 510000 },
    ]
  },
  {
    id: "event_4",
    cycle: "master",
    date: "2026-02-01",
    consumption: [
      { productId: "vodka_greygoose", cantidadUsada: 4, totalVenta: 480000 },
      { productId: "champagne_moet", cantidadUsada: 3, totalVenta: 540000 },
      { productId: "cerveza_tirada", cantidadUsada: 1, totalVenta: 350000 },
      { productId: "gin_tanqueray", cantidadUsada: 8, totalVenta: 576000 },
      { productId: "energizante_redbull", cantidadUsada: 100, totalVenta: 600000 },
    ]
  },
  {
    id: "event_5",
    cycle: "viernes",
    date: "2026-02-07",
    consumption: [
      { productId: "vodka_smirnoff", cantidadUsada: 10, totalVenta: 450000 },
      { productId: "fernet_1882", cantidadUsada: 18, totalVenta: 576000 },
      { productId: "ron_havana3", cantidadUsada: 9, totalVenta: 378000 },
      { productId: "cerveza_stella_lata", cantidadUsada: 130, totalVenta: 650000 },
      { productId: "soft_coca", cantidadUsada: 4, totalVenta: 32000 },
    ]
  },
  {
    id: "event_6",
    cycle: "sabado",
    date: "2026-02-22",
    consumption: [
      { productId: "vodka_smirnoff", cantidadUsada: 16, totalVenta: 720000 },
      { productId: "fernet_branca", cantidadUsada: 20, totalVenta: 800000 },
      { productId: "whisky_jackdaniels", cantidadUsada: 6, totalVenta: 420000 },
      { productId: "cerveza_miller_lata", cantidadUsada: 170, totalVenta: 765000 },
      { productId: "energizante_speed", cantidadUsada: 80, totalVenta: 320000 },
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
