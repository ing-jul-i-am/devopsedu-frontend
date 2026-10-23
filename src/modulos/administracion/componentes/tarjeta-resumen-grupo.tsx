// Resumen del grupo en la columna lateral de Reportes: total de estudiantes,
// cuantos tienen ruta y el progreso promedio, con la composicion de la
// tarjeta de capacidad del panel principal (DT-17, DT-18).
// Cubre: RF-25, RNF-05 — CU-15
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import type { EstudianteListado } from "@/tipos/reportes";
import { resumirGrupo } from "../utilidades/resumen-grupo";

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-xs rounded-lg border border-borde bg-fondo px-md py-sm">
      <span className="text-xs text-texto-secundario">{etiqueta}</span>
      <span className="text-2xl font-semibold text-texto">{valor}</span>
    </div>
  );
}

export function TarjetaResumenGrupo({ estudiantes }: { estudiantes: EstudianteListado[] }) {
  const { total, conRuta, progresoPromedio } = resumirGrupo(estudiantes);

  return (
    <Tarjeta titulo="Resumen del grupo">
      <div className="flex flex-col gap-md px-lg py-md">
        <div className="grid grid-cols-2 gap-sm">
          <Cifra etiqueta="Estudiantes" valor={String(total)} />
          <Cifra etiqueta="Con ruta asignada" valor={String(conRuta)} />
        </div>
        <div className="flex flex-col gap-xs">
          <div className="flex items-center justify-between text-sm">
            <span className="text-texto-secundario">Progreso promedio</span>
            <span className="font-semibold text-primario">
              {progresoPromedio === null ? "Sin datos" : `${Math.round(progresoPromedio)}%`}
            </span>
          </div>
          <BarraProgreso
            etiqueta="Progreso promedio del grupo"
            valor={progresoPromedio ?? 0}
            maximo={100}
          />
          <p className="text-xs text-texto-secundario">
            Promedio de los estudiantes con ruta asignada.
          </p>
        </div>
      </div>
    </Tarjeta>
  );
}
