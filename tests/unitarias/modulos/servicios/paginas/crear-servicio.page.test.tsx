// Cubre: RF-05, RF-06, RF-07, RF-09, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { CrearServicioPage } from "@/modulos/servicios/paginas/crear-servicio.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaImagenes = `${configuracion.prefijoApi}/servicios/imagenes`;
const rutaServicios = `${configuracion.prefijoApi}/servicios`;

async function completarFormularioValido(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText(/nombre/i), "postgres-clase-05");
  await usuario.type(screen.getByLabelText(/imagen docker/i), "postgres:16-alpine");
  await usuario.type(screen.getByLabelText(/cpu/i), "1");
  await usuario.type(screen.getByLabelText(/memoria/i), "512");
  await usuario.type(screen.getByLabelText(/almacenamiento/i), "1024");
}

describe("CrearServicioPage", () => {
  it("muestra los campos del formulario de creacion", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));

    renderizarConProveedores(<CrearServicioPage />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripcion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/imagen docker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/memoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/almacenamiento/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando el nombre tiene menos de 3 caracteres", async () => {
    servidorMock.use(http.get(rutaImagenes, () => HttpResponse.json([])));
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await usuario.type(screen.getByLabelText(/nombre/i), "ab");
    await usuario.tab();

    expect(await screen.findByText(/al menos 3 caracteres/i)).toBeInTheDocument();
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
    await usuario.click(screen.getByRole("button", { name: /crear servicio/i }));

    expect(await screen.findByRole("button", { name: /crear servicio/i })).toBeEnabled();
    expect(screen.queryByText(/no fue posible/i)).not.toBeInTheDocument();
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
    await usuario.click(screen.getByRole("button", { name: /crear servicio/i }));

    expect(await screen.findByText(/recursos insuficientes/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitado.*4.*cpu/i)).toBeInTheDocument();
    expect(screen.getByText(/disponible.*2.*cpu/i)).toBeInTheDocument();
  });

  it("mapea los errores de validacion del backend al campo correspondiente", async () => {
    servidorMock.use(
      http.get(rutaImagenes, () => HttpResponse.json([])),
      http.post(rutaServicios, () =>
        HttpResponse.json(
          {
            error: "Datos de entrada invalidos",
            detalles: [
              { campo: "configuracion.cpuAsignado", mensaje: "La CPU supera el maximo permitido" },
            ],
          },
          { status: 400 }
        )
      )
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<CrearServicioPage />);
    await completarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear servicio/i }));

    expect(await screen.findByText(/la cpu supera el maximo permitido/i)).toBeInTheDocument();
  });
});
