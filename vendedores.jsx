import { useState } from "react";

const C = {
  bg: "#060609", s1: "#0e0e14", s2: "#16161f", s3: "#1e1e2a",
  tx: "#e2e2e6", t2: "#9999a8", bd: "#2a2a3a",
  g: "#34D399", y: "#FCD34D", r: "#F87171", p: "#F472B6",
  b: "#60A5FA", o: "#FB923C", v: "#A78BFA", w: "#ffffff",
  mono: "'DM Mono',monospace", sans: "'DM Sans',sans-serif"
};

const CICLOS = [
  { id: "sabado", label: "Sábado", color: C.y },
  { id: "viernes", label: "Viernes", color: C.g },
  { id: "master", label: "Master", color: C.p }
];

const VENDORS_CONFIG = {
  sabado: [
    { name: "Jose Calvo", com: 10 }, { name: "Juli Radicula", com: 10 },
    { name: "Martu Beisel", com: 10 }, { name: "Martupe", com: 10 },
    { name: "Palo Pinson", com: 10 }, { name: "Tute Merlo", com: 10 },
    { name: "Valen Vázquez", com: 10 }, { name: "Cata Pereyra", com: 10 },
    { name: "Fiore Scarlata", com: 10 }, { name: "Juli García", com: 10 },
    { name: "Juli Mansilla", com: 10 }, { name: "Juli Sobre", com: 10 },
    { name: "Luz Campillo", com: 10 }, { name: "Martu Riobo", com: 10 },
    { name: "Maxima Calvo", com: 10 }, { name: "Mia Minan", com: 10 },
    { name: "Milu Cortes", com: 10 }, { name: "Mora Coghlan", com: 10 },
    { name: "Mori Iglesias", com: 10 }, { name: "Sere Reber", com: 10 },
    { name: "Sofi Rodriguez", com: 10 }, { name: "Clara Sanmarco", com: 10 },
    { name: "Avru Cooke", com: 10 }, { name: "Fiona Herrera", com: 10 },
    { name: "Lola Marasa", com: 10 }, { name: "Martu Salómon", com: 10 },
    { name: "Sol Vidal", com: 10 }, { name: "Cami Vidalle", com: 10 },
    { name: "Guada Fuscile", com: 10 }, { name: "Cami Varni", com: 10 },
    { name: "Delfi Vázquez", com: 10 }, { name: "Cande Torres", com: 10 },
    { name: "Cony Carbone", com: 10 }, { name: "Flor Sandrín", com: 10 },
    { name: "Lara Cano", com: 10 }, { name: "Ori la Torre", com: 10 },
    { name: "Fede Guelman", com: 10 }, { name: "Juli Sánchez Parra", com: 10 },
    { name: "Liam Gianle", com: 10 }, { name: "Mateo Somovilla", com: 10 },
    { name: "Nico Ruegg", com: 10 }, { name: "Toto Tasistro", com: 10 },
    { name: "Valen de Santo", com: 10 }, { name: "Zava", com: 10 },
    { name: "Zurdo", com: 10 }
  ],
  viernes: [
    { name: "Cata Alonso", com: 10 }, { name: "Emma Spicia", com: 10 },
    { name: "Mati Catella", com: 10 }, { name: "Mati Ocampo", com: 10 },
    { name: "Santi Barbieri", com: 10 }, { name: "Charo Hormachea", com: 10 },
    { name: "Delfi Pugliese", com: 10 }, { name: "Feli Barbieri", com: 10 },
    { name: "Jere Sánchez", com: 10 }, { name: "Male Valdez", com: 10 },
    { name: "Mate Vasquenz", com: 10 }, { name: "Nacho Lupacchini", com: 10 },
    { name: "Santi Ríos", com: 10 }, { name: "Vicky Belloto", com: 10 },
    { name: "Mori Carfachis", com: 10 }, { name: "Mati Reina", com: 10 },
    { name: "Pili Burati", com: 10 }, { name: "Maga Bian", com: 10 },
    { name: "Jazmín Rebello", com: 10 }, { name: "Jose Fernández", com: 10 },
    { name: "Sophie Mayer", com: 10 }, { name: "Renata Giordano", com: 10 },
    { name: "Mora Mauro", com: 10 }, { name: "Cami Bellisimo", com: 10 },
    { name: "Joaquín Gassman", com: 10 }, { name: "Uma Streich", com: 10 },
    { name: "Juana Moreno", com: 10 }, { name: "Delfi Bujan", com: 10 },
    { name: "Mate Morrone", com: 10 }, { name: "Beni Silva", com: 10 }
  ],
  master: [
    { name: "Agus Aggi", com: 10 }, { name: "Juli Vicino", com: 10 },
    { name: "Mar Barrucci", com: 10 }, { name: "Vicky Loschi", com: 10 },
    { name: "Vicky Otero", com: 10 }, { name: "Tato Rossi", com: 10 },
    { name: "Marcos Müller", com: 10 }, { name: "Joaco Alcetegaray", com: 10 },
    { name: "Feli Dieguez", com: 10 }, { name: "Agustín Pusi", com: 10 }
  ]
};

