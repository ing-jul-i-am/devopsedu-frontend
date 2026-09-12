// Mutacion de TanStack Query para PATCH /api/usuarios/:id/contrasena
// (DT-08: reseteo administrativo de contrasena, sin RF/CU formal asignado).
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";

export function useRestablecerContrasena() {
  return useMutation({
    mutationFn: async ({ idUsuario, contrasenaNueva }: { idUsuario: number; contrasenaNueva: string }) => {
      const { data } = await clienteHttp.patch<{ mensaje: string }>(
        `/usuarios/${idUsuario}/contrasena`,
        { contrasenaNueva }
      );
      return data;
    },
  });
}
