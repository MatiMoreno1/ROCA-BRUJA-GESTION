import { useState, useEffect } from "react";

/* ================================================================
   ROCA BRUJA — EVENTO EN VIVO  v1.0
   Dashboard para socios — seguimiento real-time de la noche
   ================================================================ */

const C = {
  bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
  tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
  g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
  b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
  mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
};

/* ── Seed data basado en S\u00e1bado 13/12 ── */
const SEED_MESAS = [
  { sector:"A", titular:"Rama Vega", publica:"Cami Varni", importe:750000, abonado:225000, consumo70:525000, consumo50:375000, aclaracion:"" },
  { sector:"B", titular:"Santi Miceli", publica:"JL", importe:1625000, abonado:400000, consumo70:0, consumo50:0, aclaracion:"80% CONSUMO - DOBLE" },
  { sector:"C", titular:"Leandro Russo", publica:"JL", importe:1500000, abonado:300000, consumo70:0, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"D", titular:"Grego Tarrio", publica:"Toto M", importe:1200000, abonado:250000, consumo70:840000, consumo50:600000, aclaracion:"" },
  { sector:"E", titular:"Felipe Figueroa", publica:"Ori", importe:900000, abonado:360000, consumo70:630000, consumo50:450000, aclaracion:"DOBLE" },
  { sector:"F", titular:"Rama", publica:"JL", importe:1200000, abonado:300000, consumo70:840000, consumo50:600000, aclaracion:"" },
  { sector:"G", titular:"Franco Pocho", publica:"Zurdo", importe:2000000, abonado:100000, consumo70:0, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"H", titular:"Nacho Trotta", publica:"Jose C", importe:2500000, abonado:0, consumo70:1750000, consumo50:1250000, aclaracion:"" },
  { sector:"I", titular:"Dante Muzzupapa", publica:"Toto M", importe:1200000, abonado:1200000, consumo70:840000, consumo50:600000, aclaracion:"" },
  { sector:"J", titular:"Leo Pizzacalla", publica:"Cande", importe:1350000, abonado:270000, consumo70:0, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"K", titular:"Joaquin Mansilla", publica:"Zurdo", importe:4000000, abonado:3860500, consumo70:2800000, consumo50:2000000, aclaracion:"" },
  { sector:"L", titular:"Mate Orsi", publica:"Martu Pe", importe:750000, abonado:750000, consumo70:525000, consumo50:375000, aclaracion:"" },
  { sector:"M", titular:"Juli Kajevik", publica:"Martu Pe", importe:900000, abonado:150000, consumo70:630000, consumo50:450000, aclaracion:"" },
  { sector:"N", titular:"Isa Bellanarduzi", publica:"Mati Catella", importe:900000, abonado:200000, consumo70:0, consumo50:0, aclaracion:"85% CONSUMO" },
  { sector:"O", titular:"Santi Herzfel", publica:"Toto M", importe:1260000, abonado:0, consumo70:0, consumo50:0, aclaracion:"100% CONSUMO - 10H 23M" },
  { sector:"P", titular:"Toto Rodriguez", publica:"Barba", importe:750000, abonado:150000, consumo70:525000, consumo50:375000, aclaracion:"" },
  { sector:"PC Q", titular:"Mate Rodriguez", publica:"Barba", importe:750000, abonado:610000, consumo70:525000, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"PC R", titular:"Zampa", publica:"Juan L", importe:750000, abonado:750000, consumo70:525000, consumo50:0, aclaracion:"100% CONSUMO - 10 PERS" },
  { sector:"PC S", titular:"Ian Coto", publica:"Tute S", importe:650000, abonado:150000, consumo70:455000, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"PC T", titular:"Crist\u00f3bal Boto", publica:"Juan L", importe:900000, abonado:300000, consumo70:630000, consumo50:0, aclaracion:"100% CONSUMO" },
  { sector:"PC U", titular:"Iv\u00e1n Urbaj", publica:"Toto", importe:1200000, abonado:1200000, consumo70:840000, consumo50:0, aclaracion:"100% CONSUMO" }
];

