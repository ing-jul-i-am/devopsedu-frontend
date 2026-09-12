// Vista de evaluacion de un modulo: preguntas de opcion multiple y
// retroalimentacion inmediata sin revelar la respuesta correcta.
// Cubre: RF-24, RNF-02, RNF-05 — CU-14
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useEvaluacionModulo } from "../hooks/use-evaluacion-modulo";
import { useResponderEvaluacion } from "../hooks/use-responder-evaluacion";
import type { ResultadoEvaluacion } from "@/tipos/aprendizaje";

export function EvaluacionModuloPage() {
  const { idModulo } = useParams<{ idModulo: string }>();
  const id = Number(idModulo);
  const { data: evaluacion, isLoading, isError, error } = useEvaluacionModulo(id);
  const responder = useResponderEvaluacion(id);

  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<ResultadoEvaluacion | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando evaluacion" className="p-lg text-texto-secundario">
        Cargando evaluacion...
      </p>
    );
  }

  if (isError || !evaluacion) {
    return <p className="p-lg text-peligro">{normalizarErrorApi(error).mensaje}</p>;
  }

  const todasRespondidas = evaluacion.preguntas.every((_, indice) => respuestas[indice] !== undefined);

  async function alEnviar() {
    setErrorEnvio(null);
    try {
      const cuerpo = (evaluacion?.preguntas ?? []).map((_, indice) => respuestas[indice] as number);
      const datos = await responder.mutateAsync(cuerpo);
      setResultado(datos);
    } catch (error) {
      setErrorEnvio(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">{evaluacion.titulo}</h1>

      {resultado ? (
        <section className="flex flex-col gap-sm rounded-md border border-borde p-md" aria-live="polite">
          <p className="text-lg font-medium text-texto">Puntuacion: {resultado.puntuacion}%</p>
          <p className={resultado.aprobado ? "text-exito" : "text-peligro"}>
            {resultado.aprobado ? "Evaluacion aprobada" : "Evaluacion no aprobada"}
          </p>
          <p className="text-sm text-texto-secundario">
            Intentos restantes: {resultado.intentosRestantes}
          </p>
          <ol className="flex flex-col gap-xs">
            {resultado.detalle.map((detalle, indice) => (
              <li key={indice} className="text-sm text-texto">
                Pregunta {indice + 1}: {detalle.correcta ? "Correcta" : "Incorrecta"}
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            void alEnviar();
          }}
          className="flex flex-col gap-md"
        >
          {evaluacion.preguntas.map((pregunta, indicePregunta) => (
            <fieldset key={indicePregunta} className="flex flex-col gap-xs rounded-md border border-borde p-sm">
              <legend className="text-sm font-medium text-texto">{pregunta.pregunta}</legend>
              {pregunta.opciones.map((opcion, indiceOpcion) => {
                const idOpcion = `pregunta-${indicePregunta}-opcion-${indiceOpcion}`;
                return (
                  <div key={idOpcion} className="flex items-center gap-xs">
                    <input
                      type="radio"
                      id={idOpcion}
                      name={`pregunta-${indicePregunta}`}
                      value={indiceOpcion}
                      checked={respuestas[indicePregunta] === indiceOpcion}
                      onChange={() =>
                        setRespuestas((anterior) => ({ ...anterior, [indicePregunta]: indiceOpcion }))
                      }
                    />
                    <label htmlFor={idOpcion} className="text-sm text-texto">
                      {opcion}
                    </label>
                  </div>
                );
              })}
            </fieldset>
          ))}

          {errorEnvio ? (
            <p role="alert" className="text-sm text-peligro">
              {errorEnvio}
            </p>
          ) : null}

          <Boton type="submit" disabled={!todasRespondidas} cargando={responder.isPending}>
            Enviar respuestas
          </Boton>
        </form>
      )}
    </main>
  );
}
