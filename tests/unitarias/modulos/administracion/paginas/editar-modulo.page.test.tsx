// Cubre: RF-20, RF-23, RF-24, RNF-05 — CU-10, CU-12, CU-14
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearModuloDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { EditarModuloPage } from "@/modulos/administracion/paginas/editar-modulo.page";
import { configuracion } from "@/infraestructura/configuracion";

function rutaModulo(id: number) {
  return `${configuracion.prefijoApi}/modulos/${id}`;
}

const opciones = {
  rutaInicial: "/administracion/modulos/3",
  rutaPatron: "/administracion/modulos/:idModulo",
};

describe("EditarModuloPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaModulo(3), async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(crearModuloDePrueba());
      })
    );

    renderizarConProveedores(<EditarModuloPage />, opciones);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("precarga el modulo y muestra las secciones de actividad y evaluacion", async () => {
    servidorMock.use(
      http.get(rutaModulo(3), () =>
        HttpResponse.json(crearModuloDePrueba({ idModulo: 3, nombre: "Redes en Docker" }))
      )
    );

    renderizarConProveedores(<EditarModuloPage />, opciones);

    expect(await screen.findByDisplayValue("Redes en Docker")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /actividad del modulo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /evaluacion del modulo/i })).toBeInTheDocument();
  });

  it("guarda los cambios del modulo", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaModulo(3), () =>
        HttpResponse.json(crearModuloDePrueba({ idModulo: 3, nombre: "Redes en Docker" }))
      ),
      http.put(rutaModulo(3), () =>
        HttpResponse.json(crearModuloDePrueba({ idModulo: 3, nombre: "Redes avanzadas" }))
      )
    );

    renderizarConProveedores(<EditarModuloPage />, opciones);

    await screen.findByDisplayValue("Redes en Docker");
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByText(/cambios guardados/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando el modulo no existe", async () => {
    servidorMock.use(
      http.get(rutaModulo(3), () =>
        HttpResponse.json({ error: "Modulo no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<EditarModuloPage />, opciones);

    expect(await screen.findByText(/modulo no encontrado/i)).toBeInTheDocument();
  });
});
