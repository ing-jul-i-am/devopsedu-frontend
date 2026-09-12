// Mutacion de TanStack Query para POST /api/modulos.
// Cubre: RF-20 — CU-10
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { BloqueContenido, Modulo } from "@/tipos/aprendizaje";

export interface DatosModulo {
  nombre: string;
  orden: number;
  contenido: BloqueContenido[];
}

export function useCrearModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datos: DatosModulo) => {
      const { data } = await clienteHttp.post<Modulo>("/modulos", datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos"] });
    },
  });
}
