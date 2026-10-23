// Cubre: RF-23, RNF-05 — CU-12. Tarjeta de actividad practica con su estado
// (pendiente o completada) segun el contrato 6.1b (DT-17).
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearBloqueActividadEstudianteDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { TarjetaActividad } from "@/modulos/aprendizaje/componentes/tarjeta-actividad";

describe("TarjetaActividad", () => {
  it("muestra una actividad pendiente con su descripcion y el acceso a Mis servicios", () => {
    renderizarConProveedores(
      <TarjetaActividad
        actividad={crearBloqueActividadEstudianteDePrueba({
          descripcion: "Despliega un servicio Redis con almacenamiento persistente",
        })}
      />
    );

    const tarjeta = screen.getByRole("article", { name: /actividad práctica/i });
    expect(within(tarjeta).getByText(/pendiente/i)).toBeInTheDocument();
    expect(within(tarjeta).getByText(/servicio redis con almacenamiento/i)).toBeInTheDocument();
    expect(within(tarjeta).getByRole("link", { name: /ir a mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
    expect(within(tarjeta).queryByText(/^completada$/i)).not.toBeInTheDocument();
  });

  it("muestra una actividad completada con la fecha en que se completo", () => {
    renderizarConProveedores(
      <TarjetaActividad
        actividad={crearBloqueActividadEstudianteDePrueba({
          completada: true,
          fechaCompletada: "2026-10-10T12:00:00.000Z",
        })}
      />
    );

    const tarjeta = screen.getByRole("article", { name: /actividad práctica/i });
    expect(within(tarjeta).getByText(/^completada$/i)).toBeInTheDocument();
    expect(within(tarjeta).getByText(/completada el 10 oct\.? 2026/i)).toBeInTheDocument();
    expect(within(tarjeta).getByRole("link", { name: /ver mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
    expect(within(tarjeta).queryByText(/pendiente/i)).not.toBeInTheDocument();
  });

  it("avisa cuando la descripcion de la actividad ya no esta disponible", () => {
    renderizarConProveedores(
      <TarjetaActividad actividad={crearBloqueActividadEstudianteDePrueba({ descripcion: "" })} />
    );

    expect(screen.getByText(/la descripción de esta actividad no está disponible/i)).toBeInTheDocument();
  });

  it("numera el titulo cuando el modulo tiene varias actividades", () => {
    renderizarConProveedores(
      <TarjetaActividad actividad={crearBloqueActividadEstudianteDePrueba()} numero={2} />
    );

    expect(screen.getByRole("article", { name: "Actividad práctica 2" })).toBeInTheDocument();
  });
});
