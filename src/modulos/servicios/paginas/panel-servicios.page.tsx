// Panel de servicios activos del usuario autenticado.
// Cubre: RF-16, RNF-05 — CU-08
import { Link } from "react-router-dom";
import { Boton } from "@/componentes-comunes/boton";
import { TarjetaServicio } from "../componentes/tarjeta-servicio";
import { useServicios } from "../hooks/use-servicios";

export function PanelServiciosPage() {
  const { data: servicios, isLoading, isError } = useServicios();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-texto">Mis servicios</h1>
        <Link to="/servicios/nuevo">
          <Boton>Crear servicio</Boton>
        </Link>
      </div>

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
          Aun no tienes servicios. Crea el primero para comenzar.
        </p>
      ) : null}

      {servicios && servicios.length > 0 ? (
        <div className="flex flex-col gap-sm">
          {servicios.map((servicio) => (
            <TarjetaServicio key={servicio.idServicio} servicio={servicio} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
