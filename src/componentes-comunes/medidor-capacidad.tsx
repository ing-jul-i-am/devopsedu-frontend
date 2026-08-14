// Medidor visual de uso de un recurso del servidor (RF-10, RNF-05).
// Usa el elemento nativo <progress> para obtener semantica y accesibilidad
// sin depender de estilos en linea con valores arbitrarios.
interface Props {
  etiqueta: string;
  total: number;
  disponible: number;
  unidad: string;
}

export function MedidorCapacidad({ etiqueta, total, disponible, unidad }: Props) {
  const comprometido = total - disponible;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between text-sm text-texto">
        <span>{etiqueta}</span>
        <span className="text-texto-secundario">
          {disponible} / {total} {unidad} disponibles
        </span>
      </div>
      <progress
        className="h-2 w-full accent-primario"
        aria-label={etiqueta}
        value={comprometido}
        max={total}
      />
    </div>
  );
}
