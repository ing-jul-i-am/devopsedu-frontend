// Mutacion de TanStack Query para POST /api/servicios.
// Cubre: RF-05, RF-06, RF-09 — CU-03
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ConfiguracionServicio, Servicio } from "@/tipos/servicio";

export interface DatosCrearServicio {
  nombre: string;
  descripcion?: string | undefined;
  configuracion: ConfiguracionServicio;
}

export function useCrearServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datos: DatosCrearServicio) => {
      const { data } = await clienteHttp.post<Servicio>("/servicios", datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
}
