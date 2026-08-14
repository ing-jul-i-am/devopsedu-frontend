// Cubre: RF-16, RF-17 — CU-08
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { TarjetaServicio } from "@/modulos/servicios/componentes/tarjeta-servicio";

describe("TarjetaServicio", () => {
  it("muestra el nombre y el estado del servicio", () => {
    const servicio = crearServicioDePrueba({
      nombre: "postgres-clase-04",
      estado: "en_ejecucion",
    });

    renderizarConProveedores(<TarjetaServicio servicio={servicio} />);

    expect(screen.getByText("postgres-clase-04")).toBeInTheDocument();
    expect(screen.getByText(/en ejecucion/i)).toBeInTheDocument();
  });

  it("enlaza al detalle del servicio", () => {
    const servicio = crearServicioDePrueba({ idServicio: 7 });

    renderizarConProveedores(<TarjetaServicio servicio={servicio} />);

    expect(screen.getByRole("link", { name: /ver detalle/i })).toHaveAttribute(
      "href",
      "/servicios/7"
    );
  });
});
