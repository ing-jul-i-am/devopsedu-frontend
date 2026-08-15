// Cubre: RF-12, RF-13, RF-14, RF-17, RNF-04, RNF-05 — CU-06, CU-07
import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDetalleDePrueba } from "../../../../fixtures/servicio.factory";
import { DetalleServicioPage } from "@/modulos/servicios/paginas/detalle-servicio.page";
import { configuracion } from "@/infraestructura/configuracion";

const RUTA_PATRON = "/servicios/:idServicio";

function rutaServicio(id: number) {
  return `${configuracion.prefijoApi}/servicios/${id}`;
}

describe("DetalleServicioPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaServicio(7), async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json(crearServicioDetalleDePrueba({ idServicio: 7 }));
      })
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra los datos del servicio cuando la carga es exitosa", async () => {
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      nombre: "postgres-clase-04",
      estado: "en_ejecucion",
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(await screen.findByText("postgres-clase-04")).toBeInTheDocument();
    expect(screen.getByText(/en ejecucion/i)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el servicio no existe", async () => {
    servidorMock.use(
      http.get(rutaServicio(999), () =>
        HttpResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/999",
      rutaPatron: RUTA_PATRON,
    });

    expect(await screen.findByText(/servicio no encontrado/i)).toBeInTheDocument();
  });

  it("deshabilita las acciones no validas segun el estado actual del servicio", async () => {
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "configurado" });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(await screen.findByRole("button", { name: /^desplegar$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^detener$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^reiniciar$/i })).toBeDisabled();
  });

  it("requiere confirmacion antes de eliminar el servicio", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "detenido" });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /eliminar servicio/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/esta accion no se puede deshacer/i)).toBeInTheDocument();
  });

  it("despliega el servicio al hacer clic en Desplegar", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "detenido" });
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.post(`${rutaServicio(7)}/desplegar`, () =>
        HttpResponse.json({ idServicio: 7, nombre: servicio.nombre, estado: "en_ejecucion" })
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /^desplegar$/i })).toBeEnabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("habilita Reiniciar cuando el servicio esta en estado fallido", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "fallido" });
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.post(`${rutaServicio(7)}/reiniciar`, () =>
        HttpResponse.json({ idServicio: 7, nombre: servicio.nombre, estado: "en_ejecucion" })
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    const botonReiniciar = await screen.findByRole("button", { name: /^reiniciar$/i });
    expect(botonReiniciar).toBeEnabled();

    await usuario.click(botonReiniciar);

    await waitFor(() => expect(screen.getByRole("button", { name: /^reiniciar$/i })).toBeEnabled());
  });

  it("elimina el servicio tras confirmar en el dialogo", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "detenido" });
    let seElimino = false;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.delete(rutaServicio(7), () => {
        seElimino = true;
        return HttpResponse.json({ idServicio: 7, nombre: servicio.nombre, estado: "eliminado" });
      })
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /eliminar servicio/i }));
    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(seElimino).toBe(true));
  });

  it("muestra el historico de operaciones del servicio", async () => {
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      registros: [
        {
          idRegistro: 1,
          fechaHora: "2026-08-07T00:05:00.000Z",
          operacion: "desplegar",
          resultado: "exito",
          mensajeError: null,
          idServicio: 7,
          idUsuario: 1,
        },
      ],
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    const item = await screen.findByRole("listitem");
    expect(item).toHaveTextContent(/desplegar/i);
    expect(item).toHaveTextContent(/exito/i);
  });
});
