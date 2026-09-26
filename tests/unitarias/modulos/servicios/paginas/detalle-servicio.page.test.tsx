// Cubre: RF-12, RF-13, RF-14, RF-17, RNF-04, RNF-05 — CU-06, CU-07
import { describe, it, expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import {
  crearContenedorDePrueba,
  crearServicioDetalleDePrueba,
  crearVolumenMontadoDePrueba,
} from "../../../../fixtures/servicio.factory";
import { DetalleServicioPage } from "@/modulos/servicios/paginas/detalle-servicio.page";
import { configuracion } from "@/infraestructura/configuracion";
import type { ResultadoOperacion } from "@/tipos/servicio";

const RUTA_PATRON = "/servicios/:idServicio";

function rutaServicio(id: number) {
  return `${configuracion.prefijoApi}/servicios/${id}`;
}

function resultadoDePrueba(
  sobreescrituras: Partial<ResultadoOperacion> = {}
): ResultadoOperacion {
  return {
    idServicio: 7,
    nombre: "postgres-clase-04",
    estado: "en_ejecucion",
    recreado: false,
    volumenesEliminados: [],
    volumenesOmitidos: [],
    ...sobreescrituras,
  };
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
        HttpResponse.json(resultadoDePrueba({ nombre: servicio.nombre }))
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^desplegar$/i })).toBeEnabled()
    );
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

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^reiniciar$/i })).toBeEnabled()
    );
  });

  it("elimina el servicio tras confirmar en el dialogo", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "detenido" });
    let seElimino = false;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.delete(rutaServicio(7), () => {
        seElimino = true;
        return HttpResponse.json({
          idServicio: 7,
          nombre: servicio.nombre,
          estado: "eliminado",
        });
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

  it("muestra la configuracion con la que se creo el servicio", async () => {
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      configuracion: {
        imagenDocker: "postgres:16-alpine",
        cpuAsignado: 1,
        memoriaAsignada: 512,
        almacenamientoAsignado: 1024,
        puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }],
        variablesEntorno: { POSTGRES_PASSWORD: "ejemplo" },
        volumenes: [
          {
            origen: "/datos/pg",
            destino: "/var/lib/postgresql/data",
            modo: "rw",
            tipo: "bind",
          },
        ],
      },
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(
      await screen.findByRole("heading", { name: /^configuracion$/i })
    ).toBeInTheDocument();
    expect(screen.getByText("postgres:16-alpine")).toBeInTheDocument();
    expect(screen.getByText("5432 -> 5432/tcp")).toBeInTheDocument();
    expect(screen.getByText("POSTGRES_PASSWORD = ejemplo")).toBeInTheDocument();
    expect(
      screen.getByText(/\/datos\/pg -> \/var\/lib\/postgresql\/data .*carpeta del host/)
    ).toBeInTheDocument();
  });

  it("ofrece un enlace para editar la configuracion del servicio", async () => {
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7 });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    const enlace = await screen.findByRole("link", { name: /editar configuracion/i });
    expect(enlace).toHaveAttribute("href", "/servicios/7/configuracion");
  });

  it("despliega sin pedir confirmacion cuando el servicio no tiene contenedor", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "configurado",
      contenedor: crearContenedorDePrueba({ existe: false }),
    });
    let seDesplego = false;
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.post(`${rutaServicio(7)}/desplegar`, () => {
        seDesplego = true;
        return HttpResponse.json(resultadoDePrueba());
      })
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(seDesplego).toBe(true));
  });

  it("pide confirmacion antes de desplegar cuando ya existe un contenedor", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "detenido",
      contenedor: crearContenedorDePrueba({
        existe: true,
        volumenes: [
          crearVolumenMontadoDePrueba({
            nombre: "a".repeat(64),
            destino: "/var/lib/postgresql/data",
            anonimo: true,
          }),
        ],
      }),
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText(/se perdera el contenido/i)).toBeInTheDocument();
    expect(within(dialogo).getByText(/var\/lib\/postgresql\/data/)).toBeInTheDocument();
  });

  it("pide confirmacion antes de desplegar cuando no se pudo consultar el contenedor", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "detenido",
      contenedor: null,
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText(/no se pudo consultar/i)).toBeInTheDocument();
  });

  it("muestra los volumenes que el contenedor tiene montados ahora mismo", async () => {
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "en_ejecucion",
      contenedor: crearContenedorDePrueba({
        existe: true,
        volumenes: [
          crearVolumenMontadoDePrueba({
            nombre: "b".repeat(64),
            destino: "/var/lib/postgresql/data",
            anonimo: true,
          }),
        ],
      }),
    });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(
      await screen.findByRole("heading", { name: /volumenes montados/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/var\/lib\/postgresql\/data/)).toBeInTheDocument();
    expect(screen.getByText(/creado por la imagen/i)).toBeInTheDocument();
  });

  it("informa cuando no se pudo consultar los volumenes montados", async () => {
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, contenedor: null });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    expect(
      await screen.findByText(/no se pudo consultar el estado del contenedor/i)
    ).toBeInTheDocument();
  });

  it("informa del resultado de la limpieza tras desplegar", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "configurado",
      contenedor: crearContenedorDePrueba({ existe: false }),
    });
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.post(`${rutaServicio(7)}/desplegar`, () =>
        HttpResponse.json(
          resultadoDePrueba({
            recreado: true,
            volumenesEliminados: ["datos-redis"],
            volumenesOmitidos: ["compartido"],
          })
        )
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
    });

    await usuario.click(await screen.findByRole("button", { name: /^desplegar$/i }));

    expect(await screen.findByText(/se recreo el contenedor/i)).toBeInTheDocument();
    expect(screen.getByText(/datos-redis/)).toBeInTheDocument();
    expect(screen.getByText(/compartido/)).toBeInTheDocument();
  });

  it("avisa que hay que desplegar cuando se vuelve de guardar la configuracion", async () => {
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "detenido" });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
      estadoNavegacion: { configuracionActualizada: true },
    });

    expect(await screen.findByText(/la configuracion se guardo/i)).toBeInTheDocument();
    expect(screen.getByText(/vuelve a desplegar/i)).toBeInTheDocument();
  });

  it("retira el aviso de configuracion guardada una vez que se despliega", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDetalleDePrueba({
      idServicio: 7,
      estado: "detenido",
      contenedor: crearContenedorDePrueba({ existe: false }),
    });
    servidorMock.use(
      http.get(rutaServicio(7), () => HttpResponse.json(servicio)),
      http.post(`${rutaServicio(7)}/desplegar`, () =>
        HttpResponse.json(resultadoDePrueba({ recreado: true }))
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
      estadoNavegacion: { configuracionActualizada: true },
    });

    expect(await screen.findByText(/la configuracion se guardo/i)).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: /^desplegar$/i }));

    expect(await screen.findByText(/se recreo el contenedor/i)).toBeInTheDocument();
    expect(screen.queryByText(/la configuracion se guardo/i)).not.toBeInTheDocument();
  });

  it("indica que hay que detener primero cuando el servicio esta en ejecucion", async () => {
    const servicio = crearServicioDetalleDePrueba({ idServicio: 7, estado: "en_ejecucion" });
    servidorMock.use(http.get(rutaServicio(7), () => HttpResponse.json(servicio)));

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
      rutaPatron: RUTA_PATRON,
      estadoNavegacion: { configuracionActualizada: true },
    });

    expect(await screen.findByText(/deten el servicio/i)).toBeInTheDocument();
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
