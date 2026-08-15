// Consulta de TanStack Query para GET /api/servicios/:idServicio/metricas.
// Cubre: RF-18, RF-19
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Metrica } from "@/tipos/metrica";

export function useMetricasServicio(idServicio: number) {
  return useQuery({
    queryKey: ["metricas-servicio", idServicio],
    queryFn: async () => {
      const { data } = await clienteHttp.get<Metrica[]>(`/servicios/${idServicio}/metricas`);
      return data;
    },
    enabled: Number.isFinite(idServicio),
    refetchInterval: 5000,
  });
}
