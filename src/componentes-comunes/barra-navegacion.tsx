// Patron unico de navegacion (RNF-03): barra superior con contexto del
// usuario y menu lateral con iconos, agrupado por categorias y con la seccion
// activa resaltada, presente en todas las vistas autenticadas (seccion
// 4.2.16-4.2.18 del documento de diseño). El menu solo enlaza a las areas ya
// implementadas (ver DT-05) y oculta las categorias sin enlaces para el rol.
// `encabezadoLateral` permite que el enrutamiento inyecte contenido propio de
// un modulo (el resumen de la ruta) sin que este componente dependa de el
// (DT-17).
import { useId, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Gauge,
  History,
  LayoutGrid,
  LineChart,
  Route,
  Server,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

interface Enlace {
  hacia: string;
  etiqueta: string;
  icono: LucideIcon;
  fin: boolean;
  rolesPermitidos: number[] | null;
}

interface Categoria {
  titulo: string;
  enlaces: Enlace[];
}

const CATEGORIAS: Categoria[] = [
  {
    titulo: "General",
    enlaces: [
      { hacia: "/", etiqueta: "Panel principal", icono: LayoutGrid, fin: true, rolesPermitidos: null },
    ],
  },
  {
    titulo: "Aprendizaje",
    enlaces: [
      {
        hacia: "/aprendizaje/mi-ruta",
        etiqueta: "Mi ruta",
        icono: Route,
        fin: false,
        rolesPermitidos: [ID_ROL_ESTUDIANTE],
      },
    ],
  },
  {
    titulo: "Administración",
    enlaces: [
      {
        hacia: "/administracion/modulos",
        etiqueta: "Módulos de aprendizaje",
        icono: BookOpen,
        fin: false,
        rolesPermitidos: [ID_ROL_DOCENTE],
      },
      {
        hacia: "/administracion/estudiantes",
        etiqueta: "Gestión de estudiantes",
        icono: Users,
        fin: false,
        rolesPermitidos: [ID_ROL_DOCENTE],
      },
    ],
  },
  {
    titulo: "Entorno",
    enlaces: [
      { hacia: "/servicios", etiqueta: "Mis servicios", icono: Server, fin: false, rolesPermitidos: null },
      {
        hacia: "/capacidad-servidor",
        etiqueta: "Capacidad del servidor",
        icono: Gauge,
        fin: false,
        rolesPermitidos: null,
      },
    ],
  },
  {
    titulo: "Monitoreo",
    enlaces: [
      {
        hacia: "/monitoreo/historico",
        etiqueta: "Histórico",
        icono: History,
        fin: false,
        rolesPermitidos: null,
      },
      {
        hacia: "/monitoreo/metricas",
        etiqueta: "Gráficas de métricas",
        icono: LineChart,
        fin: false,
        rolesPermitidos: null,
      },
    ],
  },
  {
    titulo: "Cuenta",
    enlaces: [
      { hacia: "/perfil", etiqueta: "Perfil", icono: User, fin: false, rolesPermitidos: null },
    ],
  },
];

function claseEnlace({ isActive }: { isActive: boolean }) {
  const base =
    "flex items-center gap-sm rounded-lg border-l-4 px-sm py-sm text-sm transition-colors";
  return isActive
    ? `${base} border-primario bg-primario-suave font-medium text-primario`
    : `${base} border-transparent text-texto hover:bg-fondo`;
}

interface Props {
  children: ReactNode;
  encabezadoLateral?: ReactNode;
}

export function BarraNavegacion({ children, encabezadoLateral }: Props) {
  const prefijoId = useId();
  const usuario = obtenerUsuario();
  const categoriasVisibles = CATEGORIAS.map((categoria) => ({
    ...categoria,
    enlaces: categoria.enlaces.filter(
      (enlace) =>
        !enlace.rolesPermitidos || (usuario && enlace.rolesPermitidos.includes(usuario.idRol))
    ),
  })).filter((categoria) => categoria.enlaces.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-borde bg-superficie px-lg py-sm">
        <span className="text-lg font-semibold text-texto">DevOpsEdu</span>
        {usuario ? (
          <span className="flex items-center gap-sm">
            <span className="text-sm text-texto-secundario">{usuario.nombre}</span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-completo bg-primario-suave text-sm font-semibold text-primario"
            >
              {usuario.nombre.charAt(0).toUpperCase()}
            </span>
          </span>
        ) : null}
      </header>
      <div className="flex flex-1">
        <nav
          aria-label="Navegación principal"
          className="flex w-64 shrink-0 flex-col border-r border-borde bg-superficie"
        >
          {encabezadoLateral}
          <div className="flex flex-col gap-md p-md">
            {categoriasVisibles.map((categoria, indice) => {
              const idTitulo = `${prefijoId}-categoria-${indice}`;
              return (
                <div key={categoria.titulo} className="flex flex-col gap-xs">
                  <p
                    id={idTitulo}
                    className="px-sm text-xs font-semibold uppercase tracking-wide text-texto-secundario"
                  >
                    {categoria.titulo}
                  </p>
                  <ul aria-labelledby={idTitulo} className="flex flex-col gap-xs">
                    {categoria.enlaces.map(({ hacia, etiqueta, icono: Icono, fin }) => (
                      <li key={hacia}>
                        <NavLink to={hacia} end={fin} className={claseEnlace}>
                          <Icono aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {etiqueta}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
