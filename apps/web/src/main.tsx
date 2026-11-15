import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/baloo-thambi-2/400.css";
import "@fontsource/baloo-thambi-2/700.css";
import "@fontsource/mukta-malar/400.css";
import "@fontsource/mukta-malar/700.css";
import { App } from "./App";
import "./styles.css";
import "./themes.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support: tiny hand-written service worker (only in production builds).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => { /* offline mode is optional */ }); });
}
