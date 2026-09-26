// Cubre: RF-11, RF-14, RNF-04 — CU-05, CU-07
// El aviso se construye con los montajes reales del contenedor (contrato 3.9.1,
// DT-17 del backend), nunca con la configuracion declarada: una imagen con
// VOLUME crea volumenes anonimos que la configuracion no menciona.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvisoPerdidaDatos } from "@/modulos/servicios/componentes/aviso-perdida-datos";
import {
  crearContenedorDePrueba,
  crearVolumenMontadoDePrueba,
} from "../../../../fixtures/servicio.factory";

describe("AvisoPerdidaDatos", () => {
  it("advierte de forma generica cuando no se pudo consultar el contenedor", () => {
    render(<AvisoPerdidaDatos contenedor={null} operacion="desplegar" />);

    expect(screen.getByText(/no se pudo consultar/i)).toBeInTheDocument();
    expect(screen.queryByText(/no hay datos que perder/i)).not.toBeInTheDocument();
  });

  it("indica que no hay nada que perder cuando no existe contenedor", () => {
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({ existe: false })}
        operacion="desplegar"
      />
    );

    expect(screen.getByText(/no hay datos que perder/i)).toBeInTheDocument();
  });

  it("indica que el contenedor no tiene volumenes montados cuando la lista esta vacia", () => {
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({ existe: true, volumenes: [] })}
        operacion="desplegar"
      />
    );

    expect(screen.getByText(/no tiene volumenes montados/i)).toBeInTheDocument();
  });

  it("enumera los volumenes montados por su ruta de destino", () => {
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({
          existe: true,
          volumenes: [
            crearVolumenMontadoDePrueba({ nombre: "datos-redis", destino: "/data" }),
          ],
        })}
        operacion="desplegar"
      />
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("/data");
    expect(screen.getByRole("listitem")).toHaveTextContent("datos-redis");
  });

  it("identifica un volumen anonimo por su destino y no por su hash", () => {
    const hash = "55cc6130e6b6b881f5353f86065017a2eccd6a6f88bbdc1d606b28e377edc537";
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({
          existe: true,
          volumenes: [
            crearVolumenMontadoDePrueba({
              nombre: hash,
              destino: "/var/lib/postgresql/data",
              anonimo: true,
            }),
          ],
        })}
        operacion="desplegar"
      />
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("/var/lib/postgresql/data");
    expect(item).toHaveTextContent(/creado por la imagen/i);
    expect(item).not.toHaveTextContent(hash);
  });

  it("describe la recreacion cuando la operacion es desplegar", () => {
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({ existe: true })}
        operacion="desplegar"
      />
    );

    expect(screen.getByText(/se creara uno nuevo/i)).toBeInTheDocument();
  });

  it("describe la eliminacion definitiva cuando la operacion es eliminar", () => {
    render(
      <AvisoPerdidaDatos
        contenedor={crearContenedorDePrueba({ existe: true })}
        operacion="eliminar"
      />
    );

    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument();
    expect(screen.queryByText(/se creara uno nuevo/i)).not.toBeInTheDocument();
  });
});
