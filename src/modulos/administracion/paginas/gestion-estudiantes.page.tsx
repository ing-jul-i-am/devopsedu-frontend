// Gestion de estudiantes: asignacion de rutas de aprendizaje (RF-21, CU-11) y
// reseteo administrativo de contrasena (DT-08, sin RF/CU formal asignado).
// El contrato no expone ningun endpoint para listar usuarios/estudiantes, por
// lo que el docente identifica al estudiante con un id numerico ingresado a
// mano (ver DT-07 en docs/decisiones-tecnicas.md).
import { useState } from "react";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CasillaVerificacion } from "@/componentes-comunes/casilla-verificacion";
import { Boton } from "@/componentes-comunes/boton";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useModulos } from "../hooks/use-modulos";
import { useAsignarRuta } from "../hooks/use-asignar-ruta";
import { useRestablecerContrasena } from "../hooks/use-restablecer-contrasena";

export function GestionEstudiantesPage() {
  const [idUsuario, setIdUsuario] = useState("");
  const [idModulosSeleccionados, setIdModulosSeleccionados] = useState<number[]>([]);
  const [mensajeRuta, setMensajeRuta] = useState<string | null>(null);
  const [errorRuta, setErrorRuta] = useState<string | null>(null);
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [mensajeContrasena, setMensajeContrasena] = useState<string | null>(null);
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null);

  const { data: modulos } = useModulos();
  const asignarRuta = useAsignarRuta();
  const restablecerContrasena = useRestablecerContrasena();

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
      setMensajeContrasena("Contrasena actualizada correctamente.");
    } catch (error) {
      setErrorContrasena(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-lg p-lg">
      <h1 className="text-2xl font-semibold text-texto">Gestion de estudiantes</h1>

      <CampoTexto
        etiqueta="Id del estudiante"
        type="number"
        textoAyuda="El contrato no expone un listado de usuarios; ingresa el id conocido del estudiante."
        value={idUsuario}
        onChange={(evento) => setIdUsuario(evento.target.value)}
      />

      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-medium text-texto">Asignar ruta de aprendizaje</h2>
        <form onSubmit={(evento) => void alAsignarRuta(evento)} className="flex flex-col gap-sm">
          <div className="flex flex-col gap-xs">
            {modulos?.map((modulo) => (
              <CasillaVerificacion
                key={modulo.idModulo}
                etiqueta={modulo.nombre}
                checked={idModulosSeleccionados.includes(modulo.idModulo)}
                onChange={() => alternarModulo(modulo.idModulo)}
              />
            ))}
          </div>
          {idModulosSeleccionados.length > 0 ? (
            <ol className="text-sm text-texto-secundario">
              {idModulosSeleccionados.map((idModulo, indice) => (
                <li key={idModulo}>
                  {indice + 1}. {modulos?.find((m) => m.idModulo === idModulo)?.nombre}
                </li>
              ))}
            </ol>
          ) : null}
          {mensajeRuta ? (
            <p role="status" className="text-sm text-exito">
              {mensajeRuta}
            </p>
          ) : null}
          {errorRuta ? (
            <p role="alert" className="text-sm text-peligro">
              {errorRuta}
            </p>
          ) : null}
          <Boton
            type="submit"
            disabled={!idUsuario || idModulosSeleccionados.length === 0}
            cargando={asignarRuta.isPending}
          >
            Asignar ruta
          </Boton>
        </form>
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-medium text-texto">Restablecer contrasena</h2>
        <CampoTexto
          etiqueta="Nueva contrasena"
          type="password"
          value={contrasenaNueva}
          onChange={(evento) => setContrasenaNueva(evento.target.value)}
        />
        {mensajeContrasena ? (
          <p role="status" className="text-sm text-exito">
            {mensajeContrasena}
          </p>
        ) : null}
        {errorContrasena ? (
          <p role="alert" className="text-sm text-peligro">
            {errorContrasena}
          </p>
        ) : null}
        <BotonAccionCritica
          textoBoton="Restablecer contrasena"
          tituloDialogo="Restablecer la contrasena de este estudiante"
          descripcionDialogo="El estudiante perdera acceso con su contrasena anterior de inmediato. Esta accion no se puede deshacer."
          textoConfirmacion="Restablecer"
          disabled={!idUsuario || !contrasenaNueva}
          cargando={restablecerContrasena.isPending}
          onConfirmar={() => void alRestablecerContrasena()}
        />
      </section>
    </main>
  );
}
