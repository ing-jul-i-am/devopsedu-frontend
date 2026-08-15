// Envuelve las rutas autenticadas con el patron unico de navegacion
// (RNF-03). Se compone dentro de GuardaAutenticacion en rutas.tsx.
import { Outlet } from "react-router-dom";
import { BarraNavegacion } from "@/componentes-comunes/barra-navegacion";

export function DisenoAutenticado() {
  return (
    <BarraNavegacion>
      <Outlet />
    </BarraNavegacion>
  );
}
