// Cubre: RF-16, RF-17, RNF-05 — CU-08. Resumen de los servicios del usuario en
// el panel principal (DT-17).
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { TarjetaMisServicios } from "@/modulos/principal/componentes/tarjeta-mis-servicios";
import { configuracion } from "@/infraestructura/configuracion";

const rutaServicios = `${configuracion.prefijoApi}/servicios`;

function configuracionDePrueba(imagenDocker: string, puertoHost: number, cpu: number, memoria: number) {
  return {
    imagenDocker,
    cpuAsignado: cpu,
    memoriaAsignada: memoria,
    almacenamientoAsignado: 512,
    puertos: [{ host: puertoHost, contenedor: puertoHost, protocolo: "tcp" as const }],
    variablesEntorno: {},
    volumenes: [],
  };
}

describe("TarjetaMisServicios", () => {
  it("lista los servicios con su estado, imagen, puerto y recursos", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([
          crearServicioDePrueba({
            idServicio: 11,
            nombre: "redis-cache",
            estado: "en_ejecucion",
            configuracion: configuracionDePrueba("redis:7-alpine", 6379, 0.5, 256),
          }),
          crearServicioDePrueba({
            idServicio: 12,
            nombre: "postgres-db",
            estado: "en_ejecucion",
            configuracion: configuracionDePrueba("postgres:16", 5432, 1, 512),
          }),
          crearServicioDePrueba({
            idServicio: 13,
            nombre: "web-nginx",
            estado: "detenido",
            configuracion: configuracionDePrueba("nginx:1.27", 8080, 0.25, 128),
          }),
        ])
      )
    );

    renderizarConProveedores(<TarjetaMisServicios />);

    const enlace = await screen.findByRole("link", { name: "redis-cache" });
    expect(enlace).toHaveAttribute("href", "/servicios/11");
    const fila = enlace.closest("li");
    if (!fila) throw new Error("El servicio deberia estar en una fila de la lista");
    expect(within(fila).getByText("redis:7-alpine")).toBeInTheDocument();
    expect(within(fila).getByText(/en ejecucion/i)).toBeInTheDocument();
    expect(within(fila).getByText(":6379")).toBeInTheDocument();
    expect(within(fila).getByText("0.5 CPU")).toBeInTheDocument();
    expect(within(fila).getByText("256 MB")).toBeInTheDocument();

    expect(screen.getByText("3 servicios")).toBeInTheDocument();
    expect(screen.getByText("2 activos")).toBeInTheDocument();
    expect(screen.getByText("1 detenido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear servicio/i })).toHaveAttribute(
      "href",
      "/servicios/nuevo"
    );
    expect(screen.getByRole("link", { name: /ver todos mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
  });

  it("muestra como maximo cinco servicios", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json(
          Array.from({ length: 7 }, (_, indice) =>
            crearServicioDePrueba({ nombre: `servicio-${indice + 1}` })
          )
        )
      )
    );

    renderizarConProveedores(<TarjetaMisServicios />);

    expect(await screen.findByRole("link", { name: "servicio-5" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "servicio-6" })).not.toBeInTheDocument();
    expect(screen.getByText("7 servicios")).toBeInTheDocument();
  });

  it("invita a crear el primer servicio cuando el usuario no tiene ninguno", async () => {
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json([])));

    renderizarConProveedores(<TarjetaMisServicios />);

    expect(await screen.findByText(/aún no tienes servicios/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear mi primer servicio/i })).toHaveAttribute(
      "href",
      "/servicios/nuevo"
    );
    expect(screen.queryByRole("link", { name: /ver todos mis servicios/i })).not.toBeInTheDocument();
  });

  it("muestra un indicador de carga mientras consulta los servicios", () => {
    renderizarConProveedores(<TarjetaMisServicios />);

    expect(screen.getByRole("status", { name: /cargando servicios/i })).toBeInTheDocument();
  });

  it("informa cuando no fue posible cargar los servicios", async () => {
    servidorMock.use(
      http.get(rutaServicios, () => HttpResponse.json({ error: "Fallo" }, { status: 500 }))
    );

    renderizarConProveedores(<TarjetaMisServicios />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no fue posible cargar tus servicios/i);
  });
});
