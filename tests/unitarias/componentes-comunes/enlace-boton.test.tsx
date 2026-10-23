// Cubre: RNF-03, RNF-05 — enlace de navegacion con apariencia de boton, sin
// anidar un <button> dentro de un <a>.
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Plus } from "lucide-react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { EnlaceBoton } from "@/componentes-comunes/enlace-boton";

describe("EnlaceBoton", () => {
  it("navega al destino indicado con el texto como nombre accesible", () => {
    renderizarConProveedores(<EnlaceBoton hacia="/servicios/nuevo">Crear servicio</EnlaceBoton>);

    expect(screen.getByRole("link", { name: "Crear servicio" })).toHaveAttribute(
      "href",
      "/servicios/nuevo"
    );
  });

  it("no agrega el icono al nombre accesible ni anida un boton", () => {
    renderizarConProveedores(
      <EnlaceBoton hacia="/servicios/nuevo" icono={Plus} variante="advertencia">
        Crear servicio
      </EnlaceBoton>
    );

    expect(screen.getByRole("link", { name: "Crear servicio" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
