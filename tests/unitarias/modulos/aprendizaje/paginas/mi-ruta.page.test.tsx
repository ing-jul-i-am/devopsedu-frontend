// Cubre: RF-22 — CU-13
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearMiRutaDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { MiRutaPage } from "@/modulos/aprendizaje/paginas/mi-ruta.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaMiRuta = `${configuracion.prefijoApi}/aprendizaje/mi-ruta`;

describe("MiRutaPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaMiRuta, async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(null);
      })
    );

    renderizarConProveedores(<MiRutaPage />);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra los modulos de la ruta ordenados con su progreso", async () => {
    const miRuta = crearMiRutaDePrueba({
      progreso: 50,
      modulos: [
        { idModulo: 3, nombre: "Redes en Docker", ordenSecuencia: 1 },
        { idModulo: 1, nombre: "Introduccion a contenedores", ordenSecuencia: 2 },
      ],
    });
    servidorMock.use(http.get(rutaMiRuta, () => HttpResponse.json(miRuta)));

    renderizarConProveedores(<MiRutaPage />);

    const modulos = await screen.findAllByRole("link");
    expect(modulos[0]).toHaveTextContent(/redes en docker/i);
    expect(modulos[1]).toHaveTextContent(/introduccion a contenedores/i);
    expect(modulos[0]).toHaveAttribute("href", "/aprendizaje/modulos/3");
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el estudiante no tiene ninguna ruta asignada", async () => {
    servidorMock.use(http.get(rutaMiRuta, () => HttpResponse.json(null)));

    renderizarConProveedores(<MiRutaPage />);

    expect(await screen.findByText(/aun no tienes una ruta de aprendizaje asignada/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando falla la carga", async () => {
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json({ error: "Token invalido o expirado" }, { status: 401 })
      )
    );

    renderizarConProveedores(<MiRutaPage />);

    expect(await screen.findByText(/no fue posible cargar tu ruta/i)).toBeInTheDocument();
  });
});