const SEED_COMBOS = [
  { producto:"Red Label x4", titular:"Tadeo Podrez", publica:"Luz Campillo", importe:260000, abonado:260000 },
  { producto:"1 Sern x4", titular:"Tizi Gonzalez", publica:"Agus Aggi", importe:220000, abonado:220000 }
];

const SEED_PERSONAL = [
  { rol:"Jefa de camareras", cant:1, costo:65000 },
  { rol:"Camareras", cant:6, costo:30000 },
  { rol:"Camareras Plus", cant:7, costo:35000 },
  { rol:"Jefe de runner", cant:1, costo:25000 },
  { rol:"Runner", cant:3, costo:25000 },
  { rol:"Runner Plus", cant:7, costo:30000 },
  { rol:"Jefe de barra", cant:1, costo:35000 },
  { rol:"Bartender", cant:6, costo:40000 },
  { rol:"Cajeras Barra", cant:1, costo:50000 },
  { rol:"Cajera Bolet Barra", cant:1, costo:60000 },
  { rol:"Adrian", cant:1, costo:30000 },
  { rol:"Gabi", cant:1, costo:25000 },
  { rol:"Seguridad", cant:1, costo:675000 },
  { rol:"Enfermera", cant:1, costo:45000 },
  { rol:"T\u00e9cnica Iluminaci\u00f3n", cant:1, costo:230000 },
  { rol:"T\u00e9cnica Sonido", cant:1, costo:45000 },
  { rol:"Tute", cant:1, costo:150000 },
  { rol:"Fortu", cant:1, costo:150000 },
  { rol:"Administraci\u00f3n", cant:1, costo:75000 },
  { rol:"Combos", cant:9, costo:10000 }
];

const SEED_EXTRAS = [
  { concepto:"CDJ", importe:150000, abonado:150000 },
  { concepto:"Polic\u00eda", importe:175000, abonado:175000 },
  { concepto:"Lucas Bole", importe:300000, abonado:300000 },
  { concepto:"Nacho Vidal", importe:250000, abonado:250000 },
  { concepto:"Miralles", importe:350000, abonado:350000 },
  { concepto:"Hielo", importe:130000, abonado:130000 },
  { concepto:"Seguridad extra", importe:450000, abonado:450000 },
  { concepto:"Retiro Tarjeta", importe:200000, abonado:200000 },
  { concepto:"Sueldos empleados Luqui", importe:633370, abonado:568370 },
  { concepto:"Custodia", importe:20000, abonado:20000 }
];

const SEED_COMISIONES = [
  { publica:"Cami Varni", mesa:750000, combos:0, comMesa:75000, comCombos:0, subtotal:75000 },
  { publica:"Toto M", mesa:4860000, combos:0, comMesa:486000, comCombos:0, subtotal:486000 },
  { publica:"Ori", mesa:900000, combos:0, comMesa:90000, comCombos:0, subtotal:90000 },
  { publica:"Zurdo", mesa:6000000, combos:0, comMesa:600000, comCombos:0, subtotal:600000 },
  { publica:"Cande", mesa:1350000, combos:0, comMesa:135000, comCombos:0, subtotal:135000 },
  { publica:"Martu Pe", mesa:1650000, combos:0, comMesa:165000, comCombos:0, subtotal:165000 },
  { publica:"Mati Catella", mesa:900000, combos:0, comMesa:90000, comCombos:0, subtotal:90000 },
  { publica:"Barba", mesa:1500000, combos:0, comMesa:150000, comCombos:0, subtotal:150000 },
  { publica:"Tute S", mesa:650000, combos:0, comMesa:65000, comCombos:0, subtotal:65000 },
  { publica:"Luz Campillo", mesa:0, combos:260000, comMesa:0, comCombos:26000, subtotal:26000 },
  { publica:"Agus Aggi", mesa:0, combos:480000, comMesa:0, comCombos:48000, subtotal:48000 }
];

