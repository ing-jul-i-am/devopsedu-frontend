// Consulta de TanStack Query para GET /api/servicios/:idServicio.
// Cubre: RF-17 — CU-06, CU-07
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ServicioDetalle } from "@/tipos/servicio";

export function useServicio(idServicio: number) {
  return useQuery({
    queryKey: ["servicio", idServicio],
    queryFn: async () => {
      const { data } = await clienteHttp.get<ServicioDetalle>(`/servicios/${idServicio}`);
      return data;
    },
    enabled: Number.isFinite(idServicio),
  });
}
