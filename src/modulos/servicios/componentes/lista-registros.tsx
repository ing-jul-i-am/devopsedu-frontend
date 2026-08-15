// Lista del historico de operaciones de un servicio. Reutilizada por el
// detalle de servicio (RF-17) y por Monitoreo > Historico de operaciones
// (RF-15, CU-09).
import type { RegistroDespliegue } from "@/tipos/servicio";

interface Props {
  registros: RegistroDespliegue[];
}

export function ListaRegistros({ registros }: Props) {
  if (registros.length === 0) {
    return <p className="text-texto-secundario">Aun no hay operaciones registradas.</p>;
  }

  return (
    <ul className="flex flex-col gap-sm">
      {registros.map((registro) => (
        <li
          key={registro.idRegistro}
          className="rounded-md border border-borde p-sm text-sm text-texto"
        >
          <span className="font-medium">{registro.operacion}</span>{" "}
          <span className="text-texto-secundario">
            ({registro.resultado}) — {new Date(registro.fechaHora).toLocaleString("es-GT")}
          </span>
          {registro.mensajeError ? <p className="text-peligro">{registro.mensajeError}</p> : null}
        </li>
      ))}
    </ul>
  );
}
