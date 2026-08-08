import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProveedorQuery } from "./infraestructura/proveedor-query";
import "./diseno/tailwind-base.css";

const raiz = document.getElementById("root");
if (!raiz) {
  throw new Error("No se encontro el elemento raiz #root");
}

ReactDOM.createRoot(raiz).render(
  <React.StrictMode>
    <ProveedorQuery>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ProveedorQuery>
  </React.StrictMode>
);
