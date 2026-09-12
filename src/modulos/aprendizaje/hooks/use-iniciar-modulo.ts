// Mutacion de TanStack Query para POST /api/aprendizaje/modulos/:idModulo/iniciar.
// Idempotente en el backend: llamarla varias veces no reinicia la fecha ya
// registrada (ver docs/contrato-api.md seccion 6.2).
// Cubre: RF-23 — CU-12
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";

export function useIniciarModulo(idModulo: number) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await clienteHttp.post<{ mensaje: string }>(
        `/aprendizaje/modulos/${idModulo}/iniciar`
      );
      return data;
    },
  });
}
