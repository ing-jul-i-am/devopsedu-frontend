// Cubre: RF-05, RF-06, RF-07, RF-09, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { CrearServicioPage } from "@/modulos/servicios/paginas/crear-servicio.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaImagenes = `${configuracion.prefijoApi}/servicios/imagenes`;
const rutaServicios = `${configuracion.prefijoApi}/servicios`;

async function completarPasoUno(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText(/nombre/i), "postgres-clase-05");
  await usuario.type(screen.getByLabelText(/imagen docker/i), "postgres:16-alpine");
  await usuario.type(screen.getByLabelText(/cpu/i), "1");
  await usuario.type(screen.getByLabelText(/memoria/i), "512");
  await usuario.type(screen.getByLabelText(/almacenamiento/i), "1024");
}

async function completarFormularioValido(usuario: ReturnType<typeof userEvent.setup>) {
  await completarPasoUno(usuario);
  await usuario.click(screen.getByRole("button", { name: /siguiente/i }));
}

describe("CrearServicioPage", () => {
  it("muestra los campos del primer paso del asistente", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));

    renderizarConProveedores(<CrearServicioPage />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripcion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/imagen docker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/memoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/almacenamiento/i)).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando el nombre tiene menos de 3 caracteres", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await usuario.type(screen.getByLabelText(/nombre/i), "ab");
    await usuario.tab();

    expect(await screen.findByText(/al menos 3 caracteres/i)).toBeInTheDocument();
  });

  it("no avanza al segundo paso cuando el primero tiene errores", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await usuario.type(screen.getByLabelText(/nombre/i), "ab");
    await usuario.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/al menos 3 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /agregar puerto/i })).not.toBeInTheDocument();
  });

  it("avanza al segundo paso con los tres editores cuando el primero es valido", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar puerto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar variable/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar volumen/i })).toBeInTheDocument();
  });

  it("permite regresar al primer paso conservando lo escrito", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(await screen.findByRole("button", { name: /atras/i }));

    expect(screen.getByLabelText(/nombre/i)).toHaveValue("postgres-clase-05");
  });

  it("crea el servicio exitosamente cuando el formulario es valido", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(crearServicioDePrueba({ nombre: "postgres-clase-05" }), {
          status: 201,
        })
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(await screen.findByRole("button", { name: /^crear servicio$/i }));

    expect(await screen.findByRole("button", { name: /^crear servicio$/i })).toBeEnabled();
    expect(screen.queryByText(/no fue posible/i)).not.toBeInTheDocument();
  });

  it("envia los puertos, variables de entorno y volumenes configurados", async () => {
    let cuerpoRecibido: Record<string, unknown> | null = null;
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, async ({ request }) => {
        cuerpoRecibido = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(crearServicioDePrueba(), { status: 201 });
      })
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const filaPuerto = screen.getByRole("group", { name: /puerto 1/i });
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del host/i), "5432");
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del contenedor/i), "5432");

    await usuario.click(screen.getByRole("button", { name: /agregar variable/i }));
    const filaVariable = screen.getByRole("group", { name: /variable 1/i });
    await usuario.type(within(filaVariable).getByLabelText(/clave/i), "POSTGRES_PASSWORD");
    await usuario.type(within(filaVariable).getByLabelText(/valor/i), "ejemplo");

    await usuario.click(screen.getByRole("button", { name: /agregar volumen/i }));
    const filaVolumen = screen.getByRole("group", { name: /volumen 1/i });
    await usuario.type(within(filaVolumen).getByLabelText(/ruta en el host/i), "/datos/pg");
    await usuario.type(
      within(filaVolumen).getByLabelText(/ruta en el contenedor/i),
      "/var/lib/postgresql/data"
    );

    await usuario.click(screen.getByRole("button", { name: /^crear servicio$/i }));

    await screen.findByRole("button", { name: /^crear servicio$/i });
    expect(cuerpoRecibido).not.toBeNull();
    expect(cuerpoRecibido!["configuracion"]).toMatchObject({
      puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }],
      variablesEntorno: { POSTGRES_PASSWORD: "ejemplo" },
      volumenes: [{ origen: "/datos/pg", destino: "/var/lib/postgresql/data", modo: "rw" }],
    });
  });

  it("muestra el detalle de recursos insuficientes cuando el backend responde 422", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(
          {
            error: "Recursos insuficientes para la configuracion solicitada",
            solicitado: { cpu: 4, memoria: 8192, almacenamiento: 20480 },
            disponible: { cpu: 2, memoria: 4096, almacenamiento: 10240 },
          },
          { status: 422 }
        )
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(await screen.findByRole("button", { name: /^crear servicio$/i }));

    expect(await screen.findByText(/recursos insuficientes/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitado.*4.*cpu/i)).toBeInTheDocument();
    expect(screen.getByText(/disponible.*2.*cpu/i)).toBeInTheDocument();
  });

  it("regresa al primer paso y marca el campo cuando el backend reporta un error de ese paso", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(
          {
            error: "Datos de entrada invalidos",
            detalles: [
              {
                campo: "configuracion.cpuAsignado",
                mensaje: "La CPU supera el maximo permitido",
              },
            ],
          },
          { status: 400 }
        )
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(await screen.findByRole("button", { name: /^crear servicio$/i }));

    expect(await screen.findByText(/la cpu supera el maximo permitido/i)).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it("marca el campo nombre y regresa al paso 1 cuando el nombre ya esta en uso", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(
          { error: "Ya tienes un servicio activo llamado postgres-clase-05" },
          { status: 409 }
        )
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(await screen.findByRole("button", { name: /^crear servicio$/i }));

    expect(
      await screen.findByText(/ya tienes un servicio activo llamado postgres-clase-05/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it("marca la fila del puerto cuando el backend reporta un error en ese puerto", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(
          {
            error: "Datos de entrada invalidos",
            detalles: [
              { campo: "configuracion.puertos.0.host", mensaje: "El puerto ya esta en uso" },
            ],
          },
          { status: 400 }
        )
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const filaPuerto = screen.getByRole("group", { name: /puerto 1/i });
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del host/i), "5432");
    await usuario.type(within(filaPuerto).getByLabelText(/puerto del contenedor/i), "5432");
    await usuario.click(screen.getByRole("button", { name: /^crear servicio$/i }));

    expect(await screen.findByText(/el puerto ya esta en uso/i)).toBeInTheDocument();
  });
});
