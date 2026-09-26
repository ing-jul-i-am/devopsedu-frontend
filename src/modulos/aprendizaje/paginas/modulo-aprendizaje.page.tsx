// Vista de contenido de un modulo de aprendizaje: bloques de texto, imagen,
// enlace y actividad, y marca de inicio para el calculo de tiempoEmpleado.
// Tambien impide el acceso directo por URL a un modulo cuyo predecesor en la
// ruta no este completado (RF-22), reforzando el bloqueo que ya aplica "Mi
// ruta" al no ofrecer el enlace.
// Cubre: RF-22, RF-23, RNF-02, RNF-05 — CU-12
import { useEffect } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useModuloAprendizaje } from "../hooks/use-modulo-aprendizaje";
import { useIniciarModulo } from "../hooks/use-iniciar-modulo";
import { useEvaluacionModulo } from "../hooks/use-evaluacion-modulo";
import { useMiRuta } from "../hooks/use-mi-ruta";
import { BloqueContenido } from "../componentes/bloque-contenido";

export function ModuloAprendizajePage() {
  const { idModulo } = useParams<{ idModulo: string }>();
  const id = Number(idModulo);
  const { data: modulo, isLoading, isError, error } = useModuloAprendizaje(id);
  const { data: miRuta, isLoading: cargandoMiRuta } = useMiRuta();
  const iniciarModulo = useIniciarModulo(id);
  const evaluacion = useEvaluacionModulo(id);
  const evaluacionNoExiste =
    evaluacion.isError && isAxiosError(evaluacion.error) && evaluacion.error.response?.status === 404;

  const modulosOrdenados = miRuta
    ? [...miRuta.modulos].sort((a, b) => a.ordenSecuencia - b.ordenSecuencia)
    : [];
  const indiceActual = modulosOrdenados.findIndex((m) => m.idModulo === id);
  const anterior = indiceActual > 0 ? modulosOrdenados[indiceActual - 1] : undefined;
  const bloqueado = Boolean(anterior && anterior.estado !== "completado");
  const puedeIniciar = !cargandoMiRuta && !bloqueado;

  useEffect(() => {
    if (puedeIniciar) {
      iniciarModulo.mutate();
    }
    // Solo debe marcarse una vez al entrar al modulo, cuando esta desbloqueado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, puedeIniciar]);

  if (isLoading || cargandoMiRuta) {
    return (
      <p role="status" aria-label="Cargando modulo" className="p-lg text-texto-secundario">
        Cargando modulo...
      </p>
    );
  }

  if (isError || !modulo) {
    return <p className="p-lg text-peligro">{normalizarErrorApi(error).mensaje}</p>;
  }

  if (bloqueado) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
        <h1 className="text-2xl font-semibold text-texto">{modulo.nombre}</h1>
        <p className="text-texto-secundario">Completa el modulo anterior para acceder a este.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">{modulo.nombre}</h1>

      <div className="flex flex-col gap-md">
        {modulo.contenido.map((bloque, indice) => (
          <BloqueContenido key={indice} bloque={bloque} />
        ))}
      </div>

      {evaluacionNoExiste ? null : (
        <Link
          to={`/aprendizaje/modulos/${id}/evaluacion`}
          className="self-start rounded-md border border-borde px-md py-xs text-sm font-medium text-primario hover:bg-fondo"
        >
          Ver evaluacion del modulo
        </Link>
      )}
    </main>
  );
}
