// Cubre: RF-08, RF-17 — CU-03, CU-06
import { describe, it, expect, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import App from "@/App";
import { servidorMock } from "../../../mocks/servidor";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { crearServicioDetalleDePrueba } from "../../../fixtures/servicio.factory";
import { configuracion } from "@/infraestructura/configuracion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_ESTUDIANTE } from "@/tipos/roles";
import type { ConfiguracionServicio, ServicioDetalle } from "@/tipos/servicio";

const rutaServicio = `${configuracion.prefijoApi}/servicios/7`;

describe("Editar la configuracion de un servicio", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("permite agregar un puerto desde el detalle y verlo reflejado", async () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_ESTUDIANTE,
    });

    const servicio: ServicioDetalle = crearServicioDetalleDePrueba({
      idServicio: 7,
      nombre: "postgres-clase-05",
      estado: "configurado",
      configuracion: {
        imagenDocker: "postgres:16-alpine",
        cpuAsignado: 1,
        memoriaAsignada: 512,
        almacenamientoAsignado: 1024,
        puertos: [],
        variablesEntorno: {},
        volumenes: [],
      },
    });

    servidorMock.use(
      http.get(rutaServicio, () => HttpResponse.json(servicio)),
      http.put(`${rutaServicio}/configuracion`, async ({ request }) => {
        const cuerpo = (await request.json()) as { configuracion: ConfiguracionServicio };
        // El backend anota `tipo` al responder (contrato 3.1); el mock hace lo
        // mismo para no devolver una forma que la API real nunca produce.
        servicio.configuracion = {
          ...cuerpo.configuracion,
          volumenes: cuerpo.configuracion.volumenes.map((volumen) => ({
            ...volumen,
            tipo: volumen.origen.startsWith("/") ? ("bind" as const) : ("volumen" as const),
          })),
        };
        return HttpResponse.json(servicio);
      })
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/servicios/7" });

    await usuario.click(await screen.findByRole("link", { name: /editar configuracion/i }));
    await usuario.click(await screen.findByRole("button", { name: /siguiente/i }));

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const fila = screen.getByRole("group", { name: /puerto 1/i });
    await usuario.type(within(fila).getByLabelText(/puerto del host/i), "5432");
    await usuario.type(within(fila).getByLabelText(/puerto del contenedor/i), "5432");

    await usuario.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    expect(await screen.findByText("5432 -> 5432/tcp")).toBeInTheDocument();
    expect(screen.getByText(/la configuracion se guardo/i)).toBeInTheDocument();
    expect(screen.getByText(/vuelve a desplegar/i)).toBeInTheDocument();
  });
});
