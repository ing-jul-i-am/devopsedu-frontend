// Reportes de progreso del docente: lista de todos los estudiantes con el
// avance de su ruta y, al elegir uno, el detalle por modulo. Reportes y
// Exportacion se sirven desde esta misma vista, y el estudiante elegido vive
// en la URL (?idUsuario=N) para poder compartirlo y recargarlo (DT-18). Sigue
// la linea visual del panel principal (DT-17).
// Cubre: RF-25, RNF-03, RNF-05 — CU-15
import { useSearchParams } from "react-router-dom";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { useEstudiantes } from "../hooks/use-estudiantes";
import { DetalleProgresoEstudiante } from "../componentes/detalle-progreso-estudiante";
import { ListaProgresoEstudiantes } from "../componentes/lista-progreso-estudiantes";
import { SinEstudiantes } from "../componentes/sin-estudiantes";
import { TarjetaResumenGrupo } from "../componentes/tarjeta-resumen-grupo";

function leerIdUsuario(valor: string | null): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function ReportesPage() {
  const [parametros, setParametros] = useSearchParams();
  const idUsuario = leerIdUsuario(parametros.get("idUsuario"));
  const { data: estudiantes, isLoading, isError } = useEstudiantes();

  function alElegirEstudiante(valor: string) {
    setParametros(valor ? { idUsuario: valor } : {});
  }

  return (
    <div className="flex flex-col gap-lg p-xl">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="text-3xl font-semibold text-texto">Reportes de progreso</h1>
          <p className="text-texto-secundario">
            Consulta el avance de tus estudiantes y descárgalo en CSV o PDF.
          </p>
        </div>
        {estudiantes && estudiantes.length > 0 ? (
          <div className="w-full sm:w-80">
            <CampoSelector
              etiqueta="Estudiante"
              placeholder="Todos los estudiantes"
              opciones={estudiantes.map((estudiante) => ({
                valor: String(estudiante.idUsuario),
                etiqueta: `${estudiante.nombre} (${estudiante.correo})`,
              }))}
              value={idUsuario === null ? "" : String(idUsuario)}
              onChange={(evento) => alElegirEstudiante(evento.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-lg lg:grid-cols-3">
        <div className="flex flex-col gap-lg lg:col-span-2">
          {idUsuario !== null ? (
            <DetalleProgresoEstudiante idUsuario={idUsuario} />
          ) : (
            <>
              {isLoading || isError || (estudiantes && estudiantes.length === 0) ? (
                <Tarjeta titulo="Estudiantes">
                  {isLoading ? (
                    <p
                      role="status"
                      aria-label="Cargando estudiantes"
                      className="px-lg py-md text-texto-secundario"
                    >
                      Cargando estudiantes...
                    </p>
                  ) : null}
                  {isError ? (
                    <p role="alert" className="px-lg py-md text-peligro">
                      No fue posible cargar el listado de estudiantes.
                    </p>
                  ) : null}
                  {estudiantes && estudiantes.length === 0 ? <SinEstudiantes /> : null}
                </Tarjeta>
              ) : null}
              {estudiantes && estudiantes.length > 0 ? (
                <ListaProgresoEstudiantes estudiantes={estudiantes} />
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-col gap-lg">
          {idUsuario === null && estudiantes && estudiantes.length > 0 ? (
            <TarjetaResumenGrupo estudiantes={estudiantes} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
