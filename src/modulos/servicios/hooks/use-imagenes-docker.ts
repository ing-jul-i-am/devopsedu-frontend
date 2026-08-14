// Consulta de TanStack Query para GET /api/servicios/imagenes.
// Cubre: RF-07
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { ImagenDocker } from "@/tipos/servicio";

export function useImagenesDocker() {
  return useQuery({
    queryKey: ["imagenes-docker"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<ImagenDocker[]>("/servicios/imagenes");
      return data;
    },
  });
}
