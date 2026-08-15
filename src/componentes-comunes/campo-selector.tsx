// Selector de formulario con etiqueta asociada y mensaje de error (RNF-02,
// RNF-05). Unica fuente de verdad visual para selects en todo el frontend.
import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface Opcion {
  valor: string;
  etiqueta: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  opciones: Opcion[];
  placeholder?: string;
  error?: string | undefined;
}

export const CampoSelector = forwardRef<HTMLSelectElement, Props>(function CampoSelector(
  { etiqueta, opciones, placeholder, error, id, ...resto },
  ref
) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idError = `${idCampo}-error`;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={idCampo} className="text-sm font-medium text-texto">
        {etiqueta}
      </label>
      <select
        id={idCampo}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className="rounded-md border border-borde bg-superficie px-sm py-xs text-texto focus:border-enfoque focus:outline-none focus:ring-2 focus:ring-enfoque"
        {...resto}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error ? (
        <p id={idError} role="alert" className="text-xs text-peligro">
          {error}
        </p>
      ) : null}
    </div>
  );
});
