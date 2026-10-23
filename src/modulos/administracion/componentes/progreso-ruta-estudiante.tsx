// Progreso de la ruta vigente de un estudiante, con la misma composicion que
// la tarjeta de ruta del panel principal (DT-17): barra, porcentaje y modulos
// completados. Sin ruta, lo indica con texto y color de advertencia suave.
// Compartido por Gestion de estudiantes y Reportes (DT-18, DT-20).
// Cubre: RF-21, RF-25, RNF-05 — CU-11, CU-15
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";

interface AvanceRuta {
  progreso: number;
  modulosCompletados: number;
  totalModulos: number;
}

interface Props {
  nombreEstudiante: string;
  ruta: AvanceRuta | null;
}

export function SinRutaAsignada() {
  return (
    <span className="inline-flex w-fit items-center rounded-md border border-advertencia-borde bg-advertencia-suave px-sm py-xs text-xs font-medium text-advertencia-texto">
      Sin ruta asignada
    </span>
  );
}

export function ProgresoRutaEstudiante({ nombreEstudiante, ruta }: Props) {
  if (!ruta) {
    return <SinRutaAsignada />;
  }

  return (
    <div className="flex w-full flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <BarraProgreso
          etiqueta={`Progreso de la ruta de ${nombreEstudiante}`}
          valor={ruta.progreso}
          maximo={100}
        />
        <span className="w-10 shrink-0 text-right text-sm font-semibold text-primario">
          {Math.round(ruta.progreso)}%
        </span>
      </div>
      <p className="text-xs text-texto-secundario">
        {ruta.modulosCompletados} de {ruta.totalModulos} módulos completados
      </p>
    </div>
  );
}
