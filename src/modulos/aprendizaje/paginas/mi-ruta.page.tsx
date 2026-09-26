// Vista "Mi ruta": ruta de aprendizaje asignada al estudiante y su progreso.
// Cubre: RF-22, RNF-05 — CU-13
import { Link } from "react-router-dom";
import { useMiRuta } from "../hooks/use-mi-ruta";
import { InsigniaEstadoModulo } from "../componentes/insignia-estado-modulo";

export function MiRutaPage() {
  const { data: miRuta, isLoading, isError } = useMiRuta();
  const modulosOrdenados = miRuta
    ? [...miRuta.modulos].sort((a, b) => a.ordenSecuencia - b.ordenSecuencia)
    : [];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Mi ruta de aprendizaje</h1>

      {isLoading ? (
        <p role="status" aria-label="Cargando mi ruta" className="text-texto-secundario">
          Cargando tu ruta de aprendizaje...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar tu ruta de aprendizaje.
        </p>
      ) : null}

      {!isLoading && !isError && !miRuta ? (
        <p className="text-texto-secundario">
          Aun no tienes una ruta de aprendizaje asignada. Tu docente debe asignarte una.
        </p>
      ) : null}

      {miRuta ? (
        <div className="flex flex-col gap-sm">
          <p className="text-sm text-texto-secundario">Progreso: {miRuta.progreso}%</p>
          <ol className="flex flex-col gap-sm">
            {modulosOrdenados.map((modulo, indice) => {
              const anterior = modulosOrdenados[indice - 1];
              const desbloqueado = !anterior || anterior.estado === "completado";

              return (
                <li key={modulo.idModulo}>
                  {desbloqueado ? (
                    <Link
                      to={`/aprendizaje/modulos/${modulo.idModulo}`}
                      className="flex items-center justify-between gap-sm rounded-md border border-borde p-sm text-texto hover:bg-fondo"
                    >
                      <span>{modulo.nombre}</span>
                      <InsigniaEstadoModulo estado={modulo.estado} />
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-xs rounded-md border border-borde bg-fondo p-sm text-texto-secundario">
                      <div className="flex items-center justify-between gap-sm">
                        <span>{modulo.nombre}</span>
                        <InsigniaEstadoModulo estado={modulo.estado} />
                      </div>
                      <p className="text-xs">Completa el modulo anterior para desbloquear este.</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </main>
  );
}
