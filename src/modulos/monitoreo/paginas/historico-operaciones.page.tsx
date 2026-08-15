// Vista de historico de operaciones: el usuario elige uno de sus servicios
// y se muestra su historial (ver DT-06: no existe un endpoint global de
// historico, solo registros anidados por servicio).
// Cubre: RF-15, RNF-05 — CU-09
import { useState } from "react";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { ListaRegistros } from "@/modulos/servicios/componentes/lista-registros";
import { useServicios } from "@/modulos/servicios/hooks/use-servicios";
import { useServicio } from "@/modulos/servicios/hooks/use-servicio";

export function HistoricoOperacionesPage() {
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const { data: servicios, isLoading, isError } = useServicios();
  const detalle = useServicio(idSeleccionado ?? NaN);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Historico de operaciones</h1>

      {isLoading ? (
        <p role="status" aria-label="Cargando servicios" className="text-texto-secundario">
          Cargando servicios...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar tus servicios.
        </p>
      ) : null}

      {!isLoading && !isError && servicios && servicios.length === 0 ? (
        <p className="text-texto-secundario">
          Aun no tienes servicios. Crea uno para consultar su historico.
        </p>
      ) : null}

      {servicios && servicios.length > 0 ? (
        <CampoSelector
          etiqueta="Selecciona un servicio"
          placeholder="Elige un servicio"
          opciones={servicios.map((servicio) => ({
            valor: String(servicio.idServicio),
            etiqueta: servicio.nombre,
          }))}
          value={idSeleccionado !== null ? String(idSeleccionado) : ""}
          onChange={(evento) =>
            setIdSeleccionado(evento.target.value ? Number(evento.target.value) : null)
          }
        />
      ) : null}

      {idSeleccionado !== null && detalle.isLoading ? (
        <p role="status" aria-label="Cargando historial" className="text-texto-secundario">
          Cargando historial...
        </p>
      ) : null}

      {idSeleccionado !== null && detalle.isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar el historial de este servicio.
        </p>
      ) : null}

      {detalle.data ? <ListaRegistros registros={detalle.data.registros} /> : null}
    </div>
  );
}
