import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProveedorQuery } from "@/infraestructura/proveedor-query";

describe("ProveedorQuery", () => {
  it("renderiza sus hijos dentro del proveedor de TanStack Query", () => {
    render(
      <ProveedorQuery>
        <p>Contenido de prueba</p>
      </ProveedorQuery>
    );

    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});
