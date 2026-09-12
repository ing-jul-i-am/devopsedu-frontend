// Consulta de TanStack Query para GET /api/aprendizaje/modulos/:idModulo.
// Cubre: RF-23 — CU-12
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ModuloConContenido } from "@/tipos/aprendizaje";

export function useModuloAprendizaje(idModulo: number) {
  return useQuery({
    queryKey: ["aprendizaje", "modulos", idModulo],
    queryFn: async () => {
      const { data } = await clienteHttp.get<ModuloConContenido>(
        `/aprendizaje/modulos/${idModulo}`
      );
      return data;
    },
  });
}
