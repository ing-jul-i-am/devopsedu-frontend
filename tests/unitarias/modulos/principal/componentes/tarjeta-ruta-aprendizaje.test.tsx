// Cubre: RF-22, RNF-05 — CU-13. Avance de la ruta y acceso para continuar el
// modulo pendiente desde el panel principal (DT-17).
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearMiRutaDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { TarjetaRutaAprendizaje } from "@/modulos/principal/componentes/tarjeta-ruta-aprendizaje";
import { configuracion } from "@/infraestructura/configuracion";

const rutaMiRuta = `${configuracion.prefijoApi}/aprendizaje/mi-ruta`;

describe("TarjetaRutaAprendizaje", () => {
  it("muestra el progreso y lleva a continuar el primer modulo no completado", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json(
          crearMiRutaDePrueba({
            progreso: 33.33,
            modulos: [
              { idModulo: 4, nombre: "Introduccion", ordenSecuencia: 1, estado: "completado" },
              { idModulo: 6, nombre: "Volumenes y persistencia", ordenSecuencia: 2, estado: "en_progreso" },
              { idModulo: 9, nombre: "Compose", ordenSecuencia: 3, estado: "sin_iniciar" },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<TarjetaRutaAprendizaje />);

    expect(await screen.findByText(/1 de 3 módulos completados/i)).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /progreso de mi ruta/i })).toBeInTheDocument();
    expect(screen.getByText(/continúa donde quedaste/i)).toBeInTheDocument();
    expect(screen.getByText(/módulo 2 · volumenes y persistencia/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continuar módulo/i })).toHaveAttribute(
      "href",
      "/aprendizaje/modulos/6"
    );
  });

  it("invita a comenzar cuando el siguiente modulo aun no se inicia", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json(
          crearMiRutaDePrueba({
            modulos: [
              { idModulo: 1, nombre: "Introduccion", ordenSecuencia: 1, estado: "sin_iniciar" },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<TarjetaRutaAprendizaje />);

    expect(await screen.findByText(/aún no inicias este módulo/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comenzar módulo/i })).toHaveAttribute(
      "href",
      "/aprendizaje/modulos/1"
    );
  });

  it("felicita al estudiante cuando completo todos los modulos", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json(
          crearMiRutaDePrueba({
            progreso: 100,
            modulos: [
              { idModulo: 1, nombre: "Introduccion", ordenSecuencia: 1, estado: "completado" },
            ],
          })
        )
      )
    );

    renderizarConProveedores(<TarjetaRutaAprendizaje />);

    expect(await screen.findByText(/completaste tu ruta de aprendizaje/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /continuar módulo/i })).not.toBeInTheDocument();
  });

  it("indica que el docente aun no asigna una ruta", async () => {
    servidorMock.use(http.get(rutaMiRuta, () => HttpResponse.json(null)));

    renderizarConProveedores(<TarjetaRutaAprendizaje />);

    expect(await screen.findByText(/aún no tienes una ruta de aprendizaje asignada/i)).toBeInTheDocument();
  });

  it("informa cuando no fue posible cargar la ruta", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () => HttpResponse.json({ error: "Fallo" }, { status: 500 }))
    );

    renderizarConProveedores(<TarjetaRutaAprendizaje />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no fue posible cargar tu ruta/i);
  });
});
