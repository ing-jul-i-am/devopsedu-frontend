// Tarjeta resumen de un servicio en el panel de servicios activos.
// Cubre: RF-16, RF-17 — CU-08
import { Link } from "react-router-dom";
import { InsigniaEstado } from "@/componentes-comunes/insignia-estado";
import type { Servicio } from "@/tipos/servicio";

interface Props {
  servicio: Servicio;
}

export function TarjetaServicio({ servicio }: Props) {
  return (
    <article className="flex items-center justify-between gap-md rounded-md border border-borde bg-superficie p-md shadow-sm">
      <div className="flex flex-col gap-xs">
        <h3 className="font-medium text-texto">{servicio.nombre}</h3>
        <InsigniaEstado estado={servicio.estado} />
      </div>
      <Link to={`/servicios/${servicio.idServicio}`} className="text-sm text-primario underline">
        Ver detalle
      </Link>
    </article>
  );
}