const EVENTS = [
  {
    id: "SAB-001", cycle: "sabado", date: "2026-03-07",
    vendorSales: [
      { vendedor: "Jose Calvo",       mesas: 4, montoMesas: 1000000, montoCombos: 200000, clientes: 30, cobrado: true },
      { vendedor: "Juli Radicula",    mesas: 3, montoMesas: 800000,  montoCombos: 150000, clientes: 24, cobrado: true },
      { vendedor: "Martu Beisel",     mesas: 4, montoMesas: 900000,  montoCombos: 200000, clientes: 28, cobrado: true },
      { vendedor: "Martupe",          mesas: 2, montoMesas: 600000,  montoCombos: 150000, clientes: 19, cobrado: false },
      { vendedor: "Tute Merlo",       mesas: 3, montoMesas: 750000,  montoCombos: 150000, clientes: 23, cobrado: true },
      { vendedor: "Fiore Scarlata",   mesas: 2, montoMesas: 550000,  montoCombos: 100000, clientes: 16, cobrado: true },
      { vendedor: "Fede Guelman",     mesas: 4, montoMesas: 950000,  montoCombos: 200000, clientes: 29, cobrado: true },
      { vendedor: "Juli Sánchez Parra",mesas:3, montoMesas: 700000,  montoCombos: 150000, clientes: 21, cobrado: false }
    ]
  },
  {
    id: "SAB-002", cycle: "sabado", date: "2026-03-14",
    vendorSales: [
      { vendedor: "Palo Pinson",      mesas: 3, montoMesas: 800000,  montoCombos: 150000, clientes: 24, cobrado: true },
      { vendedor: "Valen Vázquez",    mesas: 4, montoMesas: 1050000, montoCombos: 200000, clientes: 31, cobrado: true },
      { vendedor: "Cata Pereyra",     mesas: 2, montoMesas: 580000,  montoCombos: 120000, clientes: 18, cobrado: true },
      { vendedor: "Juli Mansilla",    mesas: 2, montoMesas: 550000,  montoCombos: 100000, clientes: 16, cobrado: true },
      { vendedor: "Liam Gianle",      mesas: 4, montoMesas: 900000,  montoCombos: 200000, clientes: 27, cobrado: true },
      { vendedor: "Mateo Somovilla",  mesas: 3, montoMesas: 750000,  montoCombos: 150000, clientes: 22, cobrado: false },
      { vendedor: "Zava",             mesas: 4, montoMesas: 1100000, montoCombos: 200000, clientes: 33, cobrado: true }
    ]
  },
  {
    id: "VIE-001", cycle: "viernes", date: "2026-03-06",
    vendorSales: [
      { vendedor: "Cata Alonso",      mesas: 3, montoMesas: 700000,  montoCombos: 150000, clientes: 21, cobrado: true },
      { vendedor: "Emma Spicia",      mesas: 3, montoMesas: 750000,  montoCombos: 150000, clientes: 23, cobrado: true },
      { vendedor: "Mati Catella",     mesas: 2, montoMesas: 550000,  montoCombos: 100000, clientes: 16, cobrado: false },
      { vendedor: "Charo Hormachea",  mesas: 2, montoMesas: 500000,  montoCombos: 100000, clientes: 15, cobrado: true },
      { vendedor: "Delfi Pugliese",   mesas: 2, montoMesas: 620000,  montoCombos: 130000, clientes: 19, cobrado: true },
      { vendedor: "Jere Sánchez",     mesas: 3, montoMesas: 680000,  montoCombos: 140000, clientes: 20, cobrado: true },
      { vendedor: "Mati Reina",       mesas: 1, montoMesas: 340000,  montoCombos:  60000, clientes: 10, cobrado: true }
    ]
  },
  {
    id: "MAS-001", cycle: "master", date: "2026-03-08",
    vendorSales: [
      { vendedor: "Agus Aggi",        mesas: 4, montoMesas: 1000000, montoCombos: 200000, clientes: 30, cobrado: true },
      { vendedor: "Juli Vicino",      mesas: 5, montoMesas: 1150000, montoCombos: 250000, clientes: 35, cobrado: true },
      { vendedor: "Mar Barrucci",     mesas: 3, montoMesas: 750000,  montoCombos: 150000, clientes: 23, cobrado: true },
      { vendedor: "Vicky Loschi",     mesas: 4, montoMesas: 900000,  montoCombos: 200000, clientes: 27, cobrado: false },
      { vendedor: "Tato Rossi",       mesas: 3, montoMesas: 800000,  montoCombos: 150000, clientes: 24, cobrado: true },
      { vendedor: "Marcos Müller",    mesas: 4, montoMesas: 950000,  montoCombos: 200000, clientes: 29, cobrado: true },
      { vendedor: "Feli Dieguez",     mesas: 3, montoMesas: 700000,  montoCombos: 150000, clientes: 21, cobrado: true }
    ]
  }
];

// helper — monto total de una venta
const montoTotal = (s) => (s.montoMesas || 0) + (s.montoCombos || 0);

