// Boton del sistema de diseño con estado de carga accesible (RNF-03, RNF-05).
// El icono opcional es decorativo, igual que en EnlaceBoton: el nombre
// accesible sigue siendo el texto.
import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
  icono?: LucideIcon;
}

const CLASES_VARIANTE: Record<NonNullable<Props["variante"]>, string> = {
  primario: "bg-primario text-primario-contraste hover:bg-primario-hover",
  secundario: "border border-borde text-texto hover:bg-fondo",
  peligro: "bg-peligro text-primario-contraste hover:bg-peligro-hover",
};

export const Boton = forwardRef<HTMLButtonElement, Props>(function Boton(
  {
    variante = "primario",
    cargando = false,
    icono: Icono,
    disabled,
    children,
    className,
    ...resto
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={
        className ??
        `inline-flex items-center justify-center gap-sm rounded-md px-md py-xs text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CLASES_VARIANTE[variante]}`
      }
      disabled={disabled ?? cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {Icono && !cargando ? <Icono aria-hidden="true" className="h-4 w-4" /> : null}
      {cargando ? "Procesando..." : children}
    </button>
  );
});
