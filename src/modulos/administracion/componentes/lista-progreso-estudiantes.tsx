// Lista de todos los estudiantes con el progreso de su ruta vigente, a partir
// del listado 7.2 (DT-18). Cada nombre enlaza al detalle del estudiante en la
// misma vista (?idUsuario=N). Filas con la composicion de "Mis servicios" del
// panel principal (DT-17).
// Cubre: RF-25, RNF-03, RNF-05 — CU-15
import { Link } from "react-router-dom";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import type { EstudianteListado } from "@/tipos/reportes";
import { resumirGrupo } from "../utilidades/resumen-grupo";
import { InicialEstudiante } from "./inicial-estudiante";
import { ProgresoRutaEstudiante } from "./progreso-ruta-estudiante";

interface Props {
  estudiantes: EstudianteListado[];
}

function conPlural(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

export function ListaProgresoEstudiantes({ estudiantes }: Props) {
  const { total, conRuta } = resumirGrupo(estudiantes);

  return (
    <Tarjeta
      titulo="Estudiantes"
      subtitulo={
        <p className="text-sm text-texto-secundario">
          {conPlural(total, "estudiante", "estudiantes")} · {conRuta} con ruta asignada
        </p>
      }
    >
      <ul className="divide-y divide-borde">
        {estudiantes.map((estudiante) => (
          <li
            key={estudiante.idUsuario}
            className="flex flex-wrap items-center justify-between gap-md px-lg py-md"
          >
            <div className="flex min-w-0 items-center gap-sm">
              <InicialEstudiante nombre={estudiante.nombre} />
              <div className="flex min-w-0 flex-col">
                <Link
                  to={{ search: `?idUsuario=${estudiante.idUsuario}` }}
                  className="font-medium text-texto hover:text-primario hover:underline"
                >
                  {estudiante.nombre}
                </Link>
                <span className="truncate text-xs text-texto-secundario">
                  {estudiante.correo}
                </span>
              </div>
            </div>
            <div className="flex w-full sm:w-64">
              <ProgresoRutaEstudiante
                nombreEstudiante={estudiante.nombre}
                ruta={estudiante.ruta}
              />
            </div>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