// BASE CLIENTES — estructura FECHA | EVENTO | SECTOR | TITULAR | PUBLICA | IMPORTE
const BASE_CLIENTES = [
  { fecha:"2026-03-07", evento:"SAB-001", sector:"A",      titular:"Rodrigo Fernández", publica:"Jose Calvo",         importe:320000, ciclo:"sabado" },
  { fecha:"2026-03-07", evento:"SAB-001", sector:"B",      titular:"Valentina Cruz",    publica:"Jose Calvo",         importe:280000, ciclo:"sabado" },
  { fecha:"2026-03-07", evento:"SAB-001", sector:"COMBOS", titular:"Tomás Arrieta",     publica:"Fede Guelman",       importe:200000, ciclo:"sabado" },
  { fecha:"2026-03-07", evento:"SAB-001", sector:"C",      titular:"Camila Ríos",       publica:"Juli Sánchez Parra", importe:290000, ciclo:"sabado" },
  { fecha:"2026-03-07", evento:"SAB-001", sector:"COMBOS", titular:"Lucas Méndez",      publica:"Martu Beisel",       importe:200000, ciclo:"sabado" },
  { fecha:"2026-03-14", evento:"SAB-002", sector:"A",      titular:"Rodrigo Fernández", publica:"Zava",               importe:340000, ciclo:"sabado" },
  { fecha:"2026-03-14", evento:"SAB-002", sector:"B",      titular:"Sofía Gagliardi",   publica:"Valen Vázquez",      importe:380000, ciclo:"sabado" },
  { fecha:"2026-03-14", evento:"SAB-002", sector:"COMBOS", titular:"Tomás Arrieta",     publica:"Liam Gianle",        importe:200000, ciclo:"sabado" },
  { fecha:"2026-03-14", evento:"SAB-002", sector:"C",      titular:"Martina López",     publica:"Zava",               importe:290000, ciclo:"sabado" },
  { fecha:"2026-03-06", evento:"VIE-001", sector:"A",      titular:"Agustina Pérez",    publica:"Emma Spicia",        importe:270000, ciclo:"viernes" },
  { fecha:"2026-03-06", evento:"VIE-001", sector:"B",      titular:"Rodrigo Fernández", publica:"Cata Alonso",        importe:295000, ciclo:"viernes" },
  { fecha:"2026-03-06", evento:"VIE-001", sector:"COMBOS", titular:"Nicolás Suárez",    publica:"Jere Sánchez",       importe:140000, ciclo:"viernes" },
  { fecha:"2026-03-06", evento:"VIE-001", sector:"A",      titular:"Valentina Cruz",    publica:"Emma Spicia",        importe:285000, ciclo:"viernes" },
  { fecha:"2026-03-08", evento:"MAS-001", sector:"A",      titular:"Tomás Arrieta",     publica:"Juli Vicino",        importe:420000, ciclo:"master" },
  { fecha:"2026-03-08", evento:"MAS-001", sector:"COMBOS", titular:"Sofía Gagliardi",   publica:"Agus Aggi",          importe:200000, ciclo:"master" },
  { fecha:"2026-03-08", evento:"MAS-001", sector:"B",      titular:"Lucas Méndez",      publica:"Marcos Müller",      importe:360000, ciclo:"master" },
  { fecha:"2026-03-08", evento:"MAS-001", sector:"COMBOS", titular:"Rodrigo Fernández", publica:"Tato Rossi",         importe:150000, ciclo:"master" },
];

