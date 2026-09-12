// Panel de gestion de modulos de aprendizaje.
// Cubre: RF-20, RNF-05 — CU-10
import { Link } from "react-router-dom";
import { Boton } from "@/componentes-comunes/boton";
import { useModulos } from "../hooks/use-modulos";

export function PanelModulosPage() {
  const { data: modulos, isLoading, isError } = useModulos();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-texto">Modulos de aprendizaje</h1>
        <Link to="/administracion/modulos/nuevo">
          <Boton>Crear modulo</Boton>
        </Link>
      </div>

      {isLoading ? (
        <p role="status" aria-label="Cargando modulos" className="text-texto-secundario">
          Cargando modulos...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar los modulos.
        </p>
      ) : null}

      {!isLoading && !isError && modulos && modulos.length === 0 ? (
        <p className="text-texto-secundario">Aun no hay modulos creados.</p>
      ) : null}

      {modulos && modulos.length > 0 ? (
        <ol className="flex flex-col gap-sm">
          {[...modulos]
            .sort((a, b) => a.orden - b.orden)
            .map((modulo) => (
              <li key={modulo.idModulo}>
                <Link
                  to={`/administracion/modulos/${modulo.idModulo}`}
                  className="block rounded-md border border-borde p-sm text-texto hover:bg-fondo"
                >
                  {modulo.nombre}
                </Link>
              </li>
            ))}
        </ol>
      ) : null}
    </main>
  );
}
