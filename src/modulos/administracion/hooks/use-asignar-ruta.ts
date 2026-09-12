// Mutacion de TanStack Query para POST /api/rutas.
// Cubre: RF-21 — CU-11
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { RutaAsignada } from "@/tipos/aprendizaje";

export interface DatosAsignarRuta {
  idUsuario: number;
  idModulos: number[];
}

export function useAsignarRuta() {
  return useMutation({
    mutationFn: async (datos: DatosAsignarRuta) => {
      const { data } = await clienteHttp.post<RutaAsignada>("/rutas", datos);
      return data;
    },
  });
}
