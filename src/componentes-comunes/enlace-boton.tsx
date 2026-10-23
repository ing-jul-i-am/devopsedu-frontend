// Enlace de navegacion con la apariencia de los botones del sistema de diseño
// (RNF-03, RNF-05). Evita anidar un <button> dentro de un <a>, lo que rompe la
// navegacion por teclado y confunde a los lectores de pantalla.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Variante = "primario" | "secundario" | "advertencia";

interface Props {
  hacia: string;
  children: ReactNode;
  variante?: Variante;
  icono?: LucideIcon;
  anchoCompleto?: boolean;
}

const CLASES_VARIANTE: Record<Variante, string> = {
  primario: "bg-primario text-primario-contraste hover:bg-primario-hover",
  secundario: "border border-borde bg-superficie text-texto hover:bg-fondo",
  advertencia: "bg-advertencia-texto text-primario-contraste hover:bg-advertencia-hover",
};

export function EnlaceBoton({
  hacia,
  children,
  variante = "primario",
  icono: Icono,
  anchoCompleto = false,
}: Props) {
  return (
    <Link
      to={hacia}
      className={`inline-flex items-center justify-center gap-sm rounded-lg px-md py-sm text-sm font-medium transition-colors ${
        anchoCompleto ? "w-full" : "w-fit"
      } ${CLASES_VARIANTE[variante]}`}
    >
      {Icono ? <Icono aria-hidden="true" className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}
