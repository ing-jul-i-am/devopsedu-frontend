// Boton del sistema de diseño con estado de carga accesible (RNF-03, RNF-05).
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario";
  cargando?: boolean;
}

const CLASES_VARIANTE: Record<NonNullable<Props["variante"]>, string> = {
  primario: "bg-primario text-primario-contraste hover:bg-primario-hover",
  secundario: "border border-borde text-texto hover:bg-fondo",
};

export function Boton({
  variante = "primario",
  cargando = false,
  disabled,
  children,
  className,
  ...resto
}: Props) {
  return (
    <button
      className={
        className ??
        `rounded-md px-md py-xs text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CLASES_VARIANTE[variante]}`
      }
      disabled={disabled ?? cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando ? "Procesando..." : children}
    </button>
  );
}
