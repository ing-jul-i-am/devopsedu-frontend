// Boton que dispara una accion irreversible solo tras confirmacion explicita
// en un dialogo accesible (RNF-04). El boton de cancelar es la opcion por
// defecto (primer elemento enfocable) y la confirmacion usa el color de
// advertencia del sistema de diseño.
import * as Dialog from "@radix-ui/react-dialog";
import { Boton } from "./boton";

interface Props {
  textoBoton: string;
  tituloDialogo: string;
  descripcionDialogo: string;
  textoConfirmacion: string;
  onConfirmar: () => void;
  cargando?: boolean;
  disabled?: boolean;
}

export function BotonAccionCritica({
  textoBoton,
  tituloDialogo,
  descripcionDialogo,
  textoConfirmacion,
  onConfirmar,
  cargando = false,
  disabled = false,
}: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Boton variante="secundario" disabled={disabled}>
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
            <Dialog.Description className="mt-sm text-sm text-texto-secundario">
              {descripcionDialogo}
            </Dialog.Description>
            <div className="mt-md flex justify-end gap-sm">
              <Dialog.Close asChild>
                <Boton variante="secundario">Cancelar</Boton>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Boton type="button" variante="peligro" cargando={cargando} onClick={onConfirmar}>
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
