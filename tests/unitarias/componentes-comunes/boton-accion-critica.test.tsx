// Cubre: RNF-04, RNF-05 — confirmacion obligatoria para acciones irreversibles
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";

function renderizarBoton(onConfirmar = vi.fn()) {
  render(
    <BotonAccionCritica
      textoBoton="Eliminar servicio"
      tituloDialogo="Eliminar este servicio"
      descripcionDialogo="Esta accion no se puede deshacer."
      textoConfirmacion="Eliminar"
      onConfirmar={onConfirmar}
    />
  );
  return onConfirmar;
}

describe("BotonAccionCritica", () => {
  it("muestra el dialogo de confirmacion con el impacto en lenguaje claro al hacer clic", async () => {
    const usuario = userEvent.setup();
    renderizarBoton();

    await usuario.click(screen.getByRole("button", { name: /eliminar servicio/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/esta accion no se puede deshacer/i)).toBeInTheDocument();
  });

  it("no ejecuta la accion cuando se cancela", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = renderizarBoton();

    await usuario.click(screen.getByRole("button", { name: /eliminar servicio/i }));
    await usuario.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onConfirmar).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ejecuta la accion solo tras confirmar explicitamente", async () => {
    const usuario = userEvent.setup();
    const onConfirmar = renderizarBoton();

    await usuario.click(screen.getByRole("button", { name: /eliminar servicio/i }));
    expect(onConfirmar).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });
});
