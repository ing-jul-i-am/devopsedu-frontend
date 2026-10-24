// Consulta de TanStack Query para GET /api/reportes/progreso?idUsuario=N
// (contrato 8b.1): detalle del progreso de un estudiante por modulo. Solo se
// pide con un estudiante elegido; la lista de todos usa el listado 7.2
// (DT-18).
// Cubre: RF-25 — CU-15
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ReporteProgresoEstudiante } from "@/tipos/reportes";

export function useReporteProgreso(idUsuario: number | null) {
  return useQuery({
    queryKey: ["reporte-progreso", idUsuario],
    queryFn: async () => {
      const { data } = await clienteHttp.get<ReporteProgresoEstudiante[]>(
        "/reportes/progreso",
        {
          params: { idUsuario },
        }
      );
      return data[0] ?? null;
    },
    enabled: idUsuario !== null,
  });
}
