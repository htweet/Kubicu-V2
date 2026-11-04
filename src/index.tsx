import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

import { initRealAuthConfig } from "./utils/auth/realAuth";

// Builds with real sign-in read their runtime switch (/config.js) first (M2.6); others: no effect.
initRealAuthConfig();

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}