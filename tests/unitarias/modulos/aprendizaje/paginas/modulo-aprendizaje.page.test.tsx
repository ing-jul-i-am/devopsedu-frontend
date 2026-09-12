// Cubre: RF-23, RNF-05 — CU-12
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearModuloConContenidoDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { ModuloAprendizajePage } from "@/modulos/aprendizaje/paginas/modulo-aprendizaje.page";
import { configuracion } from "@/infraestructura/configuracion";

function rutaModulo(id: number | string) {
  return `${configuracion.prefijoApi}/aprendizaje/modulos/${id}`;
}

function rutaIniciar(id: number | string) {
  return `${configuracion.prefijoApi}/aprendizaje/modulos/${id}/iniciar`;
}

function rutaEvaluacion(id: number | string) {
  return `${configuracion.prefijoApi}/aprendizaje/modulos/${id}/evaluacion`;
}

describe("ModuloAprendizajePage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(crearModuloConContenidoDePrueba());
      })
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("marca el modulo como iniciado al entrar", async () => {
    let vecesLlamado = 0;
    servidorMock.use(
      http.post(rutaIniciar(3), () => {
        vecesLlamado += 1;
        return HttpResponse.json({ mensaje: "Modulo iniciado" });
      }),
      http.get(rutaModulo(3), () => HttpResponse.json(crearModuloConContenidoDePrueba()))
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    await screen.findByText(/introduccion a contenedores/i);
    expect(vecesLlamado).toBe(1);
  });

  it("renderiza los bloques de texto, imagen, enlace y actividad del modulo", async () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), () =>
        HttpResponse.json(
          crearModuloConContenidoDePrueba({
            contenido: [
              { tipo: "texto", contenido: "Los **contenedores** empaquetan una aplicacion." },
              { tipo: "imagen", url: "/archivos/modulos/diagrama.png", textoAlternativo: "Diagrama de arquitectura" },
              {
                tipo: "enlace",
                url: "https://docs.docker.com/",
                titulo: "Documentacion oficial de Docker",
                descripcion: "Referencia completa",
              },
              {
                tipo: "actividad",
                idActividad: 7,
                descripcion: "Despliega un servicio con nginx y al menos un volumen",
              },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    expect(await screen.findByText("contenedores")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /diagrama de arquitectura/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /documentacion oficial de docker/i })).toHaveAttribute(
      "href",
      "https://docs.docker.com/"
    );
    expect(screen.getByText(/despliega un servicio con nginx/i)).toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando el modulo no pertenece a la ruta del estudiante", async () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), () =>
        HttpResponse.json({ error: "El modulo no pertenece a tu ruta de aprendizaje" }, { status: 404 })
      )
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    expect(await screen.findByText(/no pertenece a tu ruta de aprendizaje/i)).toBeInTheDocument();
  });

  it("muestra un enlace a la evaluacion cuando el modulo si tiene una", async () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), () => HttpResponse.json(crearModuloConContenidoDePrueba())),
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json({
          idEvaluacion: 1,
          titulo: "Evaluacion",
          fechaDisponible: "2026-01-01T00:00:00.000Z",
          preguntas: [],
        })
      )
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    expect(await screen.findByRole("link", { name: /ver evaluacion/i })).toHaveAttribute(
      "href",
      "/aprendizaje/modulos/3/evaluacion"
    );
  });

  it("muestra el enlace a la evaluacion aunque todavia no este disponible por fecha", async () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), () => HttpResponse.json(crearModuloConContenidoDePrueba())),
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json({ error: "La evaluacion todavia no esta disponible" }, { status: 422 })
      )
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    expect(await screen.findByRole("link", { name: /ver evaluacion/i })).toHaveAttribute(
      "href",
      "/aprendizaje/modulos/3/evaluacion"
    );
  });

  it("no muestra el enlace a la evaluacion cuando el modulo no tiene ninguna", async () => {
    servidorMock.use(
      http.post(rutaIniciar(3), () => HttpResponse.json({ mensaje: "Modulo iniciado" })),
      http.get(rutaModulo(3), () => HttpResponse.json(crearModuloConContenidoDePrueba())),
      http.get(rutaEvaluacion(3), () =>
        HttpResponse.json({ error: "Evaluacion no encontrada" }, { status: 404 })
      )
    );

    renderizarConProveedores(<ModuloAprendizajePage />, {
      rutaInicial: "/aprendizaje/modulos/3",
      rutaPatron: "/aprendizaje/modulos/:idModulo",
    });

    await screen.findByText("Introduccion a contenedores");
    expect(screen.queryByRole("link", { name: /ver evaluacion/i })).not.toBeInTheDocument();
  });
});
