// Mutacion de TanStack Query para PUT /api/servicios/:idServicio/configuracion.
// El backend registra una nueva version de configuracion en vez de sobrescribir
// la anterior (contrato seccion 3.8).
// Cubre: RF-08 — CU-03
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ConfiguracionServicio, Servicio } from "@/tipos/servicio";

export function useEditarConfiguracion(idServicio: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configuracion: ConfiguracionServicio) => {
      const { data } = await clienteHttp.put<Servicio>(
        `/servicios/${idServicio}/configuracion`,
        { configuracion }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicio", idServicio] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
}
