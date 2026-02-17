import { useState, Component } from "react";
import GestionRB from "./gestion.jsx";
import MensualRB from "./mensual.jsx";
import VendedoresRB from "./vendedores.jsx";
import BebidasCMV from "./bebidas.jsx";
import EventoLive from "./evento.jsx";

const C = {
  bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
  tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
  g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
  b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
  mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
};

const MODULES = [
  { id:"evento", label:"Evento Live", icon:"\u25C9", color:C.o },
  { id:"gestion", label:"Gesti\u00f3n Anual", icon:"\u2261", color:C.g },
  { id:"mensual", label:"Mensual P&L", icon:"\u25A1", color:C.b },
  { id:"vendedores", label:"Vendedores", icon:"\u25B2", color:C.y },
  { id:"bebidas", label:"Bebidas/CMV", icon:"\u25CF", color:C.p }
];

/* ErrorBoundary para atrapar errores y mostrar mensaje en vez de pantalla blanca */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40, textAlign: "center", color: C.r, fontFamily: C.mono
        }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>Error en el m\u00f3dulo</div>
          <div style={{ fontSize: 13, color: C.t2, marginBottom: 20 }}>
            {this.state.error?.message || "Error desconocido"}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid " + C.r,
              background: "transparent", color: C.r, cursor: "pointer",
              fontFamily: C.mono, fontSize: 13
            }}
          >Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [mod, setMod] = useState("evento");

  return (
    <div style={{
      background:C.bg, minHeight:"100vh", color:C.tx,
      fontFamily:C.sans
    }}>
      {/* === TOP NAV === */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 16px", background:C.s1,
        borderBottom:"1px solid "+C.bd,
        position:"sticky", top:0, zIndex:100
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{
            fontSize:16, fontWeight:700, color:C.w,
            fontFamily:C.sans, letterSpacing:1
          }}>RB</span>
          <span style={{
            fontSize:11, color:C.t2, fontFamily:C.mono
          }}>PRODUCTORA</span>
        </div>

        <div style={{ display:"flex", gap:4 }}>
          {MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => setMod(m.id)}
              style={{
                padding:"6px 14px", borderRadius:20, fontSize:12,
                fontFamily:C.mono, cursor:"pointer",
                border: mod===m.id ? "1px solid "+m.color+"66" : "1px solid transparent",
                background: mod===m.id ? m.color+"18" : "transparent",
                color: mod===m.id ? m.color : C.t2,
                transition:"all 0.2s",
                display:"flex", alignItems:"center", gap:6
              }}
            >
              <span style={{ fontSize:10 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* === CONTENT === */}
      <div>
        <ErrorBoundary key={mod}>
          {mod === "evento" && <EventoLive />}
          {mod === "gestion" && <GestionRB />}
          {mod === "mensual" && <MensualRB />}
          {mod === "vendedores" && <VendedoresRB />}
          {mod === "bebidas" && <BebidasCMV />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