const f = (n) => (n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K");
const ff = (n) => "$" + n.toLocaleString("es-AR");
const pct = (n) => n.toFixed(1) + "%";
const bx = (bg, bd) => ({ background: bg, border: "1px solid " + bd, borderRadius: "8px", padding: "16px" });
const pillSt = (active, color) => ({
  padding: "8px 16px", borderRadius: "20px", border: "none",
  background: active ? color : C.s2, color: active ? C.bg : C.tx,
  cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: C.sans, transition: "0.2s"
});

const Stat = ({ label, value }) => (
  <div style={{ ...bx(C.s1, C.bd), textAlign: "center" }}>
    <div style={{ fontSize: "12px", color: C.t2, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{label}</div>
    <div style={{ fontSize: "22px", fontWeight: "700", color: C.tx, fontFamily: C.mono }}>{value}</div>
  </div>
);

const Bar = ({ label, value, max, color, sub }) => (
  <div style={{ marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
      <span style={{ color: C.tx }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ color: C.t2, fontFamily: C.mono }}>{f(value)}</span>
        {sub && <span style={{ color: C.t2, fontSize: 11, marginLeft: 6 }}>{sub}</span>}
      </div>
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
            <th key={i} style={{ padding: "12px", textAlign: "left", color: C.t2, fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} onClick={() => rowClick && rowClick(row)}
            style={{ borderBottom: "1px solid " + C.bd, cursor: rowClick ? "pointer" : "default", transition: "0.2s" }}>
            {row.cells.map((cell, j) => (
              <td key={j} style={{ padding: "12px", color: cell.color || C.tx }}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== TAB CLIENTES =====
const TabClientes = ({ vendors, events }) => {
  const [filtro,       setFiltro]       = useState("todos");
  const [busqueda,     setBusqueda]     = useState("");
  const [titularSel,   setTitularSel]   = useState(null);
  const [publicaSel,   setPublicaSel]   = useState(null);
  const [vista,        setVista]        = useState("titulares"); // titulares | publicas | detalle

  const clientes = filtro === "todos"
    ? BASE_CLIENTES
    : BASE_CLIENTES.filter(c => c.ciclo === filtro);

  // RANKING TITULARES
  const rankingTitulares = () => {
    const map = {};
    clientes.forEach(c => {
      if (!map[c.titular]) map[c.titular] = { nombre: c.titular, importe: 0, eventos: new Set(), publicas: new Set(), ciclos: new Set() };
      map[c.titular].importe += c.importe;
      map[c.titular].eventos.add(c.evento);
      map[c.titular].publicas.add(c.publica);
      map[c.titular].ciclos.add(c.ciclo);
    });
    return Object.values(map)
      .map(t => ({ ...t, eventos: t.eventos.size, publicas: t.publicas.size, ciclos: Array.from(t.ciclos) }))
      .sort((a, b) => b.importe - a.importe);
  };

  // RANKING PUBLICAS
  const rankingPublicas = () => {
    const map = {};
    clientes.forEach(c => {
      if (!map[c.publica]) map[c.publica] = { nombre: c.publica, importe: 0, titulares: new Set(), eventos: new Set(), ciclo: c.ciclo };
      map[c.publica].importe += c.importe;
      map[c.publica].titulares.add(c.titular);
      map[c.publica].eventos.add(c.evento);
    });
    return Object.values(map)
      .map(p => ({ ...p, titulares: p.titulares.size, eventos: p.eventos.size }))
      .sort((a, b) => b.importe - a.importe);
  };

  const titulares = rankingTitulares();
  const publicas  = rankingPublicas();
  const maxTit    = titulares[0]?.importe || 1;
  const maxPub    = publicas[0]?.importe  || 1;

  // Historial de un titular
  const historialTitular = (nombre) =>
    BASE_CLIENTES.filter(c => c.titular === nombre).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Titulares de una pública
  const titularesDePub = (nombre) =>
    BASE_CLIENTES.filter(c => c.publica === nombre).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const titFiltrados = titulares.filter(t =>
    busqueda === "" || t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const pubFiltradas = publicas.filter(p =>
    busqueda === "" || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      {/* Filtros ciclo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["todos", "sabado", "viernes", "master"].map(fi => (
          <button key={fi} onClick={() => setFiltro(fi)} style={pillSt(filtro === fi, CICLOS.find(c => c.id === fi)?.color || C.b)}>
            {fi === "todos" ? "Todos" : CICLOS.find(c => c.id === fi)?.label}
          </button>
        ))}
        <input
          type="text" placeholder="Buscar..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 20, border: "1px solid " + C.bd,
            background: C.s2, color: C.tx, fontFamily: C.mono, fontSize: 12, outline: "none", width: 180 }}
        />
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <Stat label="Titulares únicos"  value={new Set(clientes.map(c => c.titular)).size} />
        <Stat label="Públicas activas"  value={new Set(clientes.map(c => c.publica)).size} />
        <Stat label="Total facturado"   value={"$" + f(clientes.reduce((s, c) => s + c.importe, 0))} />
        <Stat label="Ticket promedio"   value={"$" + f(clientes.length > 0 ? clientes.reduce((s, c) => s + c.importe, 0) / clientes.length : 0)} />
        <Stat label="Reservas totales"  value={clientes.length} />
        <Stat label="Titulares recurrentes" value={titulares.filter(t => t.eventos > 1).length} />
      </div>

      {/* Sub-vista */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { id: "titulares", label: "Ranking Titulares" },
          { id: "publicas",  label: "Ranking Públicas" },
          { id: "detalle",   label: "Detalle" },
        ].map(v => (
          <button key={v.id} onClick={() => { setVista(v.id); setTitularSel(null); setPublicaSel(null); }}
            style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontFamily: C.mono, cursor: "pointer", border: "none",
              background: vista === v.id ? C.p + "22" : C.s2, color: vista === v.id ? C.p : C.t2,
              borderBottom: vista === v.id ? "2px solid " + C.p : "2px solid transparent" }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* RANKING TITULARES */}
      {vista === "titulares" && (
        <div>
          <div style={bx(C.s1, C.bd)}>
            <div style={{ fontSize: 12, color: C.t2, fontFamily: C.mono, marginBottom: 16, textTransform: "uppercase" }}>
              Titulares — ordenados por gasto total
            </div>
            {titFiltrados.map((t, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid " + C.bd, cursor: "pointer" }}
                onClick={() => { setTitularSel(t.nombre); setVista("detalle"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: i < 3 ? C.y : C.t2, fontFamily: C.mono, minWidth: 24 }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span style={{ fontSize: 14, color: C.tx, fontWeight: 600 }}>{t.nombre}</span>
                    {t.eventos > 1 && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: C.g + "22", color: C.g, fontFamily: C.mono }}>
                        RECURRENTE
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontFamily: C.mono, color: C.g, fontWeight: 700 }}>{ff(t.importe)}</div>
                    <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono }}>{t.eventos} evento{t.eventos > 1 ? "s" : ""} · {t.publicas} pública{t.publicas > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div style={{ height: 5, background: C.s3, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (t.importe / maxTit * 100) + "%", background: C.g, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {t.ciclos.map(ci => (
                    <span key={ci} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4,
                      background: (CICLOS.find(c => c.id === ci)?.color || C.b) + "22",
                      color: CICLOS.find(c => c.id === ci)?.color || C.b, fontFamily: C.mono }}>
                      {CICLOS.find(c => c.id === ci)?.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RANKING PUBLICAS */}
      {vista === "publicas" && (
        <div style={bx(C.s1, C.bd)}>
          <div style={{ fontSize: 12, color: C.t2, fontFamily: C.mono, marginBottom: 16, textTransform: "uppercase" }}>
            Públicas — por revenue generado
          </div>
          {pubFiltradas.map((p, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid " + C.bd, cursor: "pointer" }}
              onClick={() => { setPublicaSel(p.nombre); setVista("detalle"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono, minWidth: 24 }}>#{i + 1}</span>
                  <span style={{ fontSize: 13, color: C.tx, fontWeight: 600 }}>{p.nombre}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontFamily: C.mono, color: C.y, fontWeight: 700 }}>{ff(p.importe)}</div>
                  <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono }}>{p.titulares} titulares · {p.eventos} evento{p.eventos > 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ height: 5, background: C.s3, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: (p.importe / maxPub * 100) + "%", background: C.y, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETALLE */}
      {vista === "detalle" && (
        <div>
          {/* Selector titular o publica */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono, marginBottom: 4, textTransform: "uppercase" }}>Titular</div>
              <select value={titularSel || ""} onChange={e => { setTitularSel(e.target.value || null); setPublicaSel(null); }}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid " + C.bd,
                  background: C.s2, color: C.tx, fontFamily: C.mono, fontSize: 12, outline: "none", cursor: "pointer" }}>
                <option value="">— Ver por titular —</option>
                {titulares.map(t => <option key={t.nombre} value={t.nombre}>{t.nombre}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono, marginBottom: 4, textTransform: "uppercase" }}>Pública</div>
              <select value={publicaSel || ""} onChange={e => { setPublicaSel(e.target.value || null); setTitularSel(null); }}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid " + C.bd,
                  background: C.s2, color: C.tx, fontFamily: C.mono, fontSize: 12, outline: "none", cursor: "pointer" }}>
                <option value="">— Ver por pública —</option>
                {publicas.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Historial titular */}
          {titularSel && (() => {
            const hist = historialTitular(titularSel);
            const totalGasto = hist.reduce((s, c) => s + c.importe, 0);
            const pubsUsadas = [...new Set(hist.map(c => c.publica))];
            return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
                  <Stat label="Total gastado" value={"$" + f(totalGasto)} />
                  <Stat label="Reservas" value={hist.length} />
                  <Stat label="Públicas distintas" value={pubsUsadas.length} />
                  <Stat label="Ticket promedio" value={"$" + f(totalGasto / hist.length)} />
                </div>
                <div style={bx(C.s1, C.bd)}>
                  <div style={{ fontSize: 12, color: C.p, fontFamily: C.mono, marginBottom: 12, textTransform: "uppercase" }}>
                    Historial — {titularSel}
                  </div>
                  <Table
                    headers={["Fecha", "Evento", "Pública", "Ciclo", "Importe"]}
                    rows={hist.map(c => ({
                      cells: [
                        { value: c.fecha },
                        { value: c.evento },
                        { value: c.publica, color: C.y },
                        { value: CICLOS.find(x => x.id === c.ciclo)?.label, color: CICLOS.find(x => x.id === c.ciclo)?.color },
                        { value: ff(c.importe), color: C.g }
                      ]
                    }))}
                  />
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginBottom: 8, textTransform: "uppercase" }}>Públicas que usó</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {pubsUsadas.map(p => (
                        <span key={p} style={{ padding: "4px 10px", borderRadius: 6, background: C.y + "22", color: C.y, fontFamily: C.mono, fontSize: 12 }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Titulares de una pública */}
          {publicaSel && (() => {
            const hist = titularesDePub(publicaSel);
            const totalRev = hist.reduce((s, c) => s + c.importe, 0);
            const titsUnicos = [...new Set(hist.map(c => c.titular))];
            return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
                  <Stat label="Revenue total" value={"$" + f(totalRev)} />
                  <Stat label="Titulares" value={titsUnicos.length} />
                  <Stat label="Reservas" value={hist.length} />
                  <Stat label="Ticket promedio" value={"$" + f(totalRev / hist.length)} />
                </div>
                <div style={bx(C.s1, C.bd)}>
                  <div style={{ fontSize: 12, color: C.y, fontFamily: C.mono, marginBottom: 12, textTransform: "uppercase" }}>
                    Clientes de {publicaSel}
                  </div>
                  <Table
                    headers={["Fecha", "Titular", "Ciclo", "Importe"]}
                    rows={hist.map(c => ({
                      cells: [
                        { value: c.fecha },
                        { value: c.titular, color: C.p },
                        { value: CICLOS.find(x => x.id === c.ciclo)?.label, color: CICLOS.find(x => x.id === c.ciclo)?.color },
                        { value: ff(c.importe), color: C.g }
                      ]
                    }))}
                  />
                </div>
              </div>
            );
          })()}

          {!titularSel && !publicaSel && (
            <div style={bx(C.s1, C.bd)}>
              <div style={{ fontSize: 14, color: C.t2, textAlign: "center", padding: 32 }}>
                Seleccioná un titular o una pública para ver el detalle
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
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

  const filterVendorSales = (vendorName) =>
    events.flatMap(ev => ev.vendorSales.filter(vs => vs.vendedor === vendorName)
      .map(vs => ({ ...vs, eventId: ev.id, cycle: ev.cycle, date: ev.date })));

  const getAllSales = () =>
    events.flatMap(ev => ev.vendorSales.map(vs => ({ ...vs, eventId: ev.id, cycle: ev.cycle, date: ev.date })));

  const getFilteredAllSales = () => {
    let sales = getAllSales();
    if (filter !== "todos") sales = sales.filter(s => s.cycle === filter);
    return sales;
  };

  const getFilteredCommissions = () => {
    let sales = getAllSales();
    if (commissionFilter === "cobrado") sales = sales.filter(s => s.cobrado);
    else if (commissionFilter === "pendiente") sales = sales.filter(s => !s.cobrado);
    return sales;
  };

  const calculateRanking = () => {
    const salesMap = {}, mesasMontoMap = {}, combosMontoMap = {},
          clientesMap = {}, mesasMap = {}, cobradoMap = {}, totalMap = {};
    getFilteredAllSales().forEach(sale => {
      const v = sale.vendedor;
      if (!salesMap[v]) { salesMap[v]=0; mesasMontoMap[v]=0; combosMontoMap[v]=0; clientesMap[v]=0; mesasMap[v]=0; cobradoMap[v]=0; totalMap[v]=0; }
      salesMap[v]      += montoTotal(sale);
      mesasMontoMap[v] += (sale.montoMesas  || 0);
      combosMontoMap[v]+= (sale.montoCombos || 0);
      clientesMap[v]   += sale.clientes;
      mesasMap[v]      += sale.mesas;
      totalMap[v]      += 1;
      if (sale.cobrado) cobradoMap[v] += 1;
    });
    return Object.keys(salesMap).map(name => ({
      name,
      monto:       salesMap[name],
      montoMesas:  mesasMontoMap[name],
      montoCombos: combosMontoMap[name],
      clientes:    clientesMap[name],
      mesas:       mesasMap[name],
      cobrado:     cobradoMap[name],
      total:       totalMap[name],
      cycles:      getVendorCycles(name),
      com:         10
    })).sort((a, b) => b.monto - a.monto);
  };

  const getCycleStats = (cycle) => {
    const sales = events.filter(e => e.cycle === cycle).flatMap(e => e.vendorSales);
    const vendorStats = {};
    sales.forEach(s => {
      if (!vendorStats[s.vendedor]) vendorStats[s.vendedor] = { monto: 0, montoMesas: 0, montoCombos: 0, mesas: 0, clientes: 0 };
      vendorStats[s.vendedor].monto      += montoTotal(s);
      vendorStats[s.vendedor].montoMesas += (s.montoMesas  || 0);
      vendorStats[s.vendedor].montoCombos+= (s.montoCombos || 0);
      vendorStats[s.vendedor].mesas      += s.mesas;
      vendorStats[s.vendedor].clientes   += s.clientes;
    });
    const vendorCount = vendors[cycle] ? vendors[cycle].length : 1;
    const totalMonto  = sales.reduce((a, s) => a + montoTotal(s), 0);
    return {
      mesas:       sales.reduce((a, s) => a + s.mesas, 0),
      monto:       totalMonto,
      montoMesas:  sales.reduce((a, s) => a + (s.montoMesas  || 0), 0),
      montoCombos: sales.reduce((a, s) => a + (s.montoCombos || 0), 0),
      promedio:    vendorCount > 0 ? totalMonto / vendorCount : 0,
      vendorStats
    };
  };

  const addVendor = () => {
    if (!newVendorName.trim() || newVendorCycles.length === 0) return;
    const newVendors = { ...vendors };
    const vendorObj = { name: newVendorName, com: newVendorCom };
    newVendorCycles.forEach(cyc => {
      if (!newVendors[cyc].find(v => v.name === newVendorName)) newVendors[cyc].push(vendorObj);
    });
    setVendors(newVendors);
    setNewVendorName(""); setNewVendorCom(10); setNewVendorCycles([]);
  };

  const removeVendor = (name) => {
    const newVendors = { ...vendors };
    Object.keys(newVendors).forEach(cyc => { newVendors[cyc] = newVendors[cyc].filter(v => v.name !== name); });
    setVendors(newVendors);
  };

  const toggleCycle = (cycle) => {
    if (newVendorCycles.includes(cycle)) setNewVendorCycles(newVendorCycles.filter(c => c !== cycle));
    else setNewVendorCycles([...newVendorCycles, cycle]);
  };

  const markComissionPaid = (vendedor, eventId) => {
    setEvents(events.map(ev => ({
      ...ev,
      vendorSales: ev.vendorSales.map(vs =>
        vs.vendedor === vendedor && ev.id === eventId ? { ...vs, cobrado: true } : vs
      )
    })));
  };

  const ranking = calculateRanking();
  const allVendors = getAllVendorNames();

  const TABS = [
    { label: "Ranking", id: 0 },
    { label: "Por Ciclo", id: 1 },
    { label: "Comisiones", id: 2 },
    { label: "Detalle", id: 3 },
    { label: "Comparar", id: 4 },
    { label: "Clientes", id: 5 },
    { label: "Admin", id: 6 }
  ];

  return (
    <div style={{ background: C.bg, color: C.tx, fontFamily: C.sans, padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px", letterSpacing: "-0.5px" }}>Roca Bruja</h1>
        <p style={{ color: C.t2, marginBottom: "24px", fontSize: "14px" }}>Performance Dashboard - Ciclos de Venta</p>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px", paddingBottom: "8px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none", fontFamily: C.sans,
              background: tab === t.id ? (t.id === 5 ? C.p : C.g) : C.s2,
              color: tab === t.id ? C.bg : C.tx,
              cursor: "pointer", fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", transition: "0.2s"
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 0 — RANKING */}
        {tab === 0 && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["todos", "sabado", "viernes", "master"].map(fi => (
                <button key={fi} onClick={() => setFilter(fi)} style={pillSt(filter === fi, CICLOS.find(c => c.id === fi)?.color || C.b)}>
                  {fi === "todos" ? "Todos" : CICLOS.find(c => c.id === fi)?.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <Stat label="Total Vendedores" value={ranking.length} />
              <Stat label="Total Mesas Vendidas" value={ranking.reduce((a, r) => a + r.mesas, 0)} />
              <Stat label="Total Facturado" value={"$" + f(ranking.reduce((a, r) => a + r.monto, 0))} />
              <Stat label="Comisiones Totales (10%)" value={"$" + f(ranking.reduce((a, r) => a + (r.monto * 0.1), 0))} />
            </div>
            <div style={bx(C.s1, C.bd)}>
              <Table
                headers={["Pos", "Nombre", "Ciclo(s)", "Mesas", "$ Mesas", "$ Combos", "Total", "Comisión 10%", "% Cobrado"]}
                rows={ranking.map((r, i) => {
                  const medal = i === 0 ? "#1 " : i === 1 ? "#2 " : i === 2 ? "#3 " : "";
                  const color = i === 0 ? C.y : i === 1 ? C.tx : i === 2 ? C.o : C.tx;
                  const cobPct = r.total > 0 ? (r.cobrado / r.total * 100) : 0;
                  return {
                    cells: [
                      { value: medal + (i + 1), color },
                      { value: r.name, color },
                      { value: r.cycles.map(c => CICLOS.find(x => x.id === c)?.label).join(", ") },
                      { value: r.mesas },
                      { value: "$" + f(r.montoMesas),  color: C.g },
                      { value: "$" + f(r.montoCombos), color: C.b },
                      { value: "$" + f(r.monto) },
                      { value: "$" + f(r.monto * 0.1), color: C.y },
                      { value: pct(cobPct) }
                    ]
                  };
                })}
                rowClick={(row) => { setSelectedVendor(row.cells[1].value); setTab(3); }}
              />
            </div>
          </div>
        )}

        {/* TAB 1 — POR CICLO */}
        {tab === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {CICLOS.map(ciclo => {
              const stats = getCycleStats(ciclo.id);
              const topVendors = Object.entries(stats.vendorStats).sort((a, b) => b[1].monto - a[1].monto).slice(0, 5);
              return (
                <div key={ciclo.id} style={bx(C.s1, C.bd)}>
                  <h3 style={{ margin: "0 0 16px 0", color: ciclo.color, fontSize: "18px" }}>{ciclo.label}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <Stat label="Mesas" value={stats.mesas} />
                    <Stat label="Monto Total" value={"$" + f(stats.monto)} />
                  </div>
                  <Stat label="Promedio por Vendor" value={"$" + f(stats.promedio)} />
                  <div style={{ marginTop: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: C.t2, textTransform: "uppercase" }}>Top 5</h4>
                    {topVendors.map(([name, stat]) => (
                      <Bar key={name} label={name} value={stat.monto} max={topVendors[0][1].monto} color={ciclo.color} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2 — COMISIONES */}
        {tab === 2 && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["todos", "cobrado", "pendiente"].map(fi => (
                <button key={fi} onClick={() => setCommissionFilter(fi)} style={pillSt(commissionFilter === fi, fi === "cobrado" ? C.g : fi === "pendiente" ? C.o : C.b)}>
                  {fi === "todos" ? "Todos" : fi === "cobrado" ? "Pagadas" : "Pendientes"}
                </button>
              ))}
            </div>
            {(() => {
              const commissions = getFilteredCommissions();
              const total = commissions.reduce((a, c) => a + (montoTotal(c) * 0.1), 0);
              const paid  = commissions.filter(c => c.cobrado).reduce((a, c) => a + (montoTotal(c) * 0.1), 0);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <Stat label="Total Comisiones" value={"$" + f(total)} />
                  <Stat label="Total Pagadas"     value={"$" + f(paid)} />
                  <Stat label="Total Pendientes"  value={"$" + f(total - paid)} />
                </div>
              );
            })()}
            <div style={bx(C.s1, C.bd)}>
              <Table
                headers={["Vendedor", "Evento", "Fecha", "$ Mesas", "$ Combos", "Total", "Comisión 10%", "Estado"]}
                rows={getFilteredCommissions().map(comm => {
                  const comAmount = montoTotal(comm) * 0.1;
                  return {
                    cells: [
                      { value: comm.vendedor },
                      { value: comm.eventId },
                      { value: comm.date },
                      { value: "$" + f(comm.montoMesas  || 0), color: C.g },
                      { value: "$" + f(comm.montoCombos || 0), color: C.b },
                      { value: "$" + f(montoTotal(comm)) },
                      { value: "$" + f(comAmount), color: C.y },
                      { value: comm.cobrado ? "Pagada" : "Pendiente", color: comm.cobrado ? C.g : C.o }
                    ]
                  };
                })}
              />
            </div>
          </div>
        )}

        {/* TAB 3 — DETALLE */}
        {tab === 3 && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: C.t2 }}>Seleccionar Vendedor</label>
              <select value={selectedVendor || ""} onChange={(e) => setSelectedVendor(e.target.value || null)}
                style={{ width: "100%", maxWidth: "400px", padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd,
                  background: C.s2, color: C.tx, fontFamily: C.sans, fontSize: "14px", cursor: "pointer" }}>
                <option value="">-- Seleccionar --</option>
                {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {selectedVendor && (() => {
              const vendorSales = filterVendorSales(selectedVendor);
              const totalMonto   = vendorSales.reduce((a, s) => a + montoTotal(s), 0);
              const totalMesas_m = vendorSales.reduce((a, s) => a + (s.montoMesas  || 0), 0);
              const totalCombos_m= vendorSales.reduce((a, s) => a + (s.montoCombos || 0), 0);
              const totalMesas  = vendorSales.reduce((a, s) => a + s.mesas, 0);
              const totalClts   = vendorSales.reduce((a, s) => a + s.clientes, 0);
              const com         = getVendorComission(selectedVendor);
              const cycles      = getVendorCycles(selectedVendor);
              const cycleStats  = {};
              CICLOS.forEach(c => { cycleStats[c.id] = getCycleStats(c.id); });
              // Clientes de este vendedor
              const clientesVendedor = BASE_CLIENTES.filter(c => c.publica === selectedVendor);
              return (
                <div>
                  <div style={bx(C.s1, C.bd)}>
                    <h3 style={{ margin: "0 0 16px 0" }}>{selectedVendor}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                      <Stat label="Ciclo(s)" value={cycles.map(c => CICLOS.find(x => x.id === c)?.label).join(", ")} />
                      <Stat label="Comisión" value="10%" />
                      <Stat label="Total Mesas" value={totalMesas} />
                      <Stat label="$ Mesas" value={"$" + f(totalMesas_m)} />
                      <Stat label="$ Combos" value={"$" + f(totalCombos_m)} />
                      <Stat label="Total Facturado" value={"$" + f(totalMonto)} />
                      <Stat label="Comisión Total" value={"$" + f(totalMonto * 0.1)} />
                      <Stat label="Clientes en base" value={clientesVendedor.length} />
                    </div>
                  </div>
                  <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
                    <h4 style={{ margin: "0 0 16px 0" }}>Historial de Eventos</h4>
                    <Table
                      headers={["Fecha", "Ciclo", "Mesas", "$ Mesas", "$ Combos", "Total", "Comisión", "Estado"]}
                      rows={vendorSales.map(sale => ({
                        cells: [
                          { value: sale.date },
                          { value: CICLOS.find(c => c.id === sale.cycle)?.label },
                          { value: sale.mesas },
                          { value: "$" + f(sale.montoMesas  || 0), color: C.g },
                          { value: "$" + f(sale.montoCombos || 0), color: C.b },
                          { value: "$" + f(montoTotal(sale)) },
                          { value: "$" + f(montoTotal(sale) * 0.1), color: C.y },
                          { value: sale.cobrado ? "Pagada" : "Pendiente", color: sale.cobrado ? C.g : C.o }
                        ]
                      }))}
                    />
                  </div>
                  {clientesVendedor.length > 0 && (
                    <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
                      <h4 style={{ margin: "0 0 16px 0" }}>Titulares de su pública</h4>
                      <Table
                        headers={["Fecha", "Titular", "Ciclo", "Importe"]}
                        rows={clientesVendedor.map(c => ({
                          cells: [
                            { value: c.fecha },
                            { value: c.titular, color: C.p },
                            { value: CICLOS.find(x => x.id === c.ciclo)?.label, color: CICLOS.find(x => x.id === c.ciclo)?.color },
                            { value: ff(c.importe), color: C.g }
                          ]
                        }))}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4 — COMPARAR */}
        {tab === 4 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {[{ label: "Vendedor 1", val: vendor1, set: setVendor1 }, { label: "Vendedor 2", val: vendor2, set: setVendor2 }].map((v, i) => (
                <div key={i}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: C.t2 }}>{v.label}</label>
                  <select value={v.val || ""} onChange={(e) => v.set(e.target.value || null)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd,
                      background: C.s2, color: C.tx, fontFamily: C.sans, fontSize: "14px", cursor: "pointer" }}>
                    <option value="">-- Seleccionar --</option>
                    {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {vendor1 && vendor2 && (() => {
              const s1 = filterVendorSales(vendor1); const s2 = filterVendorSales(vendor2);
              const mo1 = s1.reduce((a, s) => a + montoTotal(s), 0); const mo2 = s2.reduce((a, s) => a + montoTotal(s), 0);
              const com1 = getVendorComission(vendor1); const com2 = getVendorComission(vendor2);
              return (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    {[{ name: vendor1, sales: s1, monto: mo1, com: 10 }, { name: vendor2, sales: s2, monto: mo2, com: 10 }].map((v, i) => (
                      <div key={i} style={bx(C.s1, C.bd)}>
                        <h3 style={{ margin: "0 0 16px 0" }}>{v.name}</h3>
                        <Stat label="Total Mesas"   value={v.sales.reduce((a, s) => a + s.mesas, 0)} />
                        <Stat label="$ Mesas"        value={"$" + f(v.sales.reduce((a,s)=>a+(s.montoMesas||0),0))} />
                        <Stat label="$ Combos"       value={"$" + f(v.sales.reduce((a,s)=>a+(s.montoCombos||0),0))} />
                        <Stat label="Total Facturado" value={"$" + f(v.monto)} />
                        <Stat label="Comisión (10%)" value={"$" + f(v.monto * 0.1)} />
                      </div>
                    ))}
                  </div>
                  <div style={bx(C.s1, C.bd)}>
                    <h4 style={{ margin: "0 0 16px 0" }}>Comparación por Evento</h4>
                    <Table
                      headers={["Fecha", "Ciclo", vendor1, vendor2, "Ganador"]}
                      rows={events.map(ev => {
                        const e1 = ev.vendorSales.find(vs => vs.vendedor === vendor1);
                        const e2 = ev.vendorSales.find(vs => vs.vendedor === vendor2);
                        if (!e1 || !e2) return null;
                        const t1 = montoTotal(e1); const t2 = montoTotal(e2);
                        const winner = t1 > t2 ? vendor1 : t2 > t1 ? vendor2 : "Empate";
                        return { cells: [
                          { value: ev.date },
                          { value: CICLOS.find(c => c.id === ev.cycle)?.label },
                          { value: "$" + f(t1) },
                          { value: "$" + f(t2) },
                          { value: winner, color: winner === vendor1 ? C.g : winner === vendor2 ? C.b : C.t2 }
                        ]};
                      }).filter(Boolean)}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5 — CLIENTES */}
        {tab === 5 && <TabClientes vendors={vendors} events={events} />}

        {/* TAB 6 — ADMIN */}
        {tab === 6 && (
          <div>
            <div style={bx(C.s1, C.bd)}>
              <h3 style={{ margin: "0 0 16px 0" }}>Agregar Nuevo Vendedor</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                <input type="text" placeholder="Nombre" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd, background: C.s2, color: C.tx, fontFamily: C.sans }} />
                <input type="number" placeholder="Comisión %" value={newVendorCom} onChange={(e) => setNewVendorCom(parseInt(e.target.value))}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid " + C.bd, background: C.s2, color: C.tx, fontFamily: C.sans }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: C.t2, textTransform: "uppercase" }}>Ciclos</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {CICLOS.map(c => (
                    <button key={c.id} onClick={() => toggleCycle(c.id)} style={pillSt(newVendorCycles.includes(c.id), c.color)}>{c.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={addVendor} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: C.g, color: C.bg, cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: C.sans }}>
                Agregar
              </button>
            </div>
            <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Gestionar Vendedores</h3>
              <Table
                headers={["Nombre", "Comisión", "Ciclos", "Acción"]}
                rows={allVendors.map(name => ({
                  cells: [
                    { value: name },
                    { value: getVendorComission(name) + "%" },
                    { value: getVendorCycles(name).map(c => CICLOS.find(x => x.id === c)?.label).join(", ") },
                    { value: <button onClick={() => removeVendor(name)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: C.r, color: C.w, cursor: "pointer", fontWeight: "600", fontSize: "12px", fontFamily: C.sans }}>Eliminar</button> }
                  ]
                }))}
              />
            </div>
            <div style={{ marginTop: "20px", ...bx(C.s1, C.bd) }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Marcar Comisiones como Pagadas</h3>
              <Table
                headers={["Vendedor", "Evento", "Fecha", "$ Mesas", "$ Combos", "Comisión 10%", "Estado", "Acción"]}
                rows={getAllSales().filter(s => !s.cobrado).map(sale => {
                  const comAmount = montoTotal(sale) * 0.1;
                  return { cells: [
                    { value: sale.vendedor },
                    { value: sale.eventId },
                    { value: sale.date },
                    { value: "$" + f(sale.montoMesas  || 0), color: C.g },
                    { value: "$" + f(sale.montoCombos || 0), color: C.b },
                    { value: "$" + f(comAmount), color: C.y },
                    { value: "Pendiente", color: C.o },
                    { value: <button onClick={() => markComissionPaid(sale.vendedor, sale.eventId)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: C.g, color: C.bg, cursor: "pointer", fontWeight: "600", fontSize: "12px", fontFamily: C.sans }}>Pagar</button> }
                  ]};
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
