// Vista de capacidad del servidor.
// Cubre: RF-10, RNF-05 — CU-04
import { MedidorCapacidad } from "@/componentes-comunes/medidor-capacidad";
import { useCapacidadServidor } from "../hooks/use-capacidad-servidor";

export function CapacidadServidorPage() {
  const { data: capacidad, isLoading, isError } = useCapacidadServidor();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Capacidad del servidor</h1>

      {isLoading ? (
        <p
          role="status"
          aria-label="Cargando capacidad del servidor"
          className="text-texto-secundario"
        >
          Cargando capacidad del servidor...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar la capacidad del servidor.
        </p>
      ) : null}

      {capacidad ? (
        <div className="flex flex-col gap-md">
          <MedidorCapacidad
            etiqueta="CPU"
            total={capacidad.total.cpu}
            disponible={capacidad.disponible.cpu}
            unidad="nucleos"
          />
          <MedidorCapacidad
            etiqueta="Memoria"
            total={capacidad.total.memoria}
            disponible={capacidad.disponible.memoria}
            unidad="MB"
          />
          <MedidorCapacidad
            etiqueta="Almacenamiento"
            total={capacidad.total.almacenamiento}
            disponible={capacidad.disponible.almacenamiento}
            unidad="MB"
          />
        </div>
      ) : null}
    </main>
  );
}
