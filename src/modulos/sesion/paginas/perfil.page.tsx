// Vista de perfil y cierre de sesion.
// Cubre: RF-03, RNF-05 — CU-02. RF-04 (edicion de perfil) no tiene endpoint
// implementado todavia en el backend, ver DT-02 en docs/decisiones-tecnicas.md:
// esta vista solo muestra los datos ya disponibles en la sesion.
import { useNavigate } from "react-router-dom";
import { Boton } from "@/componentes-comunes/boton";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { useCerrarSesion } from "../hooks/use-cerrar-sesion";

export function PerfilPage() {
  const usuario = obtenerUsuario();
  const navegar = useNavigate();
  const cerrarSesion = useCerrarSesion();

  async function alCerrarSesion() {
    await cerrarSesion.mutateAsync().catch(() => undefined);
    navegar("/iniciar-sesion", { replace: true });
  }

  if (!usuario) {
    return <p className="p-lg text-texto-secundario">No hay una sesion activa.</p>;
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Mi perfil</h1>
      <dl className="flex flex-col gap-sm">
        <div>
          <dt className="text-xs text-texto-secundario">Nombre</dt>
          <dd className="text-texto">{usuario.nombre}</dd>
        </div>
        <div>
          <dt className="text-xs text-texto-secundario">Correo</dt>
          <dd className="text-texto">{usuario.correo}</dd>
        </div>
        <div>
          <dt className="text-xs text-texto-secundario">Miembro desde</dt>
          <dd className="text-texto">
            {new Date(usuario.fechaRegistro).toLocaleDateString("es-GT")}
          </dd>
        </div>
      </dl>
      <Boton variante="secundario" cargando={cerrarSesion.isPending} onClick={alCerrarSesion}>
        Cerrar sesion
      </Boton>
    </main>
  );
}
