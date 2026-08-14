import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import VACWizard from "./components/VacWizard";
import PanelCumplimiento from "./components/PanelCumplimiento";
import type { ProyectoPanel } from "./lib/estado";

function App() {
  // Crear un proyecto lleva directo al formulario, con lo que ya sabemos puesto.
  const [llenando, setLlenando] = useState<ProyectoPanel | null>(null);

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

  return <PanelCumplimiento onLlenarVac={setLlenando} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
