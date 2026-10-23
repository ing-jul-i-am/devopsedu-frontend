// Consulta de TanStack Query para GET /api/usuarios/estudiantes (contrato 7.2,
// DT-21 del backend): estudiantes con el resumen de su ruta vigente.
// Cubre: RF-21, RF-25 — CU-11, CU-15
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { EstudianteListado } from "@/tipos/reportes";

export function useEstudiantes() {
  return useQuery({
    queryKey: ["estudiantes"],
    queryFn: async () => {
      const { data } = await clienteHttp.get<EstudianteListado[]>("/usuarios/estudiantes");
      return data;
    },
  });
}
