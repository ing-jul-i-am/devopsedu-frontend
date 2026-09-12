// Consulta de TanStack Query para GET /api/aprendizaje/modulos/:idModulo/evaluacion.
// Cubre: RF-24 — CU-14
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { EvaluacionEstudiante } from "@/tipos/aprendizaje";

export function useEvaluacionModulo(idModulo: number) {
  return useQuery({
    queryKey: ["aprendizaje", "modulos", idModulo, "evaluacion"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<EvaluacionEstudiante>(
        `/aprendizaje/modulos/${idModulo}/evaluacion`
      );
      return data;
    },
  });
}
