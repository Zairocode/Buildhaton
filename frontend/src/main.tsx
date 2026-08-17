import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import VACWizard from "./components/VacWizard";
import PanelCumplimiento from "./components/PanelCumplimiento";
import Portal from "./components/Portal";
import { avisoEnvio } from "./components/panel/notificaciones";
import { useStore, type ProyectoPanel } from "./lib/estado";

function App() {
  // Crear un proyecto lleva directo al formulario, con lo que ya sabemos puesto.
  const [llenando, setLlenando] = useState<ProyectoPanel | null>(null);
  const [portal, setPortal] = useState<ProyectoPanel | null>(null);
  const { store, setStore } = useStore();

  if (portal)
    return (
      <Portal
        proyecto={portal}
        empresa={store.empresa}
        onSalir={() => setPortal(null)}
        onEnviado={() =>
          setStore((s) => ({ ...s, notificaciones: [...s.notificaciones, ...avisoEnvio(s, portal.id)] }))
        }
      />
    );

  if (llenando)
    return (
      <>
        <button
          onClick={() => setLlenando(null)}
          className="fixed bottom-4 right-4 z-50 rounded-[3px] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-lg"
          style={{ background: "#0F766E", fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
        >
          ← Volver al panel
        </button>
        <VACWizard proyecto={llenando} />
      </>
    );

  return <PanelCumplimiento onLlenarVac={setLlenando} onAbrirPortal={setPortal} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
