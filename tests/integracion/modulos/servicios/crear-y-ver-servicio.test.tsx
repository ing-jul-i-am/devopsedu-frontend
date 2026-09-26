// Cubre: RF-05, RF-06, RF-07, RF-09, RF-17 — CU-03
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

const rutaImagenes = `${configuracion.prefijoApi}/servicios/imagenes`;
const rutaServicios = `${configuracion.prefijoApi}/servicios`;

describe("Crear y ver un servicio", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("permite al estudiante crear un servicio y ver su detalle", async () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_ESTUDIANTE,
    });

    const servicioCreado = crearServicioDetalleDePrueba({
      idServicio: 9,
      nombre: "postgres-clase-05",
      estado: "configurado",
      configuracion: {
        imagenDocker: "postgres:16-alpine",
        cpuAsignado: 1,
        memoriaAsignada: 512,
        almacenamientoAsignado: 1024,
        puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }],
        variablesEntorno: { POSTGRES_PASSWORD: "ejemplo" },
        volumenes: [],
      },
    });

    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () => HttpResponse.json(servicioCreado, { status: 201 })),
      http.get(`${rutaServicios}/9`, () => HttpResponse.json(servicioCreado))
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/servicios/nuevo" });

    await usuario.type(screen.getByLabelText(/nombre/i), "postgres-clase-05");
    await usuario.type(screen.getByLabelText(/imagen docker/i), "postgres:16-alpine");
    await usuario.type(screen.getByLabelText(/cpu/i), "1");
    await usuario.type(screen.getByLabelText(/memoria/i), "512");
    await usuario.type(screen.getByLabelText(/almacenamiento/i), "1024");
    await usuario.click(screen.getByRole("button", { name: /siguiente/i }));

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const filaPuerto = screen.getByRole("group", { name: /puerto 1/i });
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del host/i), "5432");
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del contenedor/i), "5432");

    await usuario.click(screen.getByRole("button", { name: /^crear servicio$/i }));

    expect(
      await screen.findByRole("heading", { name: "postgres-clase-05" })
    ).toBeInTheDocument();
    expect(screen.getByText("5432 -> 5432/tcp")).toBeInTheDocument();
    expect(screen.getByText("POSTGRES_PASSWORD = ejemplo")).toBeInTheDocument();
  });
});
