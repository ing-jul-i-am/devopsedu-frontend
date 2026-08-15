// Cubre: RF-15, RF-17 — CU-06, CU-09
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListaRegistros } from "@/modulos/servicios/componentes/lista-registros";

describe("ListaRegistros", () => {
  it("muestra un mensaje cuando no hay registros", () => {
    render(<ListaRegistros registros={[]} />);

    expect(screen.getByText(/aun no hay operaciones registradas/i)).toBeInTheDocument();
  });

  it("muestra la operacion y el resultado de cada registro", () => {
    render(
      <ListaRegistros
        registros={[
          {
            idRegistro: 1,
            fechaHora: "2026-08-07T00:05:00.000Z",
            operacion: "desplegar",
            resultado: "exito",
            mensajeError: null,
            idServicio: 7,
            idUsuario: 1,
          },
        ]}
      />
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent(/desplegar/i);
    expect(item).toHaveTextContent(/exito/i);
  });

  it("muestra el mensaje de error cuando el registro fallo", () => {
    render(
      <ListaRegistros
        registros={[
          {
            idRegistro: 2,
            fechaHora: "2026-08-07T00:05:00.000Z",
            operacion: "desplegar",
            resultado: "fallo",
            mensajeError: "La imagen Docker 'httpd:2.4-alpine' no esta disponible",
            idServicio: 7,
            idUsuario: 1,
          },
        ]}
      />
    );

    expect(screen.getByText(/la imagen docker/i)).toBeInTheDocument();
  });
});
