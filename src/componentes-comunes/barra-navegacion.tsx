// Patron unico de navegacion (RNF-03): barra superior con contexto del
// usuario y menu lateral con la seccion activa resaltada, presente en todas
// las vistas autenticadas (seccion 4.2.16-4.2.18 del documento de diseño).
// El menu solo enlaza a las areas ya implementadas (ver DT-05).
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

interface Enlace {
  hacia: string;
  etiqueta: string;
  fin: boolean;
  rolesPermitidos: number[] | null;
}

const ENLACES: Enlace[] = [
  { hacia: "/", etiqueta: "Panel principal", fin: true, rolesPermitidos: null },
  { hacia: "/servicios", etiqueta: "Mis servicios", fin: false, rolesPermitidos: null },
  {
    hacia: "/capacidad-servidor",
    etiqueta: "Capacidad del servidor",
    fin: false,
    rolesPermitidos: null,
  },
  { hacia: "/monitoreo/historico", etiqueta: "Historico", fin: false, rolesPermitidos: null },
  {
    hacia: "/monitoreo/metricas",
    etiqueta: "Graficas de metricas",
    fin: false,
    rolesPermitidos: null,
  },
  {
    hacia: "/aprendizaje/mi-ruta",
    etiqueta: "Mi ruta",
    fin: false,
    rolesPermitidos: [ID_ROL_ESTUDIANTE],
  },
  {
    hacia: "/administracion/modulos",
    etiqueta: "Modulos de aprendizaje",
    fin: false,
    rolesPermitidos: [ID_ROL_DOCENTE],
  },
  {
    hacia: "/administracion/estudiantes",
    etiqueta: "Gestion de estudiantes",
    fin: false,
    rolesPermitidos: [ID_ROL_DOCENTE],
  },
  { hacia: "/perfil", etiqueta: "Perfil", fin: false, rolesPermitidos: null },
];

function claseEnlace({ isActive }: { isActive: boolean }) {
  return isActive
    ? "rounded-md bg-primario px-sm py-xs text-sm font-medium text-primario-contraste"
    : "rounded-md px-sm py-xs text-sm font-medium text-texto hover:bg-fondo";
}

interface Props {
  children: ReactNode;
}

export function BarraNavegacion({ children }: Props) {
  const usuario = obtenerUsuario();
  const enlacesVisibles = ENLACES.filter(
    (enlace) => !enlace.rolesPermitidos || (usuario && enlace.rolesPermitidos.includes(usuario.idRol))
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-borde bg-superficie px-lg py-sm">
        <span className="text-lg font-semibold text-texto">DevOpsEdu</span>
        {usuario ? <span className="text-sm text-texto-secundario">{usuario.nombre}</span> : null}
      </header>
      <div className="flex flex-1">
        <nav
          aria-label="Navegacion principal"
          className="w-56 shrink-0 border-r border-borde bg-superficie p-md"
        >
          <ul className="flex flex-col gap-xs">
            {enlacesVisibles.map((enlace) => (
              <li key={enlace.hacia}>
                <NavLink to={enlace.hacia} end={enlace.fin} className={claseEnlace}>
                  {enlace.etiqueta}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
