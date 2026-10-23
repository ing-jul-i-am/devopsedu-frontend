// Cubre: RF-22, RNF-05 — CU-13. Resumen del progreso de la ruta del estudiante
// en la barra lateral (DT-17).
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearMiRutaDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { ResumenRutaLateral } from "@/modulos/aprendizaje/componentes/resumen-ruta-lateral";
import { configuracion } from "@/infraestructura/configuracion";

const rutaMiRuta = `${configuracion.prefijoApi}/aprendizaje/mi-ruta`;

describe("ResumenRutaLateral", () => {
  it("muestra el porcentaje y cuantos modulos van completados", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json(
          crearMiRutaDePrueba({
            progreso: 66.67,
            modulos: [
              { idModulo: 1, nombre: "Introduccion", ordenSecuencia: 1, estado: "completado" },
              { idModulo: 2, nombre: "Redes", ordenSecuencia: 2, estado: "completado" },
              { idModulo: 3, nombre: "Volumenes", ordenSecuencia: 3, estado: "en_progreso" },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<ResumenRutaLateral />);

    expect(await screen.findByText(/2 de 3 módulos completados/i)).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /progreso de mi ruta/i })).toHaveAttribute(
      "value",
      "66.67"
    );
  });

  it("no muestra nada cuando el estudiante aun no tiene ruta asignada", async () => {
    let consultada = false;
    servidorMock.use(
      http.get(rutaMiRuta, () => {
        consultada = true;
        return HttpResponse.json(null);
      })
    );

    const { container } = renderizarConProveedores(<ResumenRutaLateral />);

    await vi.waitFor(() => expect(consultada).toBe(true));
    expect(container).toBeEmptyDOMElement();
  });
});
