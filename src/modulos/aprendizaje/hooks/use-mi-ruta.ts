// Consulta de TanStack Query para GET /api/aprendizaje/mi-ruta.
// Cubre: RF-22 — CU-13
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { MiRuta } from "@/tipos/aprendizaje";

export function useMiRuta() {
  return useQuery({
    queryKey: ["aprendizaje", "mi-ruta"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<MiRuta | null>("/aprendizaje/mi-ruta");
      return data;
    },
  });
}
