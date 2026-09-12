// Mutacion de TanStack Query para POST /api/modulos/:idModulo/evaluacion.
// Cubre: RF-24 — CU-14
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Evaluacion, PreguntaEvaluacion } from "@/tipos/aprendizaje";

export interface DatosEvaluacion {
  titulo: string;
  preguntas: PreguntaEvaluacion[];
  fechaDisponible: string;
}

export function useCrearEvaluacion(idModulo: number) {
  return useMutation({
    mutationFn: async (datos: DatosEvaluacion) => {
      const { data } = await clienteHttp.post<Evaluacion>(
        `/modulos/${idModulo}/evaluacion`,
        datos
      );
      return data;
    },
  });
}
