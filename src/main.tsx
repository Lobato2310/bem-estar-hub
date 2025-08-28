import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Capacitor } from "@capacitor/core";
import { BrowserRouter, HashRouter } from "react-router-dom";

const isNative = Capacitor.isNativePlatform();
const Router = isNative ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
