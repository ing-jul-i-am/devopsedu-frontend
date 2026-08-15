// Vista de detalle de un servicio: estado, acciones de ciclo de vida y
// historico de operaciones.
// Cubre: RF-12, RF-13, RF-14, RF-17, RNF-04, RNF-05 — CU-06, CU-07
import { useParams } from "react-router-dom";
import { InsigniaEstado } from "@/componentes-comunes/insignia-estado";
import { Boton } from "@/componentes-comunes/boton";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";
import { ESTADOS_ORIGEN_VALIDOS } from "@/tipos/servicio";
import { ListaRegistros } from "../componentes/lista-registros";
import { useServicio } from "../hooks/use-servicio";
import {
  useDesplegarServicio,
  useDetenerServicio,
  useReiniciarServicio,
  useEliminarServicio,
} from "../hooks/use-acciones-servicio";

export function DetalleServicioPage() {
  const { idServicio } = useParams<{ idServicio: string }>();
  const id = Number(idServicio);
  const { data: servicio, isLoading, isError } = useServicio(id);

  const desplegar = useDesplegarServicio(id);
  const detener = useDetenerServicio(id);
  const reiniciar = useReiniciarServicio(id);
  const eliminar = useEliminarServicio(id);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando servicio" className="p-lg text-texto-secundario">
        Cargando servicio...
      </p>
    );
  }

  if (isError || !servicio) {
    return <p className="p-lg text-peligro">Servicio no encontrado.</p>;
  }

  const estado = servicio.estado;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="text-2xl font-semibold text-texto">{servicio.nombre}</h1>
        <InsigniaEstado estado={estado} />
      </div>

      {servicio.descripcion ? (
        <p className="text-texto-secundario">{servicio.descripcion}</p>
      ) : null}

      <div className="flex flex-wrap gap-sm">
        <Boton
          disabled={!ESTADOS_ORIGEN_VALIDOS.desplegar.includes(estado)}
          cargando={desplegar.isPending}
          onClick={() => desplegar.mutate()}
        >
          Desplegar
        </Boton>
        <Boton
          variante="secundario"
          disabled={!ESTADOS_ORIGEN_VALIDOS.detener.includes(estado)}
          cargando={detener.isPending}
          onClick={() => detener.mutate()}
        >
          Detener
        </Boton>
        <Boton
          variante="secundario"
          disabled={!ESTADOS_ORIGEN_VALIDOS.reiniciar.includes(estado)}
          cargando={reiniciar.isPending}
          onClick={() => reiniciar.mutate()}
        >
          Reiniciar
        </Boton>
        <BotonAccionCritica
          textoBoton="Eliminar servicio"
          tituloDialogo="Eliminar este servicio"
          descripcionDialogo="Se eliminara el servicio y se liberaran los recursos asociados. Esta accion no se puede deshacer."
          textoConfirmacion="Eliminar"
          disabled={!ESTADOS_ORIGEN_VALIDOS.eliminar.includes(estado)}
          cargando={eliminar.isPending}
          onConfirmar={() => eliminar.mutate()}
        />
      </div>

      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-medium text-texto">Historico de operaciones</h2>
        <ListaRegistros registros={servicio.registros} />
      </section>
    </main>
  );
}
