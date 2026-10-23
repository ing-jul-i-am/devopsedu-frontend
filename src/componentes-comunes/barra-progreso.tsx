// Barra de progreso del sistema de diseño (RNF-03, RNF-05). Usa el elemento
// nativo <progress> para obtener semantica accesible; su forma y el color de
// cada tono se definen en tailwind-base.css a partir de los tokens.
interface Props {
  etiqueta: string;
  valor: number;
  maximo: number;
  tono?: "primario" | "memoria" | "almacenamiento";
}

const CLASES_TONO: Record<NonNullable<Props["tono"]>, string> = {
  primario: "",
  memoria: "barra-progreso-memoria",
  almacenamiento: "barra-progreso-almacenamiento",
};

export function BarraProgreso({ etiqueta, valor, maximo, tono = "primario" }: Props) {
  return (
    <progress
      className={`barra-progreso ${CLASES_TONO[tono]}`}
      aria-label={etiqueta}
      value={Math.min(Math.max(valor, 0), maximo)}
      max={maximo}
    />
  );
}
