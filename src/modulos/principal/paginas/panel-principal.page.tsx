// Panel principal: hub de navegacion tras autenticarse (dashboard inicial).
// Cubre: S-4.2.16, S-4.2.18 (hub principal) — RNF-03
import { Link } from "react-router-dom";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";

export function PanelPrincipalPage() {
  const usuario = obtenerUsuario();

  return (
    <div className="flex flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">
        Bienvenido{usuario ? `, ${usuario.nombre}` : ""}
      </h1>
      <div className="grid gap-md sm:grid-cols-2">
        <Link
          to="/servicios"
          className="rounded-md border border-borde bg-superficie p-md text-texto hover:bg-fondo"
        >
          <h2 className="font-medium">Mis servicios</h2>
          <p className="text-sm text-texto-secundario">
            Consulta y controla tus servicios activos.
          </p>
        </Link>
        <Link
          to="/servicios/nuevo"
          className="rounded-md border border-borde bg-superficie p-md text-texto hover:bg-fondo"
        >
          <h2 className="font-medium">Crear servicio</h2>
          <p className="text-sm text-texto-secundario">
            Configura y despliega un nuevo servicio.
          </p>
        </Link>
        <Link
          to="/capacidad-servidor"
          className="rounded-md border border-borde bg-superficie p-md text-texto hover:bg-fondo"
        >
          <h2 className="font-medium">Capacidad del servidor</h2>
          <p className="text-sm text-texto-secundario">Revisa los recursos disponibles.</p>
        </Link>
      </div>
    </div>
  );
}
