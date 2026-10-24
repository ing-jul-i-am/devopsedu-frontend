// Exportacion del reporte de progreso en CSV o PDF desde la columna lateral de
// Reportes (CU-16). Exporta lo mismo que se esta consultando: todos los
// estudiantes o solo el elegido (DT-18). Exportar no es irreversible, asi que
// no requiere confirmacion (RNF-04 no aplica).
// Cubre: RF-25, RNF-02, RNF-05 — CU-16
import { FileSpreadsheet, FileText } from "lucide-react";
import { Boton } from "@/componentes-comunes/boton";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import type { FormatoExportacion } from "@/tipos/reportes";
import { useExportarReporte } from "../hooks/use-exportar-reporte";

interface Props {
  idUsuario: number | null;
  nombreEstudiante: string | undefined;
}

export function AccionesExportacion({ idUsuario, nombreEstudiante }: Props) {
  const exportar = useExportarReporte();
  const formatoEnCurso = exportar.isPending ? exportar.variables.formato : null;

  function alExportar(formato: FormatoExportacion) {
    exportar.mutate({ formato, idUsuario });
  }

  return (
    <Tarjeta
      titulo="Exportar reporte"
      subtitulo={
        <p className="text-sm text-texto-secundario">
          {idUsuario === null
            ? "Incluye a todos los estudiantes."
            : `Incluye solo ${nombreEstudiante ? `a ${nombreEstudiante}` : "al estudiante elegido"}.`}
        </p>
      }
    >
      <div className="flex flex-col gap-sm px-lg py-md">
        <Boton
          icono={FileSpreadsheet}
          cargando={formatoEnCurso === "csv"}
          disabled={exportar.isPending}
          onClick={() => alExportar("csv")}
        >
          Exportar CSV
        </Boton>
        <Boton
          variante="secundario"
          icono={FileText}
          cargando={formatoEnCurso === "pdf"}
          disabled={exportar.isPending}
          onClick={() => alExportar("pdf")}
        >
          Exportar PDF
        </Boton>
        <p className="text-xs text-texto-secundario">
          El CSV se abre en Excel con tildes y eñes; el PDF está listo para imprimir.
        </p>
        <div aria-live="polite">
          {exportar.isSuccess ? (
            <p
              role="status"
              className="rounded-lg border border-exito-borde bg-exito-suave px-md py-sm text-sm font-medium text-exito-texto"
            >
              Se descargó {exportar.data}
            </p>
          ) : null}
        </div>
        {exportar.isError ? (
          <p role="alert" className="text-sm text-peligro">
            No fue posible exportar el reporte: {exportar.error.mensaje}
          </p>
        ) : null}
      </div>
    </Tarjeta>
  );
}
