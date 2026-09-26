// Cubre: RF-08, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDetalleDePrueba } from "../../../../fixtures/servicio.factory";
import { EditarConfiguracionPage } from "@/modulos/servicios/paginas/editar-configuracion.page";
import { configuracion } from "@/infraestructura/configuracion";

const RUTA_PATRON = "/servicios/:idServicio/configuracion";

function rutaServicio(id: number) {
  return `${configuracion.prefijoApi}/servicios/${id}`;
}

function servicioConPuerto() {
  return crearServicioDetalleDePrueba({
    idServicio: 7,
    nombre: "postgres-clase-05",
    configuracion: {
      imagenDocker: "postgres:16-alpine",
      cpuAsignado: 1,
      memoriaAsignada: 512,
      almacenamientoAsignado: 1024,
      puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }],
      variablesEntorno: { POSTGRES_PASSWORD: "ejemplo" },
      volumenes: [
        { origen: "/datos/pg", destino: "/var/lib/postgresql/data", modo: "rw", tipo: "bind" },
      ],
    },
  });
}

function renderizar() {
  return renderizarConProveedores(<EditarConfiguracionPage />, {
    rutaInicial: "/servicios/7/configuracion",
    rutaPatron: RUTA_PATRON,
  });
}

async function avanzarAlPasoDos(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(await screen.findByRole("button", { name: /siguiente/i }));
}

