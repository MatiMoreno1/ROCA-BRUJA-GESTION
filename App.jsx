import { useState, useEffect } from 'react';
import { loadAllData, autoRefresh } from './sheets.js';
import GestionRB from './gestion.jsx';

const C = {
  bg: '#060609', s1: '#0e0e14', tx: '#e2e2e6', t2: '#9999a8',
  g: '#34D399', r: '#F87171', mono: "'DM Mono',monospace", sans: "'DM Sans',sans-serif"
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Carga inicial
  useEffect(() => {
    loadAllData().then((result) => {
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        setLastUpdate(new Date());
      }
    });
  }, []);

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    const cleanup = autoRefresh((result) => {
      if (!result.error) {
        setData(result);
        setLastUpdate(new Date());
      }
    }, 60);
    return cleanup;
  }, []);

  // Loading state
  if (!data && !error) {
    return (
      <div style={{
        background: C.bg, minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid ' + C.s1,
          borderTop: '3px solid ' + C.g, borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: C.t2, fontFamily: C.mono, fontSize: 13, marginTop: 16 }}>
          Cargando datos de Google Sheets...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        background: C.bg, minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 32
      }}>
        <div style={{ color: C.r, fontFamily: C.mono, fontSize: 16, marginBottom: 16 }}>
          Error cargando datos
        </div>
        <div style={{ color: C.t2, fontFamily: C.mono, fontSize: 13, textAlign: 'center', maxWidth: 500 }}>
          {error}
        </div>
        <div style={{ color: C.t2, fontFamily: C.mono, fontSize: 12, marginTop: 16 }}>
          Verifica que el Google Sheet este publicado en la web y que el SHEET_ID sea correcto.
        </div>
        <button onClick={() => window.location.reload()} style={{
          marginTop: 16, padding: '8px 24px', background: C.g + '22',
          color: C.g, border: 'none', borderRadius: 8, fontFamily: C.mono,
          fontSize: 13, cursor: 'pointer'
        }}>
          Reintentar
        </button>
      </div>
    );
  }

  // Render dashboard con datos live
  return (
    <GestionRB
      liveEvents={data.events}
      liveVendors={data.vendors}
      liveFixed={data.fixed}
      lastUpdate={lastUpdate}
    />
  );
}
