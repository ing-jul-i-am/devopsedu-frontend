// Cubre: RF-24, RNF-02, RNF-05 — CU-14
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { FormularioEvaluacion } from "@/modulos/administracion/componentes/formulario-evaluacion";
import { configuracion } from "@/infraestructura/configuracion";

function rutaEvaluacion(id: number) {
  return `${configuracion.prefijoApi}/modulos/${id}/evaluacion`;
}

describe("FormularioEvaluacion", () => {
  it("muestra los campos base y permite agregar una pregunta", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<FormularioEvaluacion idModulo={3} />);

    expect(screen.getByLabelText(/titulo de la evaluacion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha disponible/i)).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: /agregar pregunta/i }));

    expect(screen.getByLabelText(/pregunta 1/i)).toBeInTheDocument();
  });

  it("crea la evaluacion con una pregunta de dos opciones", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaEvaluacion(3), async ({ request }) => {
        const cuerpo = (await request.json()) as {
          titulo: string;
          preguntas: { pregunta: string; opciones: string[]; respuestaCorrecta: number }[];
          fechaDisponible: string;
        };
        expect(cuerpo.titulo).toBe("Evaluacion: Redes en Docker");
        expect(cuerpo.preguntas).toEqual([
          { pregunta: "Que es un volumen", opciones: ["Una carpeta", "Un contenedor"], respuestaCorrecta: 0 },
        ]);
        return HttpResponse.json(
          {
            idEvaluacion: 1,
            titulo: cuerpo.titulo,
            preguntas: cuerpo.preguntas,
            fechaDisponible: cuerpo.fechaDisponible,
            idModulo: 3,
          },
          { status: 201 }
        );
      })
    );

    renderizarConProveedores(<FormularioEvaluacion idModulo={3} />);

    await usuario.type(
      screen.getByLabelText(/titulo de la evaluacion/i),
      "Evaluacion: Redes en Docker"
    );
    await usuario.type(screen.getByLabelText(/fecha disponible/i), "2026-01-01");
    await usuario.click(screen.getByRole("button", { name: /agregar pregunta/i }));

    await usuario.type(screen.getByLabelText(/pregunta 1/i), "Que es un volumen");
    const opciones = screen.getAllByLabelText(/^opcion \d/i);
    await usuario.type(opciones[0] as HTMLElement, "Una carpeta");
    await usuario.type(opciones[1] as HTMLElement, "Un contenedor");
    await usuario.click(screen.getByRole("radio", { name: /respuesta correcta: opcion 1/i }));

    await usuario.click(screen.getByRole("button", { name: /crear evaluacion/i }));

    expect(await screen.findByText(/evaluacion creada/i)).toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando el modulo ya tiene una evaluacion", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaEvaluacion(3), () =>
        HttpResponse.json({ error: "El modulo ya tiene una evaluacion asociada" }, { status: 409 })
      )
    );

    renderizarConProveedores(<FormularioEvaluacion idModulo={3} />);

    await usuario.type(screen.getByLabelText(/titulo de la evaluacion/i), "Evaluacion");
    await usuario.type(screen.getByLabelText(/fecha disponible/i), "2026-01-01");
    await usuario.click(screen.getByRole("button", { name: /agregar pregunta/i }));
    await usuario.type(screen.getByLabelText(/pregunta 1/i), "Pregunta");
    const opciones = screen.getAllByLabelText(/^opcion \d/i);
    await usuario.type(opciones[0] as HTMLElement, "A");
    await usuario.type(opciones[1] as HTMLElement, "B");
    await usuario.click(screen.getByRole("radio", { name: /respuesta correcta: opcion 1/i }));

    await usuario.click(screen.getByRole("button", { name: /crear evaluacion/i }));

    expect(await screen.findByText(/ya tiene una evaluacion asociada/i)).toBeInTheDocument();
  });
});
