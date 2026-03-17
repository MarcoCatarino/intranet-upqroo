import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { ToastProvider } from "./components/ui/Toast";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider />
    <App />
  </StrictMode>,
);
