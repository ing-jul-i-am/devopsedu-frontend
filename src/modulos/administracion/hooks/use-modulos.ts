// Consulta de TanStack Query para GET /api/modulos.
// Cubre: RF-20 — CU-10
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Modulo } from "@/tipos/aprendizaje";

export function useModulos() {
  return useQuery({
    queryKey: ["modulos"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<Modulo[]>("/modulos");
      return data;
    },
  });
}
