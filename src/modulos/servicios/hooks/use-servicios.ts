// Consulta de TanStack Query para GET /api/servicios.
// Cubre: RF-16 — CU-08
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Servicio } from "@/tipos/servicio";

export function useServicios() {
  return useQuery({
    queryKey: ["servicios"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<Servicio[]>("/servicios");
      return data;
    },
  });
}