describe("EditarConfiguracionPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaServicio(7), async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(servicioConPuerto());
      })
    );

    renderizar();

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el servicio no existe", async () => {
    servidorMock.use(
      http.get(rutaServicio(7), () =>
        HttpResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      )
    );

    renderizar();

    expect(await screen.findByText(/servicio no encontrado/i)).toBeInTheDocument();
  });

  it("presenta la edicion en dos pasos igual que el asistente de creacion", async () => {
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())));
    const usuario = userEvent.setup();

    renderizar();

    expect(await screen.findByText(/paso 1 de 2/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /agregar puerto/i })).not.toBeInTheDocument();

    await avanzarAlPasoDos(usuario);

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar puerto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar variable/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar volumen/i })).toBeInTheDocument();
  });

  it("permite regresar al primer paso conservando lo editado", async () => {
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())));
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);
    await usuario.click(await screen.findByRole("button", { name: /atras/i }));

    expect(screen.getByLabelText(/imagen docker/i)).toHaveValue("postgres:16-alpine");
  });

  it("no avanza al segundo paso cuando los recursos tienen errores", async () => {
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())));
    const usuario = userEvent.setup();

    renderizar();

    await usuario.clear(await screen.findByLabelText(/cpu/i));
    await usuario.type(screen.getByLabelText(/cpu/i), "99");
    await usuario.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/8 nucleos/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /agregar puerto/i })).not.toBeInTheDocument();
  });

  it("permite cambiar la imagen Docker, porque el contenedor se recrea al desplegar", async () => {
    let cuerpoRecibido: Record<string, unknown> | null = null;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, async ({ request }) => {
        cuerpoRecibido = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(servicioConPuerto());
      })
    );
    const usuario = userEvent.setup();

    renderizar();

    const campoImagen = await screen.findByLabelText(/imagen docker/i);
    expect(campoImagen).not.toHaveAttribute("readonly");

    await usuario.clear(campoImagen);
    await usuario.type(campoImagen, "postgres:17-alpine");
    await avanzarAlPasoDos(usuario);
    await usuario.click(await screen.findByRole("button", { name: /guardar configuracion/i }));

    await waitFor(() => expect(cuerpoRecibido).not.toBeNull());
    expect(cuerpoRecibido!["configuracion"]).toMatchObject({
      imagenDocker: "postgres:17-alpine",
    });
  });

  it("advierte que los cambios se aplican al volver a desplegar", async () => {
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())));

    renderizar();

    expect(await screen.findByText(/vuelvas a desplegar/i)).toBeInTheDocument();
  });

  it("no reenvia el campo derivado tipo de los volumenes", async () => {
    let cuerpoRecibido: Record<string, unknown> | null = null;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, async ({ request }) => {
        cuerpoRecibido = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(servicioConPuerto());
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);
    await usuario.click(await screen.findByRole("button", { name: /guardar configuracion/i }));

    await waitFor(() => expect(cuerpoRecibido).not.toBeNull());
    const enviada = cuerpoRecibido!["configuracion"] as { volumenes: unknown[] };
    expect(enviada.volumenes[0]).toEqual({
      origen: "/datos/pg",
      destino: "/var/lib/postgresql/data",
      modo: "rw",
    });
  });

  it("sigue enviando la imagen Docker vigente cuando no se modifica", async () => {
    let cuerpoRecibido: Record<string, unknown> | null = null;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, async ({ request }) => {
        cuerpoRecibido = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(servicioConPuerto());
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);
    await usuario.click(await screen.findByRole("button", { name: /guardar configuracion/i }));

    await waitFor(() => expect(cuerpoRecibido).not.toBeNull());
    expect(cuerpoRecibido!["configuracion"]).toMatchObject({
      imagenDocker: "postgres:16-alpine",
    });
  });

  it("precarga la configuracion vigente del servicio en ambos pasos", async () => {
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())));
    const usuario = userEvent.setup();

    renderizar();

    expect(await screen.findByLabelText(/imagen docker/i)).toHaveValue("postgres:16-alpine");
    expect(screen.getByLabelText(/cpu/i)).toHaveValue(1);
    expect(screen.getByLabelText(/memoria/i)).toHaveValue(512);

    await avanzarAlPasoDos(usuario);

    const filaPuerto = screen.getByRole("group", { name: /puerto 1/i });
    expect(within(filaPuerto).getByLabelText(/puerto del host/i)).toHaveValue(5432);

    const filaVariable = screen.getByRole("group", { name: /variable 1/i });
    expect(within(filaVariable).getByLabelText(/clave/i)).toHaveValue("POSTGRES_PASSWORD");

    const filaVolumen = screen.getByRole("group", { name: /volumen 1/i });
    expect(within(filaVolumen).getByLabelText(/ruta en el host/i)).toHaveValue("/datos/pg");
  });

  it("envia la configuracion completa al agregar un puerto", async () => {
    let cuerpoRecibido: Record<string, unknown> | null = null;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, async ({ request }) => {
        cuerpoRecibido = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(servicioConPuerto());
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const segundaFila = screen.getByRole("group", { name: /puerto 2/i });
    await usuario.type(within(segundaFila).getByLabelText(/puerto del host/i), "6379");
    await usuario.type(within(segundaFila).getByLabelText(/puerto del contenedor/i), "6379");

    await usuario.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    await waitFor(() => expect(cuerpoRecibido).not.toBeNull());
    expect(cuerpoRecibido!["configuracion"]).toMatchObject({
      imagenDocker: "postgres:16-alpine",
      puertos: [
        { host: 5432, contenedor: 5432, protocolo: "tcp" },
        { host: 6379, contenedor: 6379, protocolo: "tcp" },
      ],
      variablesEntorno: { POSTGRES_PASSWORD: "ejemplo" },
    });
  });

  it("no envia la configuracion cuando hay puertos duplicados", async () => {
    let seEnvio = false;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, () => {
        seEnvio = true;
        return HttpResponse.json(servicioConPuerto());
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);

    await usuario.click(await screen.findByRole("button", { name: /agregar puerto/i }));
    const segundaFila = screen.getByRole("group", { name: /puerto 2/i });
    await usuario.type(within(segundaFila).getByLabelText(/puerto del host/i), "5432");
    await usuario.type(within(segundaFila).getByLabelText(/puerto del contenedor/i), "5432");

    await usuario.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    expect(await screen.findByText(/ya esta asignado/i)).toBeInTheDocument();
    expect(seEnvio).toBe(false);
  });

  it("muestra el mensaje del backend cuando la peticion falla", async () => {
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicioConPuerto())),
      http.put(`${rutaServicio(7)}/configuracion`, () =>
        HttpResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      )
    );
    const usuario = userEvent.setup();

    renderizar();
    await avanzarAlPasoDos(usuario);

    await usuario.click(await screen.findByRole("button", { name: /guardar configuracion/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/servicio no encontrado/i);
  });
});
