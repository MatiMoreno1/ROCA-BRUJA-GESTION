import { useState } from "react";

const C = {
  bg: "#060609", s1: "#0e0e14", s2: "#16161f", s3: "#1e1e2a",
  tx: "#e2e2e6", t2: "#9999a8", bd: "#2a2a3a",
  g: "#34D399", y: "#FCD34D", r: "#F87171", p: "#F472B6",
  b: "#60A5FA", o: "#FB923C", v: "#A78BFA", w: "#ffffff",
  mono: "'DM Mono',monospace", sans: "'DM Sans',sans-serif"
};

const CICLOS = [
  { id: "sabado", label: "S\u00e1bado", color: C.y },
  { id: "viernes", label: "Viernes", color: C.g },
  { id: "master", label: "Master", color: C.p }
];

const VENDORS_CONFIG = {
  sabado: [
    { name: "Juan L", com: 10 },
    { name: "Toto M", com: 10 },
    { name: "Nacho Zava", com: 12 },
    { name: "Fio H", com: 10 },
    { name: "Martu P", com: 10 },
    { name: "Sofi R", com: 10 },
    { name: "Nico B", com: 8 },
    { name: "Valen G", com: 10 },
    { name: "Facu D", com: 10 },
    { name: "Cami S", com: 10 },
    { name: "Agus T", com: 8 },
    { name: "Mili R", com: 10 }
  ],
  viernes: [
    { name: "Martu P", com: 10 },
    { name: "Sofi R", com: 10 },
    { name: "Nico B", com: 8 },
    { name: "Cami S", com: 10 },
    { name: "Lau M", com: 10 },
    { name: "Tomi F", com: 10 },
    { name: "Belu A", com: 10 },
    { name: "Fran K", com: 8 },
    { name: "Dani V", com: 10 },
    { name: "Juli C", com: 10 }
  ],
  master: [
    { name: "Juan L", com: 10 },
    { name: "Nacho Zava", com: 12 },
    { name: "Fio H", com: 10 },
    { name: "Valen G", com: 10 },
    { name: "Facu D", com: 10 },
    { name: "Agus T", com: 8 },
    { name: "Lau M", com: 10 },
    { name: "Tomi F", com: 10 },
    { name: "Fran K", com: 8 },
    { name: "Romi G", com: 10 },
    { name: "Santi P", com: 12 }
  ]
};

