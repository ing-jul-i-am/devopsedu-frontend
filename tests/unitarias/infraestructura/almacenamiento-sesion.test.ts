/**
 * Cubre: RF-02, RF-03 — persistencia local del token y los datos del
 * usuario autenticado (login) y su limpieza al cerrar sesion.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  guardarSesion,
  limpiarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/infraestructura/almacenamiento-sesion";

describe("almacenamiento de sesion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("no hay token ni usuario cuando no se ha iniciado sesion", () => {
    expect(obtenerToken()).toBeNull();
    expect(obtenerUsuario()).toBeNull();
  });

  it("persiste y recupera el token y el usuario de la sesion", () => {
    const usuario = {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: 1,
    };

    guardarSesion("token-de-prueba", usuario);

    expect(obtenerToken()).toBe("token-de-prueba");
    expect(obtenerUsuario()).toEqual(usuario);
  });

  it("limpia el token y el usuario al cerrar sesion", () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: 1,
    });

    limpiarSesion();

    expect(obtenerToken()).toBeNull();
    expect(obtenerUsuario()).toBeNull();
  });
});
