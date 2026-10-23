// Avance de la ruta de aprendizaje en el panel principal y acceso directo al
// primer modulo que falta completar ("Continua donde quedaste"). Solo se
// muestra al estudiante (ver panel-principal.page.tsx, DT-17).
// Cubre: RF-22, RNF-05 — CU-13
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";
import { EnlaceBoton } from "@/componentes-comunes/enlace-boton";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { useMiRuta } from "@/modulos/aprendizaje/hooks/use-mi-ruta";
import {
  buscarModuloParaContinuar,
  contarModulosCompletados,
} from "@/modulos/aprendizaje/utilidades/progreso-ruta";
import type { MiRuta } from "@/tipos/aprendizaje";

function BloqueContinuar({ miRuta }: { miRuta: MiRuta }) {
  const siguiente = buscarModuloParaContinuar(miRuta);

  if (!siguiente) {
    return (
      <div className="border-t border-exito-borde bg-exito-suave px-lg py-md">
        <p className="text-sm font-medium text-exito-texto">
          ¡Completaste tu ruta de aprendizaje! Puedes repasar cualquier módulo desde Mi ruta.
        </p>
      </div>
    );
  }

  const { modulo, posicion } = siguiente;
  const enProgreso = modulo.estado === "en_progreso";

  return (
    <div className="flex flex-col gap-sm border-t border-advertencia-borde bg-advertencia-suave px-lg py-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-advertencia-texto">
        Continúa donde quedaste
      </p>
      <p className="font-semibold text-texto">
        Módulo {posicion} · {modulo.nombre}
      </p>
      <p className="text-sm text-texto-secundario">
        {enProgreso ? "Tienes este módulo en progreso." : "Aún no inicias este módulo."}
      </p>
      <EnlaceBoton
        hacia={`/aprendizaje/modulos/${modulo.idModulo}`}
        variante="advertencia"
        anchoCompleto
      >
        {enProgreso ? "Continuar módulo" : "Comenzar módulo"}
      </EnlaceBoton>
    </div>
  );
}

export function TarjetaRutaAprendizaje() {
  const { data: miRuta, isLoading, isError } = useMiRuta();

  return (
    <Tarjeta
      titulo="Mi ruta de aprendizaje"
      acciones={
        miRuta ? (
          <span className="text-sm font-semibold text-primario">
            {Math.round(miRuta.progreso)}%
          </span>
        ) : null
      }
    >
      {isLoading ? (
        <p role="status" aria-label="Cargando mi ruta" className="px-lg py-md text-texto-secundario">
          Cargando tu ruta de aprendizaje...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="px-lg py-md text-peligro">
          No fue posible cargar tu ruta de aprendizaje.
        </p>
      ) : null}

      {!isLoading && !isError && !miRuta ? (
        <p className="px-lg py-md text-sm text-texto-secundario">
          Aún no tienes una ruta de aprendizaje asignada. Tu docente debe asignarte una.
        </p>
      ) : null}

      {miRuta ? (
        <>
          <div className="flex flex-col gap-sm px-lg py-md">
            <BarraProgreso etiqueta="Progreso de mi ruta" valor={miRuta.progreso} maximo={100} />
            <p className="text-sm text-texto-secundario">
              {contarModulosCompletados(miRuta)} de {miRuta.modulos.length} módulos completados
            </p>
          </div>
          <BloqueContinuar miRuta={miRuta} />
        </>
      ) : null}
    </Tarjeta>
  );
}
