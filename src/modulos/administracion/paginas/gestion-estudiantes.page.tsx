// Gestion de estudiantes: asignacion de rutas de aprendizaje (RF-21, CU-11) y
// reseteo administrativo de contrasena (DT-08, sin RF/CU formal asignado).
// El docente elige al estudiante del listado de GET /api/usuarios/estudiantes
// (contrato 7.2) y ve su ruta vigente antes de asignar otra (DT-20, supera a
// DT-09). Sigue la linea visual del panel principal (DT-17).
// Cubre: RF-21, RF-25, RNF-03, RNF-04, RNF-05 — CU-11
import { useState } from "react";
import { Users } from "lucide-react";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CasillaVerificacion } from "@/componentes-comunes/casilla-verificacion";
import { Boton } from "@/componentes-comunes/boton";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import type { EstudianteListado } from "@/tipos/reportes";
import type { Modulo } from "@/tipos/aprendizaje";
import { useModulos } from "../hooks/use-modulos";
import { useEstudiantes } from "../hooks/use-estudiantes";
import { useAsignarRuta } from "../hooks/use-asignar-ruta";
import { useRestablecerContrasena } from "../hooks/use-restablecer-contrasena";
import { ProgresoRutaEstudiante } from "../componentes/progreso-ruta-estudiante";

function MensajeExito({ children }: { children: string }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-exito-borde bg-exito-suave px-md py-sm text-sm font-medium text-exito-texto"
    >
      {children}
    </p>
  );
}

function MensajeError({ children }: { children: string }) {
  return (
    <p role="alert" className="text-sm text-peligro">
      {children}
    </p>
  );
}

function SinEstudiantes() {
  return (
    <div className="flex flex-col items-center gap-sm px-lg py-xl text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primario-suave text-primario">
        <Users aria-hidden="true" className="h-6 w-6" />
      </span>
      <h3 className="font-semibold text-texto">No hay estudiantes registrados</h3>
      <p className="max-w-sm text-sm text-texto-secundario">
        Cuando tus estudiantes creen su cuenta desde la vista de registro, aparecerán aquí para
        asignarles una ruta.
      </p>
    </div>
  );
}

function RutaVigente({ estudiante }: { estudiante: EstudianteListado }) {
  return (
    <div className="flex flex-col gap-sm rounded-lg border border-borde bg-fondo px-md py-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
        Ruta vigente
      </p>
      <ProgresoRutaEstudiante nombreEstudiante={estudiante.nombre} ruta={estudiante.ruta} />
      <p className="text-xs text-texto-secundario">
        {estudiante.ruta
          ? "Si asignas una ruta nueva, pasará a ser su ruta vigente."
          : "Al asignarle una ruta, la verá en Mi ruta."}
      </p>
    </div>
  );
}

function OrdenRuta({ modulos, idModulos }: { modulos: Modulo[]; idModulos: number[] }) {
  return (
    <ol aria-label="Orden de la ruta" className="flex flex-col gap-xs">
      {idModulos.map((idModulo, indice) => (
        <li key={idModulo} className="flex items-center gap-sm text-sm text-texto">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-completo bg-primario-suave text-xs font-semibold text-primario">
            {indice + 1}
          </span>
          {modulos.find((modulo) => modulo.idModulo === idModulo)?.nombre}
        </li>
      ))}
    </ol>
  );
}

