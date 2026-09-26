// Mutaciones de TanStack Query para las acciones de ciclo de vida de un
// servicio (desplegar, detener, reiniciar, eliminar).
// Cubre: RF-11, RF-12, RF-13, RF-14 — CU-05, CU-06
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ResultadoOperacion, ServicioBasico } from "@/tipos/servicio";

function useInvalidarServicio(idServicio: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["servicio", idServicio] });
    queryClient.invalidateQueries({ queryKey: ["servicios"] });
  };
}

// detener y reiniciar devuelven ServicioBasico; desplegar y eliminar devuelven
// la forma extendida con el resultado de la limpieza del contenedor anterior
// (contrato 3.2, DT-15 del backend).
function useAccionServicio(accion: "detener" | "reiniciar", idServicio: number) {
  const invalidar = useInvalidarServicio(idServicio);
  return useMutation({
    mutationFn: async () => {
      const { data } = await clienteHttp.post<ServicioBasico>(
        `/servicios/${idServicio}/${accion}`
      );
      return data;
    },
    onSuccess: invalidar,
  });
}

export function useDesplegarServicio(idServicio: number) {
  const invalidar = useInvalidarServicio(idServicio);
  return useMutation({
    mutationFn: async () => {
      const { data } = await clienteHttp.post<ResultadoOperacion>(
        `/servicios/${idServicio}/desplegar`
      );
      return data;
    },
    onSuccess: invalidar,
  });
}

export function useDetenerServicio(idServicio: number) {
  return useAccionServicio("detener", idServicio);
}

export function useReiniciarServicio(idServicio: number) {
  return useAccionServicio("reiniciar", idServicio);
}

export function useEliminarServicio(idServicio: number) {
  const invalidar = useInvalidarServicio(idServicio);
  return useMutation({
    mutationFn: async () => {
      const { data } = await clienteHttp.delete<ResultadoOperacion>(
        `/servicios/${idServicio}`
      );
      return data;
    },
    onSuccess: invalidar,
  });
}
