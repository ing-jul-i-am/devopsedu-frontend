// Cubre: RF-24, RNF-02, RNF-05 — CU-14
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearEvaluacionEstudianteDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { EvaluacionModuloPage } from "@/modulos/aprendizaje/paginas/evaluacion-modulo.page";
import { configuracion } from "@/infraestructura/configuracion";

function rutaEvaluacion(id: number | string) {
  return `${configuracion.prefijoApi}/aprendizaje/modulos/${id}/evaluacion`;
}

const opciones = {
  rutaInicial: "/aprendizaje/modulos/3/evaluacion",
  rutaPatron: "/aprendizaje/modulos/:idModulo/evaluacion",
};

describe("EvaluacionModuloPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaEvaluacion(3), async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(crearEvaluacionEstudianteDePrueba());
      })
    );

    renderizarConProveedores(<EvaluacionModuloPage />, opciones);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra las preguntas con sus opciones y el boton deshabilitado hasta responder todas", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json(
          crearEvaluacionEstudianteDePrueba({
            preguntas: [
              { pregunta: "Pregunta uno", opciones: ["A", "B"] },
              { pregunta: "Pregunta dos", opciones: ["C", "D"] },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<EvaluacionModuloPage />, opciones);

    await screen.findByText("Pregunta uno");
    const boton = screen.getByRole("button", { name: /enviar respuestas/i });
    expect(boton).toBeDisabled();

    await usuario.click(screen.getByRole("radio", { name: "A" }));
    expect(boton).toBeDisabled();

    await usuario.click(screen.getByRole("radio", { name: "D" }));
    expect(boton).toBeEnabled();
  });

  it("envia las respuestas y muestra la retroalimentacion sin revelar la respuesta correcta", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json(
          crearEvaluacionEstudianteDePrueba({
            preguntas: [{ pregunta: "Pregunta uno", opciones: ["A", "B"] }],
          })
        )
      ),
      http.post(rutaEvaluacion(3), async ({ request }) => {
        const cuerpo = (await request.json()) as { respuestas: number[] };
        expect(cuerpo.respuestas).toEqual([1]);
        return HttpResponse.json({
          puntuacion: 0,
          aprobado: false,
          intentosRestantes: 1,
          detalle: [{ correcta: false }],
        });
      })
    );

    renderizarConProveedores(<EvaluacionModuloPage />, opciones);

    await screen.findByText("Pregunta uno");
    await usuario.click(screen.getByRole("radio", { name: "B" }));
    await usuario.click(screen.getByRole("button", { name: /enviar respuestas/i }));

    expect(await screen.findByText(/0%/)).toBeInTheDocument();
    expect(screen.getByText(/no aprobada/i)).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando la evaluacion todavia no esta disponible", async () => {
    servidorMock.use(
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json({ error: "La evaluacion todavia no esta disponible" }, { status: 422 })
      )
    );

    renderizarConProveedores(<EvaluacionModuloPage />, opciones);

    expect(await screen.findByText(/todavia no esta disponible/i)).toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando la evaluacion ya fue aprobada", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json(
          crearEvaluacionEstudianteDePrueba({
            preguntas: [{ pregunta: "Pregunta uno", opciones: ["A", "B"] }],
          })
        )
      ),
      http.post(rutaEvaluacion(3), () =>
        HttpResponse.json({ error: "Ya aprobaste esta evaluacion" }, { status: 409 })
      )
    );

    renderizarConProveedores(<EvaluacionModuloPage />, opciones);

    await screen.findByText("Pregunta uno");
    await usuario.click(screen.getByRole("radio", { name: "A" }));
    await usuario.click(screen.getByRole("button", { name: /enviar respuestas/i }));

    expect(await screen.findByText(/ya aprobaste esta evaluacion/i)).toBeInTheDocument();
  });
});