export function GestionEstudiantesPage() {
  const [idUsuario, setIdUsuario] = useState("");
  const [idModulosSeleccionados, setIdModulosSeleccionados] = useState<number[]>([]);
  const [mensajeRuta, setMensajeRuta] = useState<string | null>(null);
  const [errorRuta, setErrorRuta] = useState<string | null>(null);
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [mensajeContrasena, setMensajeContrasena] = useState<string | null>(null);
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null);

  const { data: modulos } = useModulos();
  const estudiantes = useEstudiantes();
  const asignarRuta = useAsignarRuta();
  const restablecerContrasena = useRestablecerContrasena();

  const estudianteElegido = estudiantes.data?.find(
    (estudiante) => String(estudiante.idUsuario) === idUsuario
  );

  function alternarModulo(idModulo: number) {
    setIdModulosSeleccionados((actuales) =>
      actuales.includes(idModulo)
        ? actuales.filter((id) => id !== idModulo)
        : [...actuales, idModulo]
    );
  }

  async function alAsignarRuta(evento: React.FormEvent) {
    evento.preventDefault();
    setMensajeRuta(null);
    setErrorRuta(null);
    try {
      await asignarRuta.mutateAsync({
        idUsuario: Number(idUsuario),
        idModulos: idModulosSeleccionados,
      });
      setMensajeRuta("Ruta asignada correctamente.");
    } catch (error) {
      setErrorRuta(normalizarErrorApi(error).mensaje);
    }
  }

  async function alRestablecerContrasena() {
    setMensajeContrasena(null);
    setErrorContrasena(null);
    try {
      await restablecerContrasena.mutateAsync({
        idUsuario: Number(idUsuario),
        contrasenaNueva,
      });
      setMensajeContrasena("Contraseña actualizada correctamente.");
    } catch (error) {
      setErrorContrasena(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <div className="flex flex-col gap-lg p-xl">
      <div className="flex flex-col gap-xs">
        <h1 className="text-3xl font-semibold text-texto">Gestión de estudiantes</h1>
        <p className="text-texto-secundario">
          Asigna rutas de aprendizaje y restablece contraseñas de tus estudiantes.
        </p>
      </div>

      <Tarjeta
        titulo="Selección de estudiante"
        subtitulo={
          <p className="text-sm text-texto-secundario">
            Elige al estudiante sobre el que vas a trabajar.
          </p>
        }
      >
        {estudiantes.isLoading ? (
          <p
            role="status"
            aria-label="Cargando estudiantes"
            className="px-lg py-md text-texto-secundario"
          >
            Cargando estudiantes...
          </p>
        ) : null}

        {estudiantes.isError ? (
          <p role="alert" className="px-lg py-md text-peligro">
            No fue posible cargar el listado de estudiantes.
          </p>
        ) : null}

        {estudiantes.data && estudiantes.data.length === 0 ? <SinEstudiantes /> : null}

        {estudiantes.data && estudiantes.data.length > 0 ? (
          <div className="grid gap-md px-lg py-md md:grid-cols-2">
            <CampoSelector
              etiqueta="Estudiante"
              placeholder="Selecciona un estudiante"
              opciones={estudiantes.data.map((estudiante) => ({
                valor: String(estudiante.idUsuario),
                etiqueta: `${estudiante.nombre} (${estudiante.correo})`,
              }))}
              value={idUsuario}
              onChange={(evento) => setIdUsuario(evento.target.value)}
            />
            {estudianteElegido ? <RutaVigente estudiante={estudianteElegido} /> : null}
          </div>
        ) : null}
      </Tarjeta>

      <div className="grid gap-lg lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tarjeta
            titulo="Asignar ruta de aprendizaje"
            subtitulo={
              <p className="text-sm text-texto-secundario">
                Marca los módulos en el orden en que el estudiante debe cursarlos.
              </p>
            }
          >
            <form
              onSubmit={(evento) => void alAsignarRuta(evento)}
              className="flex flex-col gap-md px-lg py-md"
            >
              {modulos && modulos.length === 0 ? (
                <p className="text-sm text-texto-secundario">Aún no hay módulos creados.</p>
              ) : null}
              <div className="grid gap-md sm:grid-cols-2">
                <fieldset className="flex flex-col gap-xs">
                  <legend className="mb-xs text-sm font-medium text-texto">Módulos</legend>
                  {modulos?.map((modulo) => (
                    <CasillaVerificacion
                      key={modulo.idModulo}
                      etiqueta={modulo.nombre}
                      checked={idModulosSeleccionados.includes(modulo.idModulo)}
                      onChange={() => alternarModulo(modulo.idModulo)}
                    />
                  ))}
                </fieldset>
                {modulos && idModulosSeleccionados.length > 0 ? (
                  <div className="flex flex-col gap-xs">
                    <p className="text-sm font-medium text-texto">Orden de la ruta</p>
                    <OrdenRuta modulos={modulos} idModulos={idModulosSeleccionados} />
                  </div>
                ) : null}
              </div>
              {mensajeRuta ? <MensajeExito>{mensajeRuta}</MensajeExito> : null}
              {errorRuta ? <MensajeError>{errorRuta}</MensajeError> : null}
              <div>
                <Boton
                  type="submit"
                  disabled={!estudianteElegido || idModulosSeleccionados.length === 0}
                  cargando={asignarRuta.isPending}
                >
                  Asignar ruta
                </Boton>
              </div>
            </form>
          </Tarjeta>
        </div>

        <Tarjeta
          titulo="Restablecer contraseña"
          subtitulo={
            <p className="text-sm text-texto-secundario">
              Úsalo si el estudiante olvidó su contraseña.
            </p>
          }
        >
          <div className="flex flex-col gap-md px-lg py-md">
            <CampoTexto
              etiqueta="Nueva contraseña"
              type="password"
              value={contrasenaNueva}
              onChange={(evento) => setContrasenaNueva(evento.target.value)}
            />
            {mensajeContrasena ? <MensajeExito>{mensajeContrasena}</MensajeExito> : null}
            {errorContrasena ? <MensajeError>{errorContrasena}</MensajeError> : null}
            <BotonAccionCritica
              textoBoton="Restablecer contraseña"
              tituloDialogo={`Restablecer la contraseña de ${estudianteElegido?.nombre ?? "este estudiante"}`}
              descripcionDialogo="El estudiante perderá acceso con su contraseña anterior de inmediato. Esta acción no se puede deshacer."
              textoConfirmacion="Restablecer"
              disabled={!estudianteElegido || !contrasenaNueva}
              cargando={restablecerContrasena.isPending}
              onConfirmar={() => void alRestablecerContrasena()}
            />
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
