import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import VACWizard from "./components/VacWizard";
import PanelCumplimiento from "./components/PanelCumplimiento";

function App() {
  const [vista, setVista] = useState<"panel" | "wizard">("panel");
  return vista === "panel" ? (
    <PanelCumplimiento onIrAlWizard={() => setVista("wizard")} />
  ) : (
    <>
      <button
        onClick={() => setVista("panel")}
        className="fixed bottom-4 right-4 z-50 rounded px-3 py-2 text-[12px] font-semibold text-white shadow-lg"
        style={{ background: "#C2410C" }}
      >
        ← Panel de cumplimiento
      </button>
      <VACWizard />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
