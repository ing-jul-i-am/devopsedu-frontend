// Mutacion de TanStack Query para POST /api/modulos/:idModulo/actividades.
// Cubre: RF-23 — CU-12
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Actividad, CriteriosValidacionActividad } from "@/tipos/aprendizaje";

export interface DatosActividad {
  descripcion: string;
  criteriosValidacion: CriteriosValidacionActividad;
  orden: number;
}

export function useCrearActividad(idModulo: number) {
  return useMutation({
    mutationFn: async (datos: DatosActividad) => {
      const { data } = await clienteHttp.post<Actividad>(
        `/modulos/${idModulo}/actividades`,
        datos
      );
      return data;
    },
  });
}
