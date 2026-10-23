// Resumen del progreso de la ruta de aprendizaje en la barra lateral. Solo se
// monta para el estudiante (ver diseno-autenticado.tsx); sin ruta asignada, o
// mientras carga o si falla la consulta, no muestra nada (DT-17).
// Cubre: RF-22, RNF-05 — CU-13
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";
import { useMiRuta } from "../hooks/use-mi-ruta";
import { contarModulosCompletados } from "../utilidades/progreso-ruta";

export function ResumenRutaLateral() {
  const { data: miRuta } = useMiRuta();

  if (!miRuta) {
    return null;
  }

  const completados = contarModulosCompletados(miRuta);

  return (
    <div className="flex flex-col gap-sm border-b border-borde p-md">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span className="text-texto-secundario">Mi ruta</span>
        <span className="text-primario">{Math.round(miRuta.progreso)}%</span>
      </div>
      <BarraProgreso etiqueta="Progreso de mi ruta" valor={miRuta.progreso} maximo={100} />
      <p className="text-xs text-texto-secundario">
        {completados} de {miRuta.modulos.length} módulos completados
      </p>
    </div>
  );
}
