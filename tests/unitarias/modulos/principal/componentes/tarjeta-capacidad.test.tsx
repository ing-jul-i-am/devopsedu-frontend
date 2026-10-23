// Cubre: RF-10, RNF-05 — CU-04. Capacidad del servidor resumida en el panel
// principal (DT-17).
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { TarjetaCapacidad } from "@/modulos/principal/componentes/tarjeta-capacidad";
import { configuracion } from "@/infraestructura/configuracion";

const rutaCapacidad = `${configuracion.prefijoApi}/servidor/capacidad`;

describe("TarjetaCapacidad", () => {
  it("muestra lo comprometido frente al total de cada recurso", async () => {
    servidorMock.use(
      http.get(rutaCapacidad, () =>
        HttpResponse.json({
          total: { cpu: 4, memoria: 2048, almacenamiento: 10240 },
          comprometido: { cpu: 1.75, memoria: 896, almacenamiento: 1228.8 },
          disponible: { cpu: 2.25, memoria: 1152, almacenamiento: 9011.2 },
        })
      )
    );

    renderizarConProveedores(<TarjetaCapacidad />);

    expect(await screen.findByText("1.75 / 4 vCPU")).toBeInTheDocument();
    expect(screen.getByText("896 MB / 2 GB")).toBeInTheDocument();
    expect(screen.getByText("1.2 / 10 GB")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /cpu/i })).toHaveAttribute("value", "1.75");
    expect(screen.getByRole("progressbar", { name: /memoria/i })).toHaveAttribute("value", "896");
    expect(screen.getByRole("progressbar", { name: /almacenamiento/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver capacidad del servidor/i })).toHaveAttribute(
      "href",
      "/capacidad-servidor"
    );
  });

  it("informa cuando no fue posible cargar la capacidad", async () => {
    servidorMock.use(
      http.get(rutaCapacidad, () => HttpResponse.json({ error: "Fallo" }, { status: 500 }))
    );

    renderizarConProveedores(<TarjetaCapacidad />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no fue posible cargar la capacidad del servidor/i
    );
  });
});
