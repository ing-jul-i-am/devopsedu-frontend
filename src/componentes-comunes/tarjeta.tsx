// Contenedor de tarjeta del sistema de diseño (RNF-03): una seccion con titulo
// que le da su nombre accesible (RNF-05), acciones opcionales en el encabezado
// y el contenido debajo. Componente presentacional sin logica (CLAUDE.md 7.2).
import { useId, type ReactNode } from "react";

interface Props {
  titulo: string;
  children: ReactNode;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
}

export function Tarjeta({ titulo, children, subtitulo, acciones }: Props) {
  const idTitulo = useId();

  return (
    <section
      aria-labelledby={idTitulo}
      className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-sm border-b border-borde px-lg py-md">
        <div className="flex flex-col gap-xs">
          <h2 id={idTitulo} className="text-lg font-semibold text-texto">
            {titulo}
          </h2>
          {subtitulo}
        </div>
        {acciones}
      </div>
      {children}
    </section>
  );
}
