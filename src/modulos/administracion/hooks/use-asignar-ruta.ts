// Mutacion de TanStack Query para POST /api/rutas. Al asignar, invalida el
// listado de estudiantes y el reporte de progreso, que cambian de ruta vigente
// (DT-20).
// Cubre: RF-21 — CU-11
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { RutaAsignada } from "@/tipos/aprendizaje";

export interface DatosAsignarRuta {
  idUsuario: number;
  idModulos: number[];
}

export function useAsignarRuta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datos: DatosAsignarRuta) => {
      const { data } = await clienteHttp.post<RutaAsignada>("/rutas", datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estudiantes"] });
      queryClient.invalidateQueries({ queryKey: ["reporte-progreso"] });
    },
  });
}
