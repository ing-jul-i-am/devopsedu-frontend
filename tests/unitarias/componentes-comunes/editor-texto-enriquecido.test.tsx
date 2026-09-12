// Cubre: RF-20, RNF-03, RNF-05, RNF-20 — CU-10 (ver DT nueva sobre TipTap)
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorTextoEnriquecido } from "@/componentes-comunes/editor-texto-enriquecido";

describe("EditorTextoEnriquecido", () => {
  it("muestra el contenido inicial dado en Markdown", () => {
    render(
      <EditorTextoEnriquecido etiqueta="Contenido" valor="Hola mundo" onCambiar={() => {}} />
    );

    expect(screen.getByRole("textbox", { name: /contenido/i })).toHaveTextContent("Hola mundo");
  });

  it("muestra una barra de herramientas con botones de formato", () => {
    render(<EditorTextoEnriquecido etiqueta="Contenido" valor="" onCambiar={() => {}} />);

    expect(screen.getByRole("button", { name: /negrita/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cursiva/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^lista$/i })).toBeInTheDocument();
  });

  it("notifica el markdown actualizado al aplicar un formato desde la barra de herramientas", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(
      <EditorTextoEnriquecido etiqueta="Contenido" valor="Hola mundo" onCambiar={alCambiar} />
    );

    await usuario.click(screen.getByRole("button", { name: /^lista$/i }));

    expect(alCambiar).toHaveBeenCalled();
  });
});
