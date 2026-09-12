import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
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

  it("no reintenta las consultas fallidas (los errores 4xx son definitivos, no transitorios)", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("fallo simulado"));

    function ComponenteDePrueba() {
      const { isError } = useQuery({ queryKey: ["prueba"], queryFn });
      return <p>{isError ? "Error" : "Cargando"}</p>;
    }

    render(
      <ProveedorQuery>
        <ComponenteDePrueba />
      </ProveedorQuery>
    );

    await waitFor(() => expect(screen.getByText("Error")).toBeInTheDocument());
    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});
