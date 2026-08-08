/**
 * Cubre: RF-02, RF-03 — adjunto del token de sesion en las peticiones y
 * cierre de sesion automatico ante un 401 (TokenInvalidoError), segun
 * docs/contrato-api.md secciones 1.1 y 5.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../mocks/servidor";
import { clienteHttp } from "@/infraestructura/cliente-http";
import { configuracion } from "@/infraestructura/configuracion";
import { guardarSesion, obtenerToken } from "@/infraestructura/almacenamiento-sesion";

const rutaPrueba = `${configuracion.prefijoApi}/prueba`;

describe("clienteHttp", () => {
  beforeEach(() => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: new Date().toISOString(),
      idRol: 1,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("adjunta el token de sesion en el encabezado Authorization", async () => {
    let encabezadoRecibido: string | null = null;
    servidorMock.use(
      http.get(rutaPrueba, ({ request }) => {
        encabezadoRecibido = request.headers.get("authorization");
        return HttpResponse.json({ ok: true });
      })
    );

    await clienteHttp.get("/prueba");

    expect(encabezadoRecibido).toBe("Bearer token-de-prueba");
  });

  it("limpia la sesion y redirige a inicio de sesion cuando el backend responde 401", async () => {
    const irARuta = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    servidorMock.use(
      http.get(rutaPrueba, () =>
        HttpResponse.json({ error: "Token invalido o expirado" }, { status: 401 })
      )
    );

    await expect(clienteHttp.get("/prueba")).rejects.toBeTruthy();

    expect(obtenerToken()).toBeNull();
    expect(irARuta).toHaveBeenCalledWith("/iniciar-sesion");

    irARuta.mockRestore();
  });
});
