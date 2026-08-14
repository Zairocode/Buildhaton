import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import VACWizard from "./components/VacWizard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VACWizard />
  </StrictMode>,
);
