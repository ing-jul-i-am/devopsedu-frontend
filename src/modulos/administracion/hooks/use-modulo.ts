// Consulta de TanStack Query para GET /api/modulos/:idModulo.
// Cubre: RF-20 — CU-10
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Modulo } from "@/tipos/aprendizaje";

export function useModulo(idModulo: number) {
  return useQuery({
    queryKey: ["modulos", idModulo],
    queryFn: async () => {
      const { data } = await clienteHttp.get<Modulo>(`/modulos/${idModulo}`);
      return data;
    },
    enabled: Number.isFinite(idModulo),
  });
}
