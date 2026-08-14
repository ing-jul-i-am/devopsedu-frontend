// Consulta de TanStack Query para GET /api/servidor/capacidad.
// Cubre: RF-10 — CU-04
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { CapacidadServidor } from "@/tipos/servicio";

export function useCapacidadServidor() {
  return useQuery({
    queryKey: ["capacidad-servidor"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<CapacidadServidor>("/servidor/capacidad");
      return data;
    },
  });
}
