// Cubre: RF-23, RNF-02, RNF-05 — CU-12
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { FormularioActividad } from "@/modulos/administracion/componentes/formulario-actividad";
import { configuracion } from "@/infraestructura/configuracion";

function rutaActividades(id: number) {
  return `${configuracion.prefijoApi}/modulos/${id}/actividades`;
}

describe("FormularioActividad", () => {
  it("muestra los campos del formulario", () => {
    renderizarConProveedores(<FormularioActividad idModulo={3} />);

    expect(screen.getByLabelText(/descripcion de la actividad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^operacion$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/orden/i)).toBeInTheDocument();
  });

  it("crea la actividad y muestra el id devuelto para referenciarla en un bloque", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaActividades(3), () =>
        HttpResponse.json(
          {
            idActividad: 7,
            descripcion: "Despliega un servicio con nginx",
            criteriosValidacion: { operacion: "desplegar" },
            orden: 1,
            idModulo: 3,
          },
          { status: 201 }
        )
      )
    );

    renderizarConProveedores(<FormularioActividad idModulo={3} />);

    await usuario.type(
      screen.getByLabelText(/descripcion de la actividad/i),
      "Despliega un servicio con nginx"
    );
    await usuario.selectOptions(screen.getByLabelText(/^operacion$/i), "desplegar");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear actividad/i }));

    expect(await screen.findByText(/actividad creada con id 7/i)).toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando el modulo no existe", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaActividades(3), () =>
        HttpResponse.json({ error: "Modulo no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<FormularioActividad idModulo={3} />);

    await usuario.type(screen.getByLabelText(/descripcion de la actividad/i), "Actividad");
    await usuario.selectOptions(screen.getByLabelText(/^operacion$/i), "desplegar");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear actividad/i }));

    expect(await screen.findByText(/modulo no encontrado/i)).toBeInTheDocument();
  });
});