const EVENTS = [
  {
    id: "ev1", cycle: "sabado", date: "2026-03-07",
    vendorSales: [
      { vendedor: "Juan L", mesas: 4, monto: 950000, clientes: 24, cobrado: true },
      { vendedor: "Toto M", mesas: 3, monto: 750000, clientes: 18, cobrado: true },
      { vendedor: "Nacho Zava", mesas: 5, monto: 1200000, clientes: 30, cobrado: false },
      { vendedor: "Fio H", mesas: 3, monto: 650000, clientes: 16, cobrado: true },
      { vendedor: "Martu P", mesas: 4, monto: 850000, clientes: 22, cobrado: true },
      { vendedor: "Sofi R", mesas: 3, monto: 700000, clientes: 18, cobrado: false },
      { vendedor: "Nico B", mesas: 2, monto: 480000, clientes: 12, cobrado: true },
      { vendedor: "Valen G", mesas: 3, monto: 720000, clientes: 19, cobrado: true }
    ]
  },
  {
    id: "ev2", cycle: "viernes", date: "2026-03-13",
    vendorSales: [
      { vendedor: "Martu P", mesas: 3, monto: 650000, clientes: 16, cobrado: true },
      { vendedor: "Sofi R", mesas: 2, monto: 520000, clientes: 13, cobrado: true },
      { vendedor: "Nico B", mesas: 2, monto: 450000, clientes: 11, cobrado: false },
      { vendedor: "Cami S", mesas: 4, monto: 900000, clientes: 23, cobrado: true },
      { vendedor: "Lau M", mesas: 3, monto: 680000, clientes: 17, cobrado: true },
      { vendedor: "Tomi F", mesas: 2, monto: 520000, clientes: 13, cobrado: true }
    ]
  },
  {
    id: "ev3", cycle: "master", date: "2026-03-21",
    vendorSales: [
      { vendedor: "Juan L", mesas: 5, monto: 1100000, clientes: 28, cobrado: true },
      { vendedor: "Nacho Zava", mesas: 6, monto: 1400000, clientes: 35, cobrado: true },
      { vendedor: "Fio H", mesas: 4, monto: 900000, clientes: 23, cobrado: false },
      { vendedor: "Valen G", mesas: 4, monto: 850000, clientes: 22, cobrado: true },
      { vendedor: "Facu D", mesas: 3, monto: 720000, clientes: 18, cobrado: true },
      { vendedor: "Agus T", mesas: 3, monto: 620000, clientes: 16, cobrado: false },
      { vendedor: "Lau M", mesas: 4, monto: 880000, clientes: 22, cobrado: true },
      { vendedor: "Tomi F", mesas: 3, monto: 750000, clientes: 19, cobrado: true },
      { vendedor: "Fran K", mesas: 2, monto: 520000, clientes: 13, cobrado: true }
    ]
  },
  {
    id: "ev4", cycle: "sabado", date: "2026-03-28",
    vendorSales: [
      { vendedor: "Juan L", mesas: 3, monto: 700000, clientes: 18, cobrado: false },
      { vendedor: "Toto M", mesas: 4, monto: 920000, clientes: 23, cobrado: true },
      { vendedor: "Nacho Zava", mesas: 4, monto: 950000, clientes: 24, cobrado: true },
      { vendedor: "Fio H", mesas: 4, monto: 800000, clientes: 20, cobrado: true },
      { vendedor: "Martu P", mesas: 3, monto: 680000, clientes: 17, cobrado: true },
      { vendedor: "Valen G", mesas: 4, monto: 900000, clientes: 23, cobrado: true },
      { vendedor: "Facu D", mesas: 3, monto: 750000, clientes: 19, cobrado: false },
      { vendedor: "Cami S", mesas: 3, monto: 720000, clientes: 18, cobrado: true },
      { vendedor: "Agus T", mesas: 2, monto: 500000, clientes: 13, cobrado: true }
    ]
  },
  {
    id: "ev5", cycle: "viernes", date: "2026-04-03",
    vendorSales: [
      { vendedor: "Martu P", mesas: 2, monto: 480000, clientes: 12, cobrado: true },
      { vendedor: "Sofi R", mesas: 3, monto: 650000, clientes: 16, cobrado: true },
      { vendedor: "Cami S", mesas: 3, monto: 700000, clientes: 18, cobrado: false },
      { vendedor: "Lau M", mesas: 4, monto: 850000, clientes: 21, cobrado: true },
      { vendedor: "Tomi F", mesas: 3, monto: 680000, clientes: 17, cobrado: true },
      { vendedor: "Belu A", mesas: 2, monto: 520000, clientes: 13, cobrado: true },
      { vendedor: "Dani V", mesas: 2, monto: 450000, clientes: 11, cobrado: false }
    ]
  },
  {
    id: "ev6", cycle: "sabado", date: "2026-04-11",
    vendorSales: [
      { vendedor: "Juan L", mesas: 3, monto: 720000, clientes: 18, cobrado: true },
      { vendedor: "Toto M", mesas: 2, monto: 550000, clientes: 14, cobrado: true },
      { vendedor: "Nacho Zava", mesas: 4, monto: 950000, clientes: 24, cobrado: true },
      { vendedor: "Fio H", mesas: 3, monto: 680000, clientes: 17, cobrado: false },
      { vendedor: "Sofi R", mesas: 2, monto: 520000, clientes: 13, cobrado: true },
      { vendedor: "Nico B", mesas: 3, monto: 680000, clientes: 17, cobrado: true },
      { vendedor: "Valen G", mesas: 4, monto: 920000, clientes: 23, cobrado: true },
      { vendedor: "Facu D", mesas: 3, monto: 750000, clientes: 19, cobrado: true },
      { vendedor: "Cami S", mesas: 4, monto: 880000, clientes: 22, cobrado: false },
      { vendedor: "Mili R", mesas: 2, monto: 500000, clientes: 13, cobrado: true }
    ]
  },
  {
    id: "ev7", cycle: "master", date: "2026-04-18",
    vendorSales: [
      { vendedor: "Juan L", mesas: 4, monto: 900000, clientes: 23, cobrado: true },
      { vendedor: "Nacho Zava", mesas: 5, monto: 1300000, clientes: 33, cobrado: true },
      { vendedor: "Fio H", mesas: 3, monto: 750000, clientes: 19, cobrado: true },
      { vendedor: "Valen G", mesas: 3, monto: 720000, clientes: 18, cobrado: false },
      { vendedor: "Facu D", mesas: 4, monto: 850000, clientes: 21, cobrado: true },
      { vendedor: "Agus T", mesas: 2, monto: 550000, clientes: 14, cobrado: true },
      { vendedor: "Romi G", mesas: 3, monto: 700000, clientes: 18, cobrado: true },
      { vendedor: "Santi P", mesas: 4, monto: 900000, clientes: 23, cobrado: false }
    ]
  },
  {
    id: "ev8", cycle: "viernes", date: "2026-04-25",
    vendorSales: [
      { vendedor: "Martu P", mesas: 2, monto: 520000, clientes: 13, cobrado: true },
      { vendedor: "Sofi R", mesas: 2, monto: 480000, clientes: 12, cobrado: true },
      { vendedor: "Cami S", mesas: 3, monto: 750000, clientes: 19, cobrado: true },
      { vendedor: "Lau M", mesas: 3, monto: 700000, clientes: 18, cobrado: false },
      { vendedor: "Tomi F", mesas: 2, monto: 520000, clientes: 13, cobrado: true },
      { vendedor: "Fran K", mesas: 2, monto: 480000, clientes: 12, cobrado: true }
    ]
  }
];

