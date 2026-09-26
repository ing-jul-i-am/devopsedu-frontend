// Cubre: RF-17, RNF-05 — CU-06
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResumenConfiguracion } from "@/modulos/servicios/componentes/resumen-configuracion";
import type { ConfiguracionServicioVigente } from "@/tipos/servicio";

function configuracionDePrueba(
  sobreescrituras: Partial<ConfiguracionServicioVigente> = {}
): ConfiguracionServicioVigente {
  return {
    imagenDocker: "postgres:16-alpine",
    cpuAsignado: 1,
    memoriaAsignada: 512,
    almacenamientoAsignado: 1024,
    puertos: [],
    variablesEntorno: {},
    volumenes: [],
    ...sobreescrituras,
  };
}

describe("ResumenConfiguracion", () => {
  it("muestra la imagen y los recursos asignados", () => {
    render(<ResumenConfiguracion configuracion={configuracionDePrueba()} />);

    expect(screen.getByText("postgres:16-alpine")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("512 MB")).toBeInTheDocument();
    expect(screen.getByText("1024 MB")).toBeInTheDocument();
  });

  it("muestra los puertos publicados", () => {
    render(
      <ResumenConfiguracion
        configuracion={configuracionDePrueba({
          puertos: [
            { host: 5432, contenedor: 5432, protocolo: "tcp" },
            { host: 8080, contenedor: 80, protocolo: "udp" },
          ],
        })}
      />
    );

    expect(screen.getByText("5432 -> 5432/tcp")).toBeInTheDocument();
    expect(screen.getByText("8080 -> 80/udp")).toBeInTheDocument();
  });

  it("muestra las variables de entorno definidas", () => {
    render(
      <ResumenConfiguracion
        configuracion={configuracionDePrueba({
          variablesEntorno: { POSTGRES_PASSWORD: "ejemplo", POSTGRES_DB: "clase" },
        })}
      />
    );

    expect(screen.getByText("POSTGRES_PASSWORD = ejemplo")).toBeInTheDocument();
    expect(screen.getByText("POSTGRES_DB = clase")).toBeInTheDocument();
  });

  it("muestra los volumenes declarados con su modo de acceso", () => {
    render(
      <ResumenConfiguracion
        configuracion={configuracionDePrueba({
          volumenes: [
            {
              origen: "/datos/pg",
              destino: "/var/lib/postgresql/data",
              modo: "rw",
              tipo: "bind",
            },
            {
              origen: "/semillas",
              destino: "/docker-entrypoint-initdb.d",
              modo: "ro",
              tipo: "bind",
            },
          ],
        })}
      />
    );

    expect(
      screen.getByText(/\/datos\/pg -> \/var\/lib\/postgresql\/data/)
    ).toBeInTheDocument();
    expect(screen.getByText(/lectura y escritura/)).toBeInTheDocument();
    expect(screen.getByText(/solo lectura/)).toBeInTheDocument();
  });

  it("distingue un bind mount de un volumen de Docker por lo que le pasa al recrear", () => {
    render(
      <ResumenConfiguracion
        configuracion={configuracionDePrueba({
          volumenes: [
            {
              origen: "/datos/pg",
              destino: "/var/lib/postgresql/data",
              modo: "rw",
              tipo: "bind",
            },
            { origen: "datos-redis", destino: "/data", modo: "rw", tipo: "volumen" },
          ],
        })}
      />
    );

    expect(screen.getByText(/carpeta del host, se conserva/i)).toBeInTheDocument();
    expect(screen.getByText(/volumen de docker, se borra al recrear/i)).toBeInTheDocument();
  });

  it("indica cuando el servicio no tiene puertos, variables ni volumenes", () => {
    render(<ResumenConfiguracion configuracion={configuracionDePrueba()} />);

    expect(screen.getByText(/sin puertos publicados/i)).toBeInTheDocument();
    expect(screen.getByText(/sin variables de entorno/i)).toBeInTheDocument();
    expect(screen.getByText(/sin volumenes/i)).toBeInTheDocument();
  });

  it("indica cuando el servicio no tiene configuracion registrada", () => {
    render(<ResumenConfiguracion configuracion={null} />);

    expect(screen.getByText(/no tiene configuracion registrada/i)).toBeInTheDocument();
  });
});
