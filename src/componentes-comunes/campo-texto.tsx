// Campo de formulario con etiqueta, texto de ayuda y mensaje de error
// accesibles (RNF-02, RNF-05). Unica fuente de verdad visual para entradas
// de texto en todo el frontend.
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string | undefined;
  textoAyuda?: string;
}

export const CampoTexto = forwardRef<HTMLInputElement, Props>(function CampoTexto(
  { etiqueta, error, textoAyuda, id, className, ...resto },
  ref
) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idError = `${idCampo}-error`;
  const idAyuda = `${idCampo}-ayuda`;
  const describedBy = [textoAyuda ? idAyuda : null, error ? idError : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={idCampo} className="text-sm font-medium text-texto">
        {etiqueta}
      </label>
      {textoAyuda ? (
        <p id={idAyuda} className="text-xs text-texto-secundario">
          {textoAyuda}
        </p>
      ) : null}
      <input
        id={idCampo}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={
          className ??
          "rounded-md border border-borde bg-superficie px-sm py-xs text-texto focus:border-enfoque focus:outline-none focus:ring-2 focus:ring-enfoque"
        }
        {...resto}
      />
      {error ? (
        <p id={idError} role="alert" className="text-xs text-peligro">
          {error}
        </p>
      ) : null}
    </div>
  );
});
