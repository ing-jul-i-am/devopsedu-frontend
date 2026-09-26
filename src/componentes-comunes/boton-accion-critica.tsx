// Boton que dispara una accion irreversible solo tras confirmacion explicita
// en un dialogo accesible (RNF-04). El boton de cancelar es la opcion por
// defecto (primer elemento enfocable) y la confirmacion usa el color de
// advertencia del sistema de diseño.
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Boton } from "./boton";

interface Props {
  textoBoton: string;
  tituloDialogo: string;
  /**
   * Admite nodos y no solo texto porque algunas confirmaciones necesitan
   * enumerar el impacto, por ejemplo los volumenes cuyos datos se perderan.
   */
  descripcionDialogo: ReactNode;
  textoConfirmacion: string;
  onConfirmar: () => void;
  cargando?: boolean;
  disabled?: boolean;
  variante?: "primario" | "secundario" | "peligro";
}

export function BotonAccionCritica({
  textoBoton,
  tituloDialogo,
  descripcionDialogo,
  textoConfirmacion,
  onConfirmar,
  cargando = false,
  disabled = false,
  variante = "secundario",
}: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Boton variante={variante} disabled={disabled}>
          {textoBoton}
        </Boton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-texto/50" />
        <div className="fixed inset-0 flex items-center justify-center p-md">
          <Dialog.Content className="w-full max-w-sm rounded-lg bg-superficie p-lg shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-texto">
              {tituloDialogo}
            </Dialog.Title>
            {/* asChild sobre un div: Radix renderiza un <p> por defecto y una
                lista dentro de un parrafo seria HTML invalido. */}
            <Dialog.Description asChild>
              <div className="mt-sm flex flex-col gap-sm text-sm text-texto-secundario">
                {descripcionDialogo}
              </div>
            </Dialog.Description>
            <div className="mt-md flex justify-end gap-sm">
              <Dialog.Close asChild>
                <Boton variante="secundario">Cancelar</Boton>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Boton
                  type="button"
                  variante="peligro"
                  cargando={cargando}
                  onClick={onConfirmar}
                >
                  {textoConfirmacion}
                </Boton>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
