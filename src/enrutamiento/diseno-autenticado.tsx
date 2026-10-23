// Envuelve las rutas autenticadas con el patron unico de navegacion
// (RNF-03). Se compone dentro de GuardaAutenticacion en rutas.tsx. Al
// estudiante le agrega el resumen de su ruta en la barra lateral (RF-22); al
// docente no, porque el backend le responde 403 en mi-ruta (DT-17).
import { Outlet } from "react-router-dom";
import { BarraNavegacion } from "@/componentes-comunes/barra-navegacion";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { ResumenRutaLateral } from "@/modulos/aprendizaje/componentes/resumen-ruta-lateral";
import { ID_ROL_ESTUDIANTE } from "@/tipos/roles";

export function DisenoAutenticado() {
  const esEstudiante = obtenerUsuario()?.idRol === ID_ROL_ESTUDIANTE;

  return (
    <BarraNavegacion encabezadoLateral={esEstudiante ? <ResumenRutaLateral /> : undefined}>
      <Outlet />
    </BarraNavegacion>
  );
}
