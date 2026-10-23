// Capacidad del servidor resumida en el panel principal: lo comprometido frente
// al total de CPU, memoria y almacenamiento, cada uno con su barra (DT-17).
// Cubre: RF-10, RNF-05 — CU-04
import { Link } from "react-router-dom";
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { useCapacidadServidor } from "@/modulos/servicios/hooks/use-capacidad-servidor";
import { formatearNucleos, formatearUsoMegabytes } from "@/utilidades/formatear-capacidad";

interface PropsRecurso {
  etiqueta: string;
  texto: string;
  valor: number;
  maximo: number;
  tono: "primario" | "memoria" | "almacenamiento";
}

function Recurso({ etiqueta, texto, valor, maximo, tono }: PropsRecurso) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between text-sm">
        <span className="text-texto-secundario">{etiqueta}</span>
        <span className="font-medium text-texto">{texto}</span>
      </div>
      <BarraProgreso etiqueta={etiqueta} valor={valor} maximo={maximo} tono={tono} />
    </div>
  );
}

export function TarjetaCapacidad() {
  const { data: capacidad, isLoading, isError } = useCapacidadServidor();

  return (
    <Tarjeta titulo="Capacidad del servidor">
      {isLoading ? (
        <p
          role="status"
          aria-label="Cargando capacidad del servidor"
          className="px-lg py-md text-texto-secundario"
        >
          Cargando capacidad del servidor...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="px-lg py-md text-peligro">
          No fue posible cargar la capacidad del servidor.
        </p>
      ) : null}

      {capacidad ? (
        <div className="flex flex-col gap-md px-lg py-md">
          <Recurso
            etiqueta="CPU"
            texto={`${formatearNucleos(capacidad.comprometido.cpu)} / ${formatearNucleos(capacidad.total.cpu)} vCPU`}
            valor={capacidad.comprometido.cpu}
            maximo={capacidad.total.cpu}
            tono="primario"
          />
          <Recurso
            etiqueta="Memoria"
            texto={formatearUsoMegabytes(capacidad.comprometido.memoria, capacidad.total.memoria)}
            valor={capacidad.comprometido.memoria}
            maximo={capacidad.total.memoria}
            tono="memoria"
          />
          <Recurso
            etiqueta="Almacenamiento"
            texto={formatearUsoMegabytes(
              capacidad.comprometido.almacenamiento,
              capacidad.total.almacenamiento
            )}
            valor={capacidad.comprometido.almacenamiento}
            maximo={capacidad.total.almacenamiento}
            tono="almacenamiento"
          />
          <Link
            to="/capacidad-servidor"
            className="self-start text-sm font-medium text-primario hover:underline"
          >
            Ver capacidad del servidor
          </Link>
        </div>
      ) : null}
    </Tarjeta>
  );
}