const SEED_INGRESOS = {
  mesas: 21016000,
  tickets: 2716050,
  efecBoleteria: 8591000,
  efecBarra: 5346000,
  mpBoleteria: 14309100,
  mpBarra: 4958100,
  comMP: 0.06,
  comSenas: 0.0275
};

const SEED_COSTOS = {
  personal: 2700000,
  extras: 2658370,
  cmv: 14234062.5,
  publicas: 2794000,
  costoFijo: 0
};

const SEED_BOLETERIA = {
  hombre: 320,
  mujer: 410,
  mujer2x1: 85,
  freeM: 42,
  freeH: 15,
  combos: 9,
  mesasPax: 210
};

/* ── Helpers ── */
const fmt = (v) => {
  if (v == null) return "$0";
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 1e9) return s + "$" + (a / 1e9).toFixed(1) + "B";
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return s + "$" + (a / 1e3).toFixed(0) + "K";
  return s + "$" + a.toLocaleString("es-AR");
};

const fmtFull = (v) => "$" + Math.round(v || 0).toLocaleString("es-AR");
const pct = (v) => ((v || 0) * 100).toFixed(1) + "%";

/* ── Style helpers ── */
const bx = (extra) => ({
  background: C.s2, borderRadius: 12, padding: 16,
  border: "1px solid " + C.bd, ...extra
});

const cardSt = (color) => ({
  background: color + "10", borderRadius: 12, padding: "14px 16px",
  border: "1px solid " + color + "30", flex: 1, minWidth: 140
});

const labelSt = { fontSize: 10, color: C.t2, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 };
const bigNum = (color) => ({ fontSize: 22, fontWeight: 700, color: color || C.w, fontFamily: C.mono });
const smNum = (color) => ({ fontSize: 13, fontWeight: 600, color: color || C.tx, fontFamily: C.mono });

const pillBtn = (active, color) => ({
  padding: "6px 14px", borderRadius: 20, fontSize: 11,
  fontFamily: C.mono, cursor: "pointer", border: "none",
  background: active ? color + "25" : "transparent",
  color: active ? color : C.t2, transition: "all 0.2s"
});

