// Mutacion de TanStack Query para POST /api/auth/logout.
// Cubre: RF-03 — CU-02
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import { limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

export function useCerrarSesion() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await clienteHttp.post<{ mensaje: string }>("/auth/logout");
      return data;
    },
    onSettled: () => {
      limpiarSesion();
    },
  });
}
