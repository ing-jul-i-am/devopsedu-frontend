// Formulario para crear la evaluacion de un modulo (RF-24, CU-14, ver DT-11
// del contrato). Cardinalidad 0-o-1 con el modulo: un segundo intento falla
// con 409 EvaluacionYaExisteError.
import { useState } from "react";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useCrearEvaluacion } from "../hooks/use-crear-evaluacion";
import type { PreguntaEvaluacion } from "@/tipos/aprendizaje";

interface Props {
  idModulo: number;
}

function preguntaVacia(): PreguntaEvaluacion {
  return { pregunta: "", opciones: ["", ""], respuestaCorrecta: 0 };
}

export function FormularioEvaluacion({ idModulo }: Props) {
  const [titulo, setTitulo] = useState("");
  const [fechaDisponible, setFechaDisponible] = useState("");
  const [preguntas, setPreguntas] = useState<PreguntaEvaluacion[]>([]);
  const [creada, setCreada] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const crearEvaluacion = useCrearEvaluacion(idModulo);

  function actualizarPregunta(indice: number, pregunta: PreguntaEvaluacion) {
    setPreguntas((actuales) => actuales.map((actual, i) => (i === indice ? pregunta : actual)));
  }

  async function alEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErrorEnvio(null);
    setCreada(false);
    try {
      await crearEvaluacion.mutateAsync({
        titulo,
        preguntas,
        fechaDisponible: new Date(fechaDisponible).toISOString(),
      });
      setCreada(true);
    } catch (error) {
      setErrorEnvio(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <form onSubmit={(evento) => void alEnviar(evento)} className="flex flex-col gap-md">
      <CampoTexto
        etiqueta="Titulo de la evaluacion"
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
      />
      <CampoTexto
        etiqueta="Fecha disponible"
        type="date"
        value={fechaDisponible}
        onChange={(evento) => setFechaDisponible(evento.target.value)}
      />

      {preguntas.map((pregunta, indicePregunta) => (
        <fieldset
          key={indicePregunta}
          className="flex flex-col gap-xs rounded-md border border-borde p-sm"
        >
          <legend className="text-sm font-medium text-texto">Pregunta {indicePregunta + 1}</legend>
          <CampoTexto
            etiqueta={`Pregunta ${indicePregunta + 1}`}
            value={pregunta.pregunta}
            onChange={(evento) =>
              actualizarPregunta(indicePregunta, { ...pregunta, pregunta: evento.target.value })
            }
          />
          {pregunta.opciones.map((opcion, indiceOpcion) => (
            <div key={indiceOpcion} className="flex items-center gap-xs">
              <CampoTexto
                etiqueta={`Opcion ${indiceOpcion + 1}`}
                value={opcion}
                onChange={(evento) => {
                  const opciones = pregunta.opciones.map((actual, i) =>
                    i === indiceOpcion ? evento.target.value : actual
                  );
                  actualizarPregunta(indicePregunta, { ...pregunta, opciones });
                }}
              />
              <input
                type="radio"
                aria-label={`Respuesta correcta: opcion ${indiceOpcion + 1}`}
                name={`respuesta-correcta-${indicePregunta}`}
                checked={pregunta.respuestaCorrecta === indiceOpcion}
                onChange={() =>
                  actualizarPregunta(indicePregunta, { ...pregunta, respuestaCorrecta: indiceOpcion })
                }
              />
            </div>
          ))}
          <div className="flex gap-xs">
            <Boton
              type="button"
              variante="secundario"
              disabled={pregunta.opciones.length >= 5}
              onClick={() =>
                actualizarPregunta(indicePregunta, {
                  ...pregunta,
                  opciones: [...pregunta.opciones, ""],
                })
              }
            >
              Agregar opcion
            </Boton>
            <Boton
              type="button"
              variante="secundario"
              disabled={pregunta.opciones.length <= 2}
              onClick={() =>
                actualizarPregunta(indicePregunta, {
                  ...pregunta,
                  opciones: pregunta.opciones.slice(0, -1),
                  respuestaCorrecta: Math.min(pregunta.respuestaCorrecta, pregunta.opciones.length - 2),
                })
              }
            >
              Quitar opcion
            </Boton>
          </div>
        </fieldset>
      ))}

      <Boton
        type="button"
        variante="secundario"
        disabled={preguntas.length >= 50}
        onClick={() => setPreguntas((actuales) => [...actuales, preguntaVacia()])}
      >
        Agregar pregunta
      </Boton>

      {creada ? (
        <p role="status" className="text-sm text-exito">
          Evaluacion creada correctamente.
        </p>
      ) : null}

      {errorEnvio ? (
        <p role="alert" className="text-sm text-peligro">
          {errorEnvio}
        </p>
      ) : null}

      <Boton type="submit" cargando={crearEvaluacion.isPending} disabled={preguntas.length === 0}>
        Crear evaluacion
      </Boton>
    </form>
  );
}
