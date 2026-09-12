// Mutacion de TanStack Query para POST /api/aprendizaje/modulos/:idModulo/evaluacion.
// Cubre: RF-24 — CU-14
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ResultadoEvaluacion } from "@/tipos/aprendizaje";

export function useResponderEvaluacion(idModulo: number) {
  return useMutation({
    mutationFn: async (respuestas: number[]) => {
      const { data } = await clienteHttp.post<ResultadoEvaluacion>(
        `/aprendizaje/modulos/${idModulo}/evaluacion`,
        { respuestas }
      );
      return data;
    },
  });
}
