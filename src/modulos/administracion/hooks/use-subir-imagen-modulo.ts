// Mutacion de TanStack Query para POST /api/modulos/imagenes (multipart).
// Cubre: RF-20 — CU-10
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";

export function useSubirImagenModulo() {
  return useMutation({
    mutationFn: async (archivo: File) => {
      const formulario = new FormData();
      formulario.append("imagen", archivo);
      const { data } = await clienteHttp.post<{ url: string }>("/modulos/imagenes", formulario, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });
}
