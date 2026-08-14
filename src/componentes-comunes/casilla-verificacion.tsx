// Casilla de verificacion con etiqueta asociada (RNF-05).
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  etiqueta: string;
}

export const CasillaVerificacion = forwardRef<HTMLInputElement, Props>(
  function CasillaVerificacion({ etiqueta, id, className, ...resto }, ref) {
    const idGenerado = useId();
    const idCampo = id ?? idGenerado;

    return (
      <div className="flex items-center gap-xs">
        <input
          id={idCampo}
          ref={ref}
          type="checkbox"
          className={
            className ??
            "h-4 w-4 rounded border-borde text-primario focus:outline-none focus:ring-2 focus:ring-enfoque"
          }
          {...resto}
        />
        <label htmlFor={idCampo} className="text-sm text-texto">
          {etiqueta}
        </label>
      </div>
    );
  }
);
