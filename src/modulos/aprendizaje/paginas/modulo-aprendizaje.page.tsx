// Vista de contenido de un modulo de aprendizaje: bloques de texto, imagen,
// enlace y actividad, y marca de inicio para el calculo de tiempoEmpleado.
// Cubre: RF-23, RNF-02, RNF-05 — CU-12
import { useEffect } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useModuloAprendizaje } from "../hooks/use-modulo-aprendizaje";
import { useIniciarModulo } from "../hooks/use-iniciar-modulo";
import { useEvaluacionModulo } from "../hooks/use-evaluacion-modulo";
import { BloqueContenido } from "../componentes/bloque-contenido";

export function ModuloAprendizajePage() {
  const { idModulo } = useParams<{ idModulo: string }>();
  const id = Number(idModulo);
  const { data: modulo, isLoading, isError, error } = useModuloAprendizaje(id);
  const iniciarModulo = useIniciarModulo(id);
  const evaluacion = useEvaluacionModulo(id);
  const evaluacionNoExiste =
    evaluacion.isError && isAxiosError(evaluacion.error) && evaluacion.error.response?.status === 404;

  useEffect(() => {
    iniciarModulo.mutate();
    // Solo debe marcarse una vez al entrar al modulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando modulo" className="p-lg text-texto-secundario">
        Cargando modulo...
      </p>
    );
  }

  if (isError || !modulo) {
    return <p className="p-lg text-peligro">{normalizarErrorApi(error).mensaje}</p>;
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
