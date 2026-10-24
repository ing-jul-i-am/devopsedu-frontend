// Mutacion de TanStack Query para GET /api/reportes/progreso/exportar
// (contrato 8b.2): descarga el reporte en CSV o PDF con el nombre que propone
// el backend en Content-Disposition. Los errores se normalizan leyendo el
// JSON que llega dentro del Blob (DT-19).
// Cubre: RF-25 — CU-16
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import { normalizarErrorApiDescarga, type ErrorApi } from "@/infraestructura/errores-api";
import type { FormatoExportacion } from "@/tipos/reportes";
import { extraerNombreArchivo, guardarArchivo } from "@/utilidades/descarga-archivo";

export interface DatosExportacion {
  formato: FormatoExportacion;
  idUsuario: number | null;
}

export function useExportarReporte() {
  return useMutation<string, ErrorApi, DatosExportacion>({
    mutationFn: async ({ formato, idUsuario }) => {
      let respuesta;
      try {
        respuesta = await clienteHttp.get<Blob>("/reportes/progreso/exportar", {
          params: { formato, idUsuario },
          responseType: "blob",
        });
      } catch (error) {
        throw await normalizarErrorApiDescarga(error);
      }

      const cabecera: unknown = respuesta.headers["content-disposition"];
      const nombre = extraerNombreArchivo(
        typeof cabecera === "string" ? cabecera : undefined,
        `reporte-progreso.${formato}`
      );
      guardarArchivo(respuesta.data, nombre);
      return nombre;
    },
  });
}
