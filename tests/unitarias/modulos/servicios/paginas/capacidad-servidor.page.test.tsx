// Cubre: RF-10, RNF-05 — CU-04
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { CapacidadServidorPage } from "@/modulos/servicios/paginas/capacidad-servidor.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaCapacidad = `${configuracion.prefijoApi}/servidor/capacidad`;

describe("CapacidadServidorPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaCapacidad, async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json({
          total: { cpu: 8, memoria: 16384, almacenamiento: 512000 },
          comprometido: { cpu: 2.5, memoria: 4096, almacenamiento: 20480 },
          disponible: { cpu: 5.5, memoria: 12288, almacenamiento: 491520 },
        });
      })
    );

    renderizarConProveedores(<CapacidadServidorPage />);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra los medidores de CPU, memoria y almacenamiento cuando la carga es exitosa", async () => {
    servidorMock.use(
      http.get(rutaCapacidad, () =>
        HttpResponse.json({
          total: { cpu: 8, memoria: 16384, almacenamiento: 512000 },
          comprometido: { cpu: 2.5, memoria: 4096, almacenamiento: 20480 },
          disponible: { cpu: 5.5, memoria: 12288, almacenamiento: 491520 },
        })
      )
    );

    renderizarConProveedores(<CapacidadServidorPage />);

    expect(await screen.findByRole("progressbar", { name: /cpu/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /memoria/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /almacenamiento/i })).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando falla la carga", async () => {
    servidorMock.use(
      http.get(rutaCapacidad, () =>
        HttpResponse.json({ error: "Token invalido o expirado" }, { status: 401 })
      )
    );

    renderizarConProveedores(<CapacidadServidorPage />);

    expect(await screen.findByText(/no fue posible cargar/i)).toBeInTheDocument();
  });
});
