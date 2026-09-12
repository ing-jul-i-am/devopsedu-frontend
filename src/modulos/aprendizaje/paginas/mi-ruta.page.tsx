// Vista "Mi ruta": ruta de aprendizaje asignada al estudiante y su progreso.
// Cubre: RF-22, RNF-05 — CU-13
import { Link } from "react-router-dom";
import { useMiRuta } from "../hooks/use-mi-ruta";

export function MiRutaPage() {
  const { data: miRuta, isLoading, isError } = useMiRuta();

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
            {[...miRuta.modulos]
              .sort((a, b) => a.ordenSecuencia - b.ordenSecuencia)
              .map((modulo) => (
                <li key={modulo.idModulo}>
                  <Link
                    to={`/aprendizaje/modulos/${modulo.idModulo}`}
                    className="block rounded-md border border-borde p-sm text-texto hover:bg-fondo"
                  >
                    {modulo.nombre}
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      ) : null}
    </main>
  );
}
