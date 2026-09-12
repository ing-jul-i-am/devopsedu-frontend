// Mutacion de TanStack Query para PUT /api/modulos/:idModulo.
// Cubre: RF-20 — CU-10
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { Modulo } from "@/tipos/aprendizaje";
import type { DatosModulo } from "./use-crear-modulo";

export function useEditarModulo(idModulo: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datos: Partial<DatosModulo>) => {
      const { data } = await clienteHttp.put<Modulo>(`/modulos/${idModulo}`, datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos"] });
      queryClient.invalidateQueries({ queryKey: ["modulos", idModulo] });
    },
  });
}
