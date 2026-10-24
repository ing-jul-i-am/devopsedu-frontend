// Cubre: RF-25 — CU-15, CU-16 (el docente consulta el progreso de un
// estudiante y exporta su reporte, DT-18 y DT-19)
import { describe, it, expect, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import App from "@/App";
import { servidorMock } from "../../../mocks/servidor";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { simularDescarga } from "../../../ayudas/simular-descarga";
import { crearUsuarioDePrueba } from "../../../fixtures/usuario.factory";
import {
  crearEstudianteListadoDePrueba,
  crearModuloReporteDePrueba,
  crearReporteEstudianteDePrueba,
} from "../../../fixtures/reporte.factory";
import { configuracion } from "@/infraestructura/configuracion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE } from "@/tipos/roles";

describe("Consultar y exportar el reporte de progreso", () => {
  let simulacion: ReturnType<typeof simularDescarga>;

  afterEach(() => {
    simulacion.restaurar();
    limpiarSesion();
  });

  it("permite al docente llegar al detalle de un estudiante y exportarlo en CSV", async () => {
    simulacion = simularDescarga();
    guardarSesion(
      "token-de-prueba",
      crearUsuarioDePrueba({ nombre: "Docente", idRol: ID_ROL_DOCENTE })
    );
    const consultasExportar: (string | null)[] = [];
    servidorMock.use(
      http.get(`${configuracion.prefijoApi}/usuarios/estudiantes`, () =>
        HttpResponse.json([
          crearEstudianteListadoDePrueba({ idUsuario: 5, nombre: "Luis Estudiante" }),
        ])
      ),
      http.get(`${configuracion.prefijoApi}/reportes/progreso`, () =>
        HttpResponse.json([
          crearReporteEstudianteDePrueba({
            idUsuario: 5,
            nombre: "Luis Estudiante",
            ruta: {
              idRuta: 1,
              fechaAsignacion: "2026-02-01T10:00:00.000Z",
              progreso: 100,
              modulos: [crearModuloReporteDePrueba({ nombre: "Volumenes y persistencia" })],
            },
          }),
        ])
      ),
      http.get(`${configuracion.prefijoApi}/reportes/progreso/exportar`, ({ request }) => {
        consultasExportar.push(new URL(request.url).searchParams.get("idUsuario"));
        return new HttpResponse("id_estudiante\r\n5\r\n", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="reporte-progreso-estudiante-5-2026-10-23.csv"',
          },
        });
      })
    );
    const usuario = userEvent.setup();

    renderizarConProveedores(<App />, { rutaInicial: "/" });

    await usuario.click(screen.getByRole("link", { name: /^reportes$/i }));
    await usuario.click(await screen.findByRole("link", { name: "Luis Estudiante" }));

    const detalle = await screen.findByRole("region", { name: "Luis Estudiante" });
    expect(within(detalle).getByText("Volumenes y persistencia")).toBeInTheDocument();

    const exportar = screen.getByRole("region", { name: "Exportar reporte" });
    expect(within(exportar).getByText(/incluye solo a luis estudiante/i)).toBeInTheDocument();
    await usuario.click(within(exportar).getByRole("button", { name: /exportar csv/i }));

    expect(
      await within(exportar).findByText(
        /se descargó reporte-progreso-estudiante-5-2026-10-23.csv/i
      )
    ).toBeInTheDocument();
    expect(consultasExportar).toEqual(["5"]);
    expect(simulacion.descargas.map((descarga) => descarga.nombre)).toEqual([
      "reporte-progreso-estudiante-5-2026-10-23.csv",
    ]);

    await usuario.click(screen.getByRole("link", { name: /volver a todos los estudiantes/i }));
    const exportarTodos = await screen.findByRole("region", { name: "Exportar reporte" });
    expect(
      within(exportarTodos).getByText(/incluye a todos los estudiantes/i)
    ).toBeInTheDocument();
    expect(within(exportarTodos).queryByRole("status")).not.toBeInTheDocument();
  });
});