const thSt = { padding: "8px 10px", textAlign: "left", fontSize: 10, color: C.t2, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid " + C.bd };
const tdSt = { padding: "8px 10px", fontSize: 12, fontFamily: C.mono, borderBottom: "1px solid " + C.bd + "60" };

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════ */
export default function EventoLive() {
  const [tab, setTab] = useState("resumen");
  const [mesas, setMesas] = useState(SEED_MESAS);
  const [combos] = useState(SEED_COMBOS);
  const [personal] = useState(SEED_PERSONAL);
  const [extras] = useState(SEED_EXTRAS);
  const [comisiones] = useState(SEED_COMISIONES);
  const [ingresos, setIngresos] = useState(SEED_INGRESOS);
  const [costos, setCostos] = useState(SEED_COSTOS);
  const [boleteria, setBoleteria] = useState(SEED_BOLETERIA);
  const [lastUpdate] = useState(new Date());
  const [eventoInfo] = useState({ nombre: "S\u00e1bado 13/12", tipo: "sabado", estado: "cerrado" });

  /* ── C\u00e1lculos derivados ── */
  const totalMesas = ingresos.mesas;
  const totalTickets = ingresos.tickets;
  const totalEfectivo = ingresos.efecBoleteria + ingresos.efecBarra;
  const totalMP = ingresos.mpBoleteria + ingresos.mpBarra;
  const ingresosBruto = totalMesas + totalTickets + totalEfectivo + totalMP;
  /* Neto despu\u00e9s de comisiones MP y se\u00f1as */
  const comisionMP = totalMP * ingresos.comMP;
  const comisionSenas = (totalMesas + totalTickets) * ingresos.comSenas;

  const totalCostos = costos.personal + costos.extras + costos.cmv + costos.publicas + costos.costoFijo;
  const utilidad = ingresosBruto - totalCostos;
  const margenUtil = ingresosBruto > 0 ? utilidad / ingresosBruto : 0;

  const mesasCobradas = mesas.filter(m => m.abonado >= m.importe).length;
  const mesasParcial = mesas.filter(m => m.abonado > 0 && m.abonado < m.importe).length;
  const mesasPendientes = mesas.filter(m => m.abonado === 0).length;
  const totalAbonado = mesas.reduce((s, m) => s + (m.abonado || 0), 0);
  const totalPendiente = mesas.reduce((s, m) => s + Math.max(0, (m.importe || 0) - (m.abonado || 0)), 0);

  const totalPersonal = personal.reduce((s, p) => s + (p.cant || 0) * (p.costo || 0), 0);
  const totalExtras = extras.reduce((s, e) => s + (e.importe || 0), 0);
  const totalComisiones = comisiones.reduce((s, c) => s + (c.subtotal || 0), 0);

  const totalBolEntradas = boleteria.hombre + boleteria.mujer + (boleteria.mujer2x1 * 2) + boleteria.freeM + boleteria.freeH;
  const totalAsistencia = totalBolEntradas + boleteria.combos + boleteria.mesasPax;

  const TABS = [
    { id: "resumen", label: "Resumen", color: C.g },
    { id: "mesas", label: "Mesas", color: C.b },
    { id: "costos", label: "Costos", color: C.r },
    { id: "comisiones", label: "Comisiones", color: C.y },
    { id: "boleteria", label: "Boletería", color: C.v }
  ];

  /* ══════════════════════════════════
     RENDER: RESUMEN
     ══════════════════════════════════ */
  const renderResumen = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* BIG NUMBERS */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={cardSt(C.g)}>
          <div style={labelSt}>Ingreso Total</div>
          <div style={bigNum(C.g)}>{fmt(ingresosBruto)}</div>
        </div>
        <div style={cardSt(C.r)}>
          <div style={labelSt}>Costos Total</div>
          <div style={bigNum(C.r)}>{fmt(-totalCostos)}</div>
        </div>
        <div style={cardSt(utilidad >= 0 ? C.g : C.r)}>
          <div style={labelSt}>Utilidad</div>
          <div style={bigNum(utilidad >= 0 ? C.g : C.r)}>{fmt(utilidad)}</div>
          <div style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginTop: 2 }}>{pct(margenUtil)} margen</div>
        </div>
      </div>

      {/* DESGLOSE INGRESOS */}
      <div style={bx()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 12 }}>Desglose Ingresos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelSt}>Se\u00f1as y Tickets</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Mesas</span>
              <span style={smNum(C.b)}>{fmt(totalMesas)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Tickets</span>
              <span style={smNum(C.b)}>{fmt(totalTickets)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid " + C.bd, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Subtotal</span>
              <span style={smNum(C.w)}>{fmt(totalMesas + totalTickets)}</span>
            </div>
          </div>

          <div>
            <div style={labelSt}>Efectivo</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Boleter\u00eda</span>
              <span style={smNum(C.g)}>{fmt(ingresos.efecBoleteria)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Barra</span>
              <span style={smNum(C.g)}>{fmt(ingresos.efecBarra)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid " + C.bd, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Subtotal</span>
              <span style={smNum(C.w)}>{fmt(totalEfectivo)}</span>
            </div>
          </div>

          <div>
            <div style={labelSt}>MercadoPago</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Boleter\u00eda</span>
              <span style={smNum(C.v)}>{fmt(ingresos.mpBoleteria)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Barra</span>
              <span style={smNum(C.v)}>{fmt(ingresos.mpBarra)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid " + C.bd, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Subtotal</span>
              <span style={smNum(C.w)}>{fmt(totalMP)}</span>
            </div>
          </div>

          <div>
            <div style={labelSt}>Asistencia</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Boleter\u00eda</span>
              <span style={smNum(C.o)}>{totalBolEntradas}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Mesas</span>
              <span style={smNum(C.o)}>{boleteria.mesasPax}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid " + C.bd, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>Total</span>
              <span style={smNum(C.w)}>{totalAsistencia}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESGLOSE COSTOS */}
      <div style={bx()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 12 }}>Desglose Costos</div>
        {[
          { label: "Personal", val: costos.personal, color: C.o },
          { label: "Gastos Extra", val: costos.extras, color: C.y },
          { label: "CMV (Bebidas)", val: costos.cmv, color: C.p },
          { label: "P\u00fablicas (Comisiones)", val: costos.publicas, color: C.v },
          { label: "Costo Fijo", val: costos.costoFijo, color: C.t2 }
        ].map((item, i) => {
          const barW = totalCostos > 0 ? (item.val / totalCostos) * 100 : 0;
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>{item.label}</span>
                <span style={smNum(item.color)}>{fmt(-item.val)}</span>
              </div>
              <div style={{ height: 4, background: C.s3, borderRadius: 2 }}>
                <div style={{ height: 4, background: item.color, borderRadius: 2, width: barW + "%" }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid " + C.bd }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.w, fontFamily: C.mono }}>TOTAL COSTOS</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.r, fontFamily: C.mono }}>{fmt(-totalCostos)}</span>
        </div>
      </div>

      {/* STATUS MESAS */}
      <div style={bx()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 12 }}>Estado Mesas</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ ...cardSt(C.g), flex: "unset", minWidth: 90, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.g, fontFamily: C.mono }}>{mesasCobradas}</div>
            <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>Cobradas</div>
          </div>
          <div style={{ ...cardSt(C.y), flex: "unset", minWidth: 90, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.y, fontFamily: C.mono }}>{mesasParcial}</div>
            <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>Parcial</div>
          </div>
          <div style={{ ...cardSt(C.r), flex: "unset", minWidth: 90, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.r, fontFamily: C.mono }}>{mesasPendientes}</div>
            <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>Pendientes</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
              <span style={{ fontSize: 11, color: C.t2, fontFamily: C.mono }}>Abonado</span>
              <span style={smNum(C.g)}>{fmt(totalAbonado)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
              <span style={{ fontSize: 11, color: C.t2, fontFamily: C.mono }}>Pendiente</span>
              <span style={smNum(C.r)}>{fmt(totalPendiente)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════
     RENDER: MESAS
     ══════════════════════════════════ */
  const renderMesas = () => {
    const getStatusColor = (m) => {
      if (m.abonado >= m.importe) return C.g;
      if (m.abonado > 0) return C.y;
      return C.r;
    };
    const getStatusLabel = (m) => {
      if (m.abonado >= m.importe) return "OK";
      if (m.abonado > 0) return "Parcial";
      return "Pend";
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Quick stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={cardSt(C.b)}>
            <div style={labelSt}>Total Mesas</div>
            <div style={bigNum(C.b)}>{mesas.length}</div>
          </div>
          <div style={cardSt(C.g)}>
            <div style={labelSt}>Importe Total</div>
            <div style={bigNum(C.g)}>{fmt(mesas.reduce((s, m) => s + m.importe, 0))}</div>
          </div>
          <div style={cardSt(C.y)}>
            <div style={labelSt}>Pendiente</div>
            <div style={bigNum(C.y)}>{fmt(totalPendiente)}</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...bx(), padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Sector", "Titular", "P\u00fablica", "Importe", "Abonado", "Pend.", "Estado"].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesas.map((m, i) => {
                const pend = Math.max(0, m.importe - m.abonado);
                const sc = getStatusColor(m);
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s1 + "60" }}>
                    <td style={{ ...tdSt, fontWeight: 600, color: C.w }}>{m.sector}</td>
                    <td style={{ ...tdSt, color: C.tx }}>{m.titular}</td>
                    <td style={{ ...tdSt, color: C.t2 }}>{m.publica}</td>
                    <td style={{ ...tdSt, color: C.w }}>{fmt(m.importe)}</td>
                    <td style={{ ...tdSt, color: C.g }}>{fmt(m.abonado)}</td>
                    <td style={{ ...tdSt, color: pend > 0 ? C.r : C.t2 }}>{fmt(pend)}</td>
                    <td style={tdSt}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 10,
                        fontSize: 10, fontFamily: C.mono, fontWeight: 600,
                        background: sc + "20", color: sc
                      }}>{getStatusLabel(m)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Combos */}
        {combos.length > 0 && (
          <div style={bx()}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 10 }}>Combos</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Producto", "Titular", "P\u00fablica", "Importe", "Abonado"].map(h => (
                    <th key={h} style={thSt}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combos.map((c, i) => (
                  <tr key={i}>
                    <td style={{ ...tdSt, fontWeight: 600, color: C.w }}>{c.producto}</td>
                    <td style={{ ...tdSt, color: C.tx }}>{c.titular}</td>
                    <td style={{ ...tdSt, color: C.t2 }}>{c.publica}</td>
                    <td style={{ ...tdSt, color: C.w }}>{fmt(c.importe)}</td>
                    <td style={{ ...tdSt, color: C.g }}>{fmt(c.abonado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  /* ══════════════════════════════════
     RENDER: COSTOS
     ══════════════════════════════════ */
  const renderCostos = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={cardSt(C.o)}>
          <div style={labelSt}>Personal</div>
          <div style={bigNum(C.o)}>{fmt(totalPersonal)}</div>
        </div>
        <div style={cardSt(C.y)}>
          <div style={labelSt}>Gastos Extra</div>
          <div style={bigNum(C.y)}>{fmt(totalExtras)}</div>
        </div>
        <div style={cardSt(C.p)}>
          <div style={labelSt}>CMV</div>
          <div style={bigNum(C.p)}>{fmt(costos.cmv)}</div>
        </div>
      </div>

      {/* Personal table */}
      <div style={{ ...bx(), padding: 0, overflow: "auto" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid " + C.bd }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.w }}>Costos Personal</span>
          <span style={{ fontSize: 11, color: C.t2, fontFamily: C.mono, marginLeft: 8 }}>({personal.reduce((s, p) => s + (p.cant || 0), 0)} personas)</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Rol", "Cant", "Costo Unit", "Subtotal"].map(h => (
                <th key={h} style={thSt}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {personal.map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s1 + "60" }}>
                <td style={{ ...tdSt, color: C.tx }}>{p.rol}</td>
                <td style={{ ...tdSt, color: C.w, textAlign: "center" }}>{p.cant}</td>
                <td style={{ ...tdSt, color: C.t2 }}>{fmt(p.costo)}</td>
                <td style={{ ...tdSt, color: C.o, fontWeight: 600 }}>{fmt(p.cant * p.costo)}</td>
              </tr>
            ))}
            <tr style={{ background: C.s3 }}>
              <td style={{ ...tdSt, fontWeight: 700, color: C.w }} colSpan={3}>TOTAL PERSONAL</td>
              <td style={{ ...tdSt, fontWeight: 700, color: C.o }}>{fmt(totalPersonal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Extras table */}
      <div style={{ ...bx(), padding: 0, overflow: "auto" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid " + C.bd }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.w }}>Gastos Extra</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Concepto", "Importe", "Abonado", "Pendiente"].map(h => (
                <th key={h} style={thSt}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {extras.map((e, i) => {
              const pend = Math.max(0, e.importe - e.abonado);
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s1 + "60" }}>
                  <td style={{ ...tdSt, color: C.tx }}>{e.concepto}</td>
                  <td style={{ ...tdSt, color: C.w }}>{fmt(e.importe)}</td>
                  <td style={{ ...tdSt, color: C.g }}>{fmt(e.abonado)}</td>
                  <td style={{ ...tdSt, color: pend > 0 ? C.r : C.t2 }}>{fmt(pend)}</td>
                </tr>
              );
            })}
            <tr style={{ background: C.s3 }}>
              <td style={{ ...tdSt, fontWeight: 700, color: C.w }}>TOTAL</td>
              <td style={{ ...tdSt, fontWeight: 700, color: C.y }}>{fmt(totalExtras)}</td>
              <td style={{ ...tdSt, fontWeight: 700, color: C.g }}>{fmt(extras.reduce((s, e) => s + e.abonado, 0))}</td>
              <td style={{ ...tdSt, fontWeight: 700, color: C.r }}>{fmt(extras.reduce((s, e) => s + Math.max(0, e.importe - e.abonado), 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════
     RENDER: COMISIONES
     ══════════════════════════════════ */
  const renderComisiones = () => {
    const sorted = [...comisiones].sort((a, b) => b.subtotal - a.subtotal);
    const maxCom = sorted.length > 0 ? sorted[0].subtotal : 1;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Summary */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={cardSt(C.y)}>
            <div style={labelSt}>Total Comisiones</div>
            <div style={bigNum(C.y)}>{fmt(totalComisiones)}</div>
          </div>
          <div style={cardSt(C.v)}>
            <div style={labelSt}>P\u00fablicas</div>
            <div style={bigNum(C.v)}>{comisiones.length}</div>
          </div>
          <div style={cardSt(C.o)}>
            <div style={labelSt}>Promedio</div>
            <div style={bigNum(C.o)}>{fmt(comisiones.length > 0 ? totalComisiones / comisiones.length : 0)}</div>
          </div>
        </div>

        {/* Ranking bars */}
        <div style={bx()}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 12 }}>Ranking Comisiones</div>
          {sorted.map((c, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: i === 0 ? C.y : C.tx, fontFamily: C.mono, fontWeight: i === 0 ? 700 : 400 }}>
                  {i < 3 ? ("#" + (i + 1) + " ") : ""}{c.publica}
                </span>
                <span style={smNum(C.y)}>{fmt(c.subtotal)}</span>
              </div>
              <div style={{ height: 4, background: C.s3, borderRadius: 2 }}>
                <div style={{ height: 4, background: i === 0 ? C.y : i === 1 ? C.o : i === 2 ? C.v : C.b, borderRadius: 2, width: ((c.subtotal / maxCom) * 100) + "%", transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Detail table */}
        <div style={{ ...bx(), padding: 0, overflow: "auto" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid " + C.bd }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.w }}>Detalle Comisiones</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["P\u00fablica", "Mesas $", "Combos $", "Com. Mesa", "Com. Combos", "Total"].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.s1 + "60" }}>
                  <td style={{ ...tdSt, fontWeight: 600, color: C.w }}>{c.publica}</td>
                  <td style={{ ...tdSt, color: C.t2 }}>{fmt(c.mesa)}</td>
                  <td style={{ ...tdSt, color: C.t2 }}>{fmt(c.combos)}</td>
                  <td style={{ ...tdSt, color: C.o }}>{fmt(c.comMesa)}</td>
                  <td style={{ ...tdSt, color: C.p }}>{fmt(c.comCombos)}</td>
                  <td style={{ ...tdSt, color: C.y, fontWeight: 700 }}>{fmt(c.subtotal)}</td>
                </tr>
              ))}
              <tr style={{ background: C.s3 }}>
                <td style={{ ...tdSt, fontWeight: 700, color: C.w }}>TOTAL</td>
                <td style={{ ...tdSt, fontWeight: 600, color: C.t2 }}>{fmt(comisiones.reduce((s, c) => s + c.mesa, 0))}</td>
                <td style={{ ...tdSt, fontWeight: 600, color: C.t2 }}>{fmt(comisiones.reduce((s, c) => s + c.combos, 0))}</td>
                <td style={{ ...tdSt, fontWeight: 600, color: C.o }}>{fmt(comisiones.reduce((s, c) => s + c.comMesa, 0))}</td>
                <td style={{ ...tdSt, fontWeight: 600, color: C.p }}>{fmt(comisiones.reduce((s, c) => s + c.comCombos, 0))}</td>
                <td style={{ ...tdSt, fontWeight: 700, color: C.y }}>{fmt(totalComisiones)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════
     RENDER: BOLETERIA
     ══════════════════════════════════ */
  const renderBoleteria = () => {
    const entries = [
      { label: "Hombre", val: boleteria.hombre, color: C.b },
      { label: "Mujer", val: boleteria.mujer, color: C.p },
      { label: "Mujer 2x1", val: boleteria.mujer2x1, color: C.v },
      { label: "Free Mujer", val: boleteria.freeM, color: C.t2 },
      { label: "Free Hombre", val: boleteria.freeH, color: C.t2 },
      { label: "Combos", val: boleteria.combos, color: C.o },
      { label: "Pax Mesas", val: boleteria.mesasPax, color: C.y }
    ];
    const maxEntry = Math.max(...entries.map(e => e.val), 1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Big number */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={cardSt(C.v)}>
            <div style={labelSt}>Asistencia Total</div>
            <div style={bigNum(C.v)}>{totalAsistencia}</div>
          </div>
          <div style={cardSt(C.b)}>
            <div style={labelSt}>Boleter\u00eda</div>
            <div style={bigNum(C.b)}>{totalBolEntradas}</div>
          </div>
          <div style={cardSt(C.y)}>
            <div style={labelSt}>Mesas Pax</div>
            <div style={bigNum(C.y)}>{boleteria.mesasPax}</div>
          </div>
        </div>

        {/* Distribution */}
        <div style={bx()}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 14 }}>Distribuci\u00f3n</div>
          {entries.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.t2, fontFamily: C.mono }}>{e.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: e.color, fontFamily: C.mono }}>{e.val}</span>
              </div>
              <div style={{ height: 6, background: C.s3, borderRadius: 3 }}>
                <div style={{ height: 6, background: e.color, borderRadius: 3, width: ((e.val / maxEntry) * 100) + "%", transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gender split */}
        <div style={bx()}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.w, marginBottom: 10 }}>Ratio H/M</div>
          {(() => {
            const totalH = boleteria.hombre + boleteria.freeH;
            const totalM = boleteria.mujer + (boleteria.mujer2x1 * 2) + boleteria.freeM;
            const total = totalH + totalM;
            const pctH = total > 0 ? (totalH / total * 100) : 0;
            const pctM = total > 0 ? (totalM / total * 100) : 0;
            return (
              <div>
                <div style={{ display: "flex", height: 24, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: pctH + "%", background: C.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.w, fontFamily: C.mono }}>{pctH.toFixed(0)}%</span>
                  </div>
                  <div style={{ width: pctM + "%", background: C.p, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.w, fontFamily: C.mono }}>{pctM.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.b, fontFamily: C.mono }}>Hombres: {totalH}</span>
                  <span style={{ fontSize: 11, color: C.p, fontFamily: C.mono }}>Mujeres: {totalM}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════
     RENDER PRINCIPAL
     ══════════════════════════════════ */
  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      {/* EVENT HEADER */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-block", width: 8, height: 8, borderRadius: "50%",
            background: eventoInfo.estado === "live" ? C.g : C.t2,
            boxShadow: eventoInfo.estado === "live" ? ("0 0 8px " + C.g) : "none"
          }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: C.w, fontFamily: C.sans }}>
            {eventoInfo.nombre}
          </span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            background: eventoInfo.estado === "live" ? C.g + "20" : C.t2 + "20",
            color: eventoInfo.estado === "live" ? C.g : C.t2,
            fontFamily: C.mono, fontWeight: 600, textTransform: "uppercase"
          }}>
            {eventoInfo.estado === "live" ? "EN VIVO" : "CERRADO"}
          </span>
        </div>
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
          {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap",
        background: C.s1, borderRadius: 12, padding: 4
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={pillBtn(tab === t.id, t.color)}
          >{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === "resumen" && renderResumen()}
      {tab === "mesas" && renderMesas()}
      {tab === "costos" && renderCostos()}
      {tab === "comisiones" && renderComisiones()}
      {tab === "boleteria" && renderBoleteria()}
    </div>
  );
}