const f = (n) => (n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K");
const ff = (n) => "$" + n.toLocaleString("es-AR");
const pct = (n) => n.toFixed(1) + "%";
const bx = (bg, bd) => ({ background: bg, border: "1px solid " + bd, borderRadius: "8px", padding: "16px" });
const pillSt = (active, color) => ({
  padding: "8px 16px", borderRadius: "20px", border: "none",
  background: active ? color : C.s2, color: active ? C.bg : C.tx,
  cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: C.sans,
  transition: "0.2s"
});

const Stat = ({ label, value, unit = "" }) => (
  <div style={{ ...bx(C.s1, C.bd), textAlign: "center" }}>
    <div style={{ fontSize: "12px", color: C.t2, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
      {label}
    </div>
    <div style={{ fontSize: "24px", fontWeight: "700", color: C.tx, fontFamily: C.mono }}>
      {value}{unit}
    </div>
  </div>
);

const Bar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
      <span style={{ color: C.tx }}>{label}</span>
      <span style={{ color: C.t2, fontFamily: C.mono }}>{f(value)}</span>
    </div>
    <div style={{ height: "6px", background: C.s3, borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: ((value / max) * 100) + "%", background: color, transition: "0.3s" }} />
    </div>
  </div>
);

const Table = ({ headers, rows, rowClick }) => (
  <div style={{ overflowX: "auto", marginTop: "16px" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: C.sans }}>
      <thead>
        <tr style={{ borderBottom: "1px solid " + C.bd }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "12px", textAlign: "left", color: C.t2, fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} onClick={() => rowClick && rowClick(row)} style={{ borderBottom: "1px solid " + C.bd, cursor: rowClick ? "pointer" : "default", transition: "0.2s", background: rowClick ? "transparent" : undefined }}>
            {row.cells.map((cell, j) => (
              <td key={j} style={{ padding: "12px", color: cell.color || C.tx }}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const VendedoresRB = () => {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("todos");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendor1, setVendor1] = useState(null);
  const [vendor2, setVendor2] = useState(null);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCom, setNewVendorCom] = useState(10);
  const [newVendorCycles, setNewVendorCycles] = useState([]);
  const [vendors, setVendors] = useState(VENDORS_CONFIG);
  const [events, setEvents] = useState(EVENTS);
  const [commissionFilter, setCommissionFilter] = useState("todos");

  const getAllVendorNames = () => {
    const names = new Set();
    Object.values(vendors).forEach(v => v.forEach(vd => names.add(vd.name)));
    return Array.from(names).sort();
  };

  const getVendorCycles = (name) => {
    const cycles = [];
    if (vendors.sabado.find(v => v.name === name)) cycles.push("sabado");
    if (vendors.viernes.find(v => v.name === name)) cycles.push("viernes");
    if (vendors.master.find(v => v.name === name)) cycles.push("master");
    return cycles;
  };

  const getVendorComission = (name) => {
    for (const cycle of Object.values(vendors)) {
      const v = cycle.find(vd => vd.name === name);
      if (v) return v.com;
    }
    return 10;
  };

  const filterVendorSales = (vendorName) => {
    return events.flatMap(ev => ev.vendorSales.filter(vs => vs.vendedor === vendorName).map(vs => ({ ...vs, eventId: ev.id, cycle: ev.cycle, date: ev.date })));
  };

  const getAllSales = () => {
    const allSales = [];
    events.forEach(ev => {
      ev.vendorSales.forEach(vs => {
        allSales.push({ ...vs, eventId: ev.id, cycle: ev.cycle, date: ev.date });
      });
    });
    return allSales;
  };

  const getFilteredAllSales = () => {
    let sales = getAllSales();
    if (filter !== "todos") {
      sales = sales.filter(s => s.cycle === filter);
    }
    return sales;
  };

  const getFilteredCommissions = () => {
    let sales = getAllSales();
    if (commissionFilter === "cobrado") sales = sales.filter(s => s.cobrado);
    else if (commissionFilter === "pendiente") sales = sales.filter(s => !s.cobrado);
    return sales;
  };

  const calculateRanking = () => {
    const salesMap = {};
    const clientesMap = {};
    const mesasMap = {};
    const cobradoMap = {};
    const totalMap = {};

    getFilteredAllSales().forEach(sale => {
      if (!salesMap[sale.vendedor]) {
        salesMap[sale.vendedor] = 0;
        clientesMap[sale.vendedor] = 0;
        mesasMap[sale.vendedor] = 0;
        cobradoMap[sale.vendedor] = 0;
        totalMap[sale.vendedor] = 0;
      }
      salesMap[sale.vendedor] += sale.monto;
      clientesMap[sale.vendedor] += sale.clientes;
      mesasMap[sale.vendedor] += sale.mesas;
      totalMap[sale.vendedor] += 1;
      if (sale.cobrado) cobradoMap[sale.vendedor] += 1;
    });

    return Object.keys(salesMap).map(name => ({
      name,
      monto: salesMap[name],
      clientes: clientesMap[name],
      mesas: mesasMap[name],
      cobrado: cobradoMap[name],
      total: totalMap[name],
      cycles: getVendorCycles(name),
      com: getVendorComission(name)
    })).sort((a, b) => b.monto - a.monto);
  };

  const getCycleStats = (cycle) => {
    const sales = events.filter(e => e.cycle === cycle).flatMap(e => e.vendorSales);
    const vendorStats = {};
    sales.forEach(s => {
      if (!vendorStats[s.vendedor]) vendorStats[s.vendedor] = { monto: 0, mesas: 0, clientes: 0 };
      vendorStats[s.vendedor].monto += s.monto;
      vendorStats[s.vendedor].mesas += s.mesas;
      vendorStats[s.vendedor].clientes += s.clientes;
    });
    const vendorCount = vendors[cycle] ? vendors[cycle].length : 1;
    return {
      mesas: sales.reduce((a, s) => a + s.mesas, 0),
      monto: sales.reduce((a, s) => a + s.monto, 0),
      promedio: vendorCount > 0 ? sales.reduce((a, s) => a + s.monto, 0) / vendorCount : 0,
      vendorStats
    };
  };

  const addVendor = () => {
    if (!newVendorName.trim() || newVendorCycles.length === 0) return;
    const newVendors = { ...vendors };
    const vendorObj = { name: newVendorName, com: newVendorCom };
    newVendorCycles.forEach(cyc => {
      if (!newVendors[cyc].find(v => v.name === newVendorName)) {
        newVendors[cyc].push(vendorObj);
      }
    });
    setVendors(newVendors);
    setNewVendorName("");
    setNewVendorCom(10);
    setNewVendorCycles([]);
  };

  const removeVendor = (name) => {
    const newVendors = { ...vendors };
    Object.keys(newVendors).forEach(cyc => {
      newVendors[cyc] = newVendors[cyc].filter(v => v.name !== name);
    });
    setVendors(newVendors);
  };

  const toggleCycle = (cycle) => {
    if (newVendorCycles.includes(cycle)) {
      setNewVendorCycles(newVendorCycles.filter(c => c !== cycle));
    } else {
      setNewVendorCycles([...newVendorCycles, cycle]);
    }
  };

  const markComissionPaid = (vendedor, eventId) => {
    const newEvents = events.map(ev => ({
      ...ev,
      vendorSales: ev.vendorSales.map(vs =>
        vs.vendedor === vendedor && ev.id === eventId ? { ...vs, cobrado: true } : vs
      )
    }));
    setEvents(newEvents);
  };

  const ranking = calculateRanking();
  const allVendors = getAllVendorNames();

  return (
    <div style={{ background: C.bg, color: C.tx, fontFamily: C.sans, padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px", letterSpacing: "-0.5px" }}>Roca Bruja</h1>
        <p style={{ color: C.t2, marginBottom: "24px", fontSize: "14px" }}>Performance Dashboard - Ciclos de Venta</p>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px", paddingBottom: "8px" }}>
          {[
            { label: "Ranking", id: 0 },
            { label: "Por Ciclo", id: 1 },
            { label: "Comisiones", id: 2 },
            { label: "Detalle", id: 3 },
            { label: "Comparar", id: 4 },
            { label: "Admin", id: 5 }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none", fontFamily: C.sans,
              background: tab === t.id ? C.g : C.s2, color: tab === t.id ? C.bg : C.tx,
              cursor: "pointer", fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", transition: "0.2s"
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["todos", "sabado", "viernes", "master"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={pillSt(filter === f, CICLOS.find(c => c.id === f)?.color || C.b)}>
                  {f === "todos" ? "Todos" : CICLOS.find(c => c.id === f)?.label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <Stat label="Total Vendedores" value={ranking.length} />
              <Stat label="Total Mesas Vendidas" value={ranking.reduce((a, r) => a + r.mesas, 0)} />
              <Stat label="Total Facturado" value={f(ranking.reduce((a, r) => a + r.monto, 0))} unit="" />
              <Stat label="Comisiones Totales" value={f(ranking.reduce((a, r) => a + (r.monto * r.com / 100), 0))} unit="" />
            </div>

            <div style={bx(C.s1, C.bd)}>
              <Table
                headers={["Pos", "Nombre", "Ciclo(s)", "Mesas", "Monto Total", "Clientes", "Comisi\u00f3n", "% Cobrado"]}
                rows={ranking.map((r, i) => {
                  const medal = i === 0 ? "\ud83e\udd47 " : i === 1 ? "\ud83e\udd48 " : i === 2 ? "\ud83e\udd49 " : "";
                  const color = i === 0 ? C.y : i === 1 ? C.tx : i === 2 ? C.o : C.tx;
                  const cobPct = r.total > 0 ? (r.cobrado / r.total * 100) : 0;
                  return {
                    cells: [
                      { value: medal + (i + 1), color },
                      { value: r.name, color },
                      { value: r.cycles.map(c => CICLOS.find(x => x.id === c)?.label).join(", ") },
                      { value: r.mesas },
                      { value: f(r.monto) },
                      { value: r.clientes },
                      { value: f(r.monto * r.com / 100) },
                      { value: pct(cobPct) }
                    ]
                  };
                })}
                rowClick={(row) => {
                  const vendorName = row.cells[1].value.replace(/[\ud83e\udd47-\ud83e\udd49] /, "");
                  setSelectedVendor(vendorName);
                  setTab(3);
                }}
              />
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {CICLOS.map(ciclo => {
                const stats = getCycleStats(ciclo.id);
                const topVendors = Object.entries(stats.vendorStats).sort((a, b) => b[1].monto - a[1].monto).slice(0, 5);
                return (
                  <div key={ciclo.id} style={bx(C.s1, C.bd)}>
                    <h3 style={{ margin: "0 0 16px 0", color: ciclo.color, fontSize: "18px" }}>{ciclo.label}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                      <Stat label="Mesas" value={stats.mesas} />
                      <Stat label="Monto Total" value={f(stats.monto)} unit="" />
                    </div>
                    <Stat label="Promedio por Vendor" value={f(stats.promedio)} unit="" />
                    <div style={{ marginTop: "16px" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: C.t2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Top 5</h4>
                      {topVendors.map(([name, stat], i) => (
                        <Bar key={name} label={name} value={stat.monto} max={topVendors[0][1].monto} color={ciclo.color} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["todos", "cobrado", "pendiente"].map(f => (
                <button key={f} onClick={() => setCommissionFilter(f)} style={pillSt(commissionFilter === f, f === "cobrado" ? C.g : f === "pendiente" ? C.o : C.b)}>
                  {f === "todos" ? "Todos" : f === "cobrado" ? "Pagadas" : "Pendientes"}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {(() => {
                const commissions = getFilteredCommissions();
                const total = commissions.reduce((a, c) => a + (c.monto * getVendorComission(c.vendedor) / 100), 0);
                const paid = commissions.filter(c => c.cobrado).reduce((a, c) => a + (c.monto * getVendorComission(c.vendedor) / 100), 0);
                const pending = total - paid;
                return [
                  <Stat key="1" label="Total Comisiones" value={f(total)} unit="" />,
                  <Stat key="2" label="Total Pagadas" value={f(paid)} unit="" />,
                  <Stat key="3" label="Total Pendientes" value={f(pending)} unit="" />
                ];
              })()}
            </div>

            <div style={bx(C.s1, C.bd)}>
              <Table
                headers={["Vendedor", "Evento", "Fecha", "Monto Venta", "% Com", "Comisi\u00f3n", "Estado"]}
                rows={getFilteredCommissions().map(comm => {
                  const comAmount = comm.monto * getVendorComission(comm.vendedor) / 100;
                  return {
                    cells: [
                      { value: comm.vendedor },
                      { value: comm.eventId },
                      { value: comm.date },
                      { value: f(comm.monto) },
                      { value: getVendorComission(comm.vendedor) + "%" },
                      { value: f(comAmount) },
                      { value: comm.cobrado ? "Pagada" : "Pendiente", color: comm.cobrado ? C.g : C.o }
                    ]
                  };
                })}
              />
            </div>
          </div>
        )}

        {tab === 3 && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: C.t2 }}>Seleccionar Vendedor</label>
              <select value={selectedVendor || ""} onChange={(e) => setSelectedVendor(e.target.value || null)} style={{
                width: "100%", maxWidth: "400px", padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd,
                background: C.s2, color: C.tx, fontFamily: C.sans, fontSize: "14px", cursor: "pointer"
              }}>
                <option value="">-- Seleccionar --</option>
                {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {selectedVendor && (() => {
              const vendorSales = filterVendorSales(selectedVendor);
              const totalMonto = vendorSales.reduce((a, s) => a + s.monto, 0);
              const totalMesas = vendorSales.reduce((a, s) => a + s.mesas, 0);
              const totalClientes = vendorSales.reduce((a, s) => a + s.clientes, 0);
              const com = getVendorComission(selectedVendor);
              const cycles = getVendorCycles(selectedVendor);
              const cycleStats = {};
              CICLOS.forEach(c => {
                cycleStats[c.id] = getCycleStats(c.id);
              });

              return (
                <div>
                  <div style={bx(C.s1, C.bd)}>
                    <h3 style={{ margin: "0 0 16px 0" }}>{selectedVendor}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                      <Stat label="Ciclo(s)" value={cycles.map(c => CICLOS.find(x => x.id === c)?.label).join(", ")} />
                      <Stat label="Comisi\u00f3n" value={com + "%"} />
                      <Stat label="Total Mesas" value={totalMesas} />
                      <Stat label="Total Monto" value={f(totalMonto)} unit="" />
                      <Stat label="Total Clientes" value={totalClientes} />
                      <Stat label="Promedio/Evento" value={f(vendorSales.length > 0 ? totalMonto / vendorSales.length : 0)} unit="" />
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Historial de Eventos</h4>
                    <Table
                      headers={["Fecha", "Ciclo", "Mesas", "Monto", "Clientes", "Comisi\u00f3n", "Estado"]}
                      rows={vendorSales.map(sale => {
                        const comAmount = sale.monto * com / 100;
                        return {
                          cells: [
                            { value: sale.date },
                            { value: CICLOS.find(c => c.id === sale.cycle)?.label },
                            { value: sale.mesas },
                            { value: f(sale.monto) },
                            { value: sale.clientes },
                            { value: f(comAmount) },
                            { value: sale.cobrado ? "Pagada" : "Pendiente", color: sale.cobrado ? C.g : C.o }
                          ]
                        };
                      })}
                    />
                  </div>

                  <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Comparaci\u00f3n vs Promedio del Ciclo</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                      {cycles.map(cycle => {
                        const cycleSales = vendorSales.filter(s => s.cycle === cycle);
                        const cycleAvg = cycleStats[cycle].promedio;
                        const vendorAvg = cycleSales.length > 0 ? cycleSales.reduce((a, s) => a + s.monto, 0) / cycleSales.length : 0;
                        const diff = vendorAvg - cycleAvg;
                        const diffPct = cycleAvg > 0 ? (diff / cycleAvg * 100) : 0;
                        return (
                          <div key={cycle} style={{ padding: "12px", background: C.s2, borderRadius: "8px" }}>
                            <div style={{ color: C.t2, fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>{CICLOS.find(c => c.id === cycle)?.label}</div>
                            <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{f(vendorAvg)}</div>
                            <div style={{ fontSize: "12px", color: diff >= 0 ? C.g : C.r }}>
                              {diff >= 0 ? "+" : ""}{pct(diffPct)} vs promedio
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 4 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: C.t2 }}>Vendedor 1</label>
                <select value={vendor1 || ""} onChange={(e) => setVendor1(e.target.value || null)} style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd,
                  background: C.s2, color: C.tx, fontFamily: C.sans, fontSize: "14px", cursor: "pointer"
                }}>
                  <option value="">-- Seleccionar --</option>
                  {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: C.t2 }}>Vendedor 2</label>
                <select value={vendor2 || ""} onChange={(e) => setVendor2(e.target.value || null)} style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd,
                  background: C.s2, color: C.tx, fontFamily: C.sans, fontSize: "14px", cursor: "pointer"
                }}>
                  <option value="">-- Seleccionar --</option>
                  {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {vendor1 && vendor2 && (() => {
              const sales1 = filterVendorSales(vendor1);
              const sales2 = filterVendorSales(vendor2);
              const m1 = sales1.reduce((a, s) => a + s.mesas, 0);
              const m2 = sales2.reduce((a, s) => a + s.mesas, 0);
              const mo1 = sales1.reduce((a, s) => a + s.monto, 0);
              const mo2 = sales2.reduce((a, s) => a + s.monto, 0);
              const c1 = sales1.reduce((a, s) => a + s.clientes, 0);
              const c2 = sales2.reduce((a, s) => a + s.clientes, 0);
              const com1 = getVendorComission(vendor1);
              const com2 = getVendorComission(vendor2);

              return (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div style={bx(C.s1, C.bd)}>
                      <h3 style={{ margin: "0 0 16px 0" }}>{vendor1}</h3>
                      <Stat label="Total Mesas" value={m1} />
                      <Stat label="Total Monto" value={f(mo1)} unit="" />
                      <Stat label="Total Clientes" value={c1} />
                      <Stat label="Comisi\u00f3n Total" value={f(mo1 * com1 / 100)} unit="" />
                    </div>
                    <div style={bx(C.s1, C.bd)}>
                      <h3 style={{ margin: "0 0 16px 0" }}>{vendor2}</h3>
                      <Stat label="Total Mesas" value={m2} />
                      <Stat label="Total Monto" value={f(mo2)} unit="" />
                      <Stat label="Total Clientes" value={c2} />
                      <Stat label="Comisi\u00f3n Total" value={f(mo2 * com2 / 100)} unit="" />
                    </div>
                  </div>

                  <div style={bx(C.s1, C.bd)}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Comparaci\u00f3n por Evento</h4>
                    <Table
                      headers={["Fecha", "Ciclo", vendor1 + " Mont", vendor2 + " Mont", "Ganador"]}
                      rows={events.map(ev => {
                        const s1 = ev.vendorSales.find(vs => vs.vendedor === vendor1);
                        const s2 = ev.vendorSales.find(vs => vs.vendedor === vendor2);
                        if (!s1 || !s2) return null;
                        const winner = s1.monto > s2.monto ? vendor1 : s2.monto > s1.monto ? vendor2 : "Empate";
                        const winnerColor = winner === vendor1 ? C.g : winner === vendor2 ? C.b : C.t2;
                        return {
                          cells: [
                            { value: ev.date },
                            { value: CICLOS.find(c => c.id === ev.cycle)?.label },
                            { value: f(s1.monto) },
                            { value: f(s2.monto) },
                            { value: winner, color: winnerColor }
                          ]
                        };
                      }).filter(r => r !== null)}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 5 && (
          <div>
            <div style={bx(C.s1, C.bd)}>
              <h3 style={{ margin: "0 0 16px 0" }}>Agregar Nuevo Vendedor</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                <input type="text" placeholder="Nombre" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} style={{
                  padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd, background: C.s2, color: C.tx, fontFamily: C.sans
                }} />
                <input type="number" placeholder="Comisi\u00f3n %" value={newVendorCom} onChange={(e) => setNewVendorCom(parseInt(e.target.value))} style={{
                  padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd, background: C.s2, color: C.tx, fontFamily: C.sans
                }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: C.t2, textTransform: "uppercase" }}>Ciclos</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {CICLOS.map(c => (
                    <button key={c.id} onClick={() => toggleCycle(c.id)} style={pillSt(newVendorCycles.includes(c.id), c.color)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addVendor} style={{
                padding: "10px 20px", borderRadius: "8px", border: "none", background: C.g, color: C.bg,
                cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: C.sans
              }}>
                Agregar
              </button>
            </div>

            <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Gestionar Vendedores</h3>
              <Table
                headers={["Nombre", "Comisi\u00f3n", "Ciclos", "Acci\u00f3n"]}
                rows={allVendors.map(name => ({
                  cells: [
                    { value: name },
                    { value: getVendorComission(name) + "%" },
                    { value: getVendorCycles(name).map(c => CICLOS.find(x => x.id === c)?.label).join(", ") },
                    {
                      value: (
                        <button onClick={() => removeVendor(name)} style={{
                          padding: "6px 12px", borderRadius: "6px", border: "none", background: C.r, color: C.w,
                          cursor: "pointer", fontWeight: "600", fontSize: "12px", fontFamily: C.sans
                        }}>
                          Eliminar
                        </button>
                      )
                    }
                  ]
                }))}
              />
            </div>

            <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Marcar Comisiones como Pagadas</h3>
              <Table
                headers={["Vendedor", "Evento", "Fecha", "Comisi\u00f3n", "Estado", "Acci\u00f3n"]}
                rows={getAllSales().filter(s => !s.cobrado).map(sale => {
                  const comAmount = sale.monto * getVendorComission(sale.vendedor) / 100;
                  return {
                    cells: [
                      { value: sale.vendedor },
                      { value: sale.eventId },
                      { value: sale.date },
                      { value: f(comAmount) },
                      { value: "Pendiente", color: C.o },
                      {
                        value: (
                          <button onClick={() => markComissionPaid(sale.vendedor, sale.eventId)} style={{
                            padding: "6px 12px", borderRadius: "6px", border: "none", background: C.g, color: C.bg,
                            cursor: "pointer", fontWeight: "600", fontSize: "12px", fontFamily: C.sans
                          }}>
                            Pagar
                          </button>
                        )
                      }
                    ]
                  };
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendedoresRB;
