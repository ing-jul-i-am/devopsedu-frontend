// Cubre: RF-25 — CU-15 (consulta del reporte de progreso, DT-18) y CU-16
// (exportacion en CSV o PDF, DT-19)
import { afterEach, describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import {
  crearEstudianteListadoDePrueba,
  crearModuloReporteDePrueba,
  crearReporteEstudianteDePrueba,
} from "../../../../fixtures/reporte.factory";
import { simularDescarga } from "../../../../ayudas/simular-descarga";
import { ReportesPage } from "@/modulos/administracion/paginas/reportes.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaEstudiantes = `${configuracion.prefijoApi}/usuarios/estudiantes`;
const rutaReporte = `${configuracion.prefijoApi}/reportes/progreso`;
const rutaExportar = `${configuracion.prefijoApi}/reportes/progreso/exportar`;
const RUTA_VISTA = "/administracion/reportes";

const LUIS = crearEstudianteListadoDePrueba({
  idUsuario: 5,
  nombre: "Luis Estudiante",
  correo: "luis@devopsedu.local",
});

const BEATRIZ = crearEstudianteListadoDePrueba({
  idUsuario: 3,
  nombre: "Beatriz Estudiante",
  correo: "beatriz@devopsedu.local",
  ruta: null,
});

const REPORTE_LUIS = crearReporteEstudianteDePrueba({
  idUsuario: 5,
  nombre: "Luis Estudiante",
  correo: "luis@devopsedu.local",
  ruta: {
    idRuta: 1,
    fechaAsignacion: "2026-02-01T10:00:00.000Z",
    progreso: 50,
    modulos: [
      crearModuloReporteDePrueba({ nombre: "Volumenes y persistencia", ordenSecuencia: 1 }),
      crearModuloReporteDePrueba({
        nombre: "Redes en Docker",
        ordenSecuencia: 2,
        estado: "en_progreso",
        actividades: { completadas: 0, total: 1, detalle: [] },
        evaluacion: {
          idEvaluacion: 9,
          titulo: "Evaluacion de redes",
          mejorNota: 40,
          intentos: 1,
          intentosMaximos: 3,
          aprobada: false,
        },
      }),
    ],
  },
});

function usarEstudiantes() {
  servidorMock.use(http.get(rutaEstudiantes, () => HttpResponse.json([BEATRIZ, LUIS])));
}

function usarReporte(reporte = REPORTE_LUIS) {
  const consultas: (string | null)[] = [];
  servidorMock.use(
    http.get(rutaReporte, ({ request }) => {
      consultas.push(new URL(request.url).searchParams.get("idUsuario"));
      return HttpResponse.json([reporte]);
    })
  );
  return consultas;
}

describe("ReportesPage", () => {
  it("muestra el titulo de la vista y un indicador mientras carga los estudiantes", () => {
    servidorMock.use(
      http.get(rutaEstudiantes, async () => {
        await new Promise((resolver) => setTimeout(resolver, 200));
        return HttpResponse.json([]);
      })
    );

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    expect(
      screen.getByRole("heading", { level: 1, name: "Reportes de progreso" })
    ).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /cargando estudiantes/i })).toBeInTheDocument();
  });

  it("indica cuando no hay estudiantes registrados", async () => {
    servidorMock.use(http.get(rutaEstudiantes, () => HttpResponse.json([])));

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    expect(await screen.findByText(/no hay estudiantes registrados/i)).toBeInTheDocument();
  });

  it("muestra un error cuando no se puede cargar el listado de estudiantes", async () => {
    servidorMock.use(
      http.get(rutaEstudiantes, () => HttpResponse.json({ error: "Error" }, { status: 500 }))
    );

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    expect(
      await screen.findByText(/no fue posible cargar el listado de estudiantes/i)
    ).toBeInTheDocument();
  });

  it("lista a todos los estudiantes con el progreso de su ruta", async () => {
    usarEstudiantes();

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    await screen.findByRole("link", { name: "Luis Estudiante" });
    const lista = screen.getByRole("region", { name: "Estudiantes" });
    expect(
      within(lista).getByText(/2 estudiantes · 1 con ruta asignada/i)
    ).toBeInTheDocument();
    expect(within(lista).getByRole("link", { name: "Luis Estudiante" })).toBeInTheDocument();
    expect(
      within(lista).getByRole("progressbar", {
        name: /progreso de la ruta de luis estudiante/i,
      })
    ).toBeInTheDocument();
    expect(within(lista).getByText(/1 de 2 módulos completados/i)).toBeInTheDocument();
    expect(
      within(lista).getByRole("link", { name: "Beatriz Estudiante" })
    ).toBeInTheDocument();
    expect(within(lista).getByText(/sin ruta asignada/i)).toBeInTheDocument();
  });

  it("resume el grupo con el total, los que tienen ruta y el progreso promedio", async () => {
    usarEstudiantes();

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    const resumen = await screen.findByRole("region", { name: "Resumen del grupo" });
    expect(within(resumen).getByText("Estudiantes")).toBeInTheDocument();
    expect(within(resumen).getByText("2")).toBeInTheDocument();
    expect(within(resumen).getByText("Con ruta asignada")).toBeInTheDocument();
    expect(within(resumen).getByText("1")).toBeInTheDocument();
    expect(within(resumen).getByText("50%")).toBeInTheDocument();
    expect(
      within(resumen).getByRole("progressbar", { name: /progreso promedio del grupo/i })
    ).toBeInTheDocument();
  });

  it("muestra el detalle por modulo al elegir un estudiante de la lista", async () => {
    const usuario = userEvent.setup();
    usarEstudiantes();
    const consultas = usarReporte();

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    await usuario.click(await screen.findByRole("link", { name: "Luis Estudiante" }));

    const detalle = await screen.findByRole("region", { name: "Luis Estudiante" });
    expect(consultas).toEqual(["5"]);
    expect(screen.getByLabelText("Estudiante")).toHaveValue("5");
    expect(
      within(detalle).getByText("luis@devopsedu.local", { exact: false })
    ).toBeInTheDocument();
    expect(within(detalle).getByText(/1 de 2 módulos completados/i)).toBeInTheDocument();

    const modulos = within(detalle).getAllByRole("listitem");
    expect(modulos).toHaveLength(2);
    const [primero, segundo] = modulos as [HTMLElement, HTMLElement];
    expect(within(primero).getByText("Volumenes y persistencia")).toBeInTheDocument();
    expect(within(primero).getByText("Completado")).toBeInTheDocument();
    expect(within(primero).getByText("Actividades 1 de 1")).toBeInTheDocument();
    expect(within(primero).getByText("Mejor nota 80/100")).toBeInTheDocument();
    expect(within(primero).getByText("Intentos 2 de 2")).toBeInTheDocument();
    expect(within(primero).getByText("Aprobada")).toBeInTheDocument();
    expect(within(segundo).getByText("En progreso")).toBeInTheDocument();
    expect(within(segundo).getByText("Actividades 0 de 1")).toBeInTheDocument();
    expect(within(segundo).getByText("No aprobada")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Resumen del grupo" })
    ).not.toBeInTheDocument();
  });

  it("cambia de estudiante desde el selector y vuelve a la lista completa", async () => {
    const usuario = userEvent.setup();
    usarEstudiantes();
    usarReporte();

    renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

    await screen.findByRole("option", { name: "Luis Estudiante (luis@devopsedu.local)" });
    await usuario.selectOptions(screen.getByLabelText("Estudiante"), "5");
    expect(await screen.findByRole("region", { name: "Luis Estudiante" })).toBeInTheDocument();

    await usuario.click(screen.getByRole("link", { name: /volver a todos los estudiantes/i }));
    expect(await screen.findByRole("region", { name: "Estudiantes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Estudiante")).toHaveValue("");
  });

  it("abre directamente el detalle cuando la URL indica un estudiante", async () => {
    usarEstudiantes();
    const consultas = usarReporte();

    renderizarConProveedores(<ReportesPage />, { rutaInicial: `${RUTA_VISTA}?idUsuario=5` });

    expect(await screen.findByRole("region", { name: "Luis Estudiante" })).toBeInTheDocument();
    expect(consultas).toEqual(["5"]);
  });

  it("indica las evaluaciones inexistentes o aun no presentadas", async () => {
    usarEstudiantes();
    usarReporte(
      crearReporteEstudianteDePrueba({
        idUsuario: 5,
        nombre: "Luis Estudiante",
        ruta: {
          idRuta: 1,
          fechaAsignacion: "2026-02-01T10:00:00.000Z",
          progreso: 0,
          modulos: [
            crearModuloReporteDePrueba({ nombre: "Modulo sin evaluacion", evaluacion: null }),
            crearModuloReporteDePrueba({
              nombre: "Modulo pendiente",
              estado: "sin_iniciar",
              evaluacion: {
                idEvaluacion: 2,
                titulo: "Evaluacion pendiente",
                mejorNota: null,
                intentos: 0,
                intentosMaximos: 2,
                aprobada: false,
              },
            }),
          ],
        },
      })
    );

    renderizarConProveedores(<ReportesPage />, { rutaInicial: `${RUTA_VISTA}?idUsuario=5` });

    const detalle = await screen.findByRole("region", { name: "Luis Estudiante" });
    const [sinEvaluacion, sinPresentar] = within(detalle).getAllByRole("listitem") as [
      HTMLElement,
      HTMLElement,
    ];
    expect(within(sinEvaluacion).getByText("Sin evaluación")).toBeInTheDocument();
    expect(within(sinEvaluacion).queryByText(/intentos/i)).not.toBeInTheDocument();
    expect(within(sinPresentar).getByText("Sin presentar")).toBeInTheDocument();
    expect(within(sinPresentar).getByText("Intentos 0 de 2")).toBeInTheDocument();
    expect(within(sinPresentar).queryByText(/mejor nota/i)).not.toBeInTheDocument();
  });

  it("indica cuando el estudiante elegido no tiene ruta y ofrece asignarle una", async () => {
    usarEstudiantes();
    usarReporte(
      crearReporteEstudianteDePrueba({
        idUsuario: 3,
        nombre: "Beatriz Estudiante",
        ruta: null,
      })
    );

    renderizarConProveedores(<ReportesPage />, { rutaInicial: `${RUTA_VISTA}?idUsuario=3` });

    expect(
      await screen.findByText(/este estudiante no tiene una ruta asignada/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /asignar ruta/i })).toHaveAttribute(
      "href",
      "/administracion/estudiantes"
    );
  });

  it("muestra el error del backend cuando el estudiante de la URL no existe", async () => {
    usarEstudiantes();
    servidorMock.use(
      http.get(rutaReporte, () =>
        HttpResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<ReportesPage />, { rutaInicial: `${RUTA_VISTA}?idUsuario=99` });

    expect(await screen.findByRole("alert")).toHaveTextContent(/usuario no encontrado/i);
  });

  describe("exportacion", () => {
    let simulacion: ReturnType<typeof simularDescarga>;

    afterEach(() => {
      simulacion.restaurar();
    });

    function usarExportacion(nombreArchivo: string) {
      const consultas: { formato: string | null; idUsuario: string | null }[] = [];
      servidorMock.use(
        http.get(rutaExportar, ({ request }) => {
          const parametros = new URL(request.url).searchParams;
          consultas.push({
            formato: parametros.get("formato"),
            idUsuario: parametros.get("idUsuario"),
          });
          return new HttpResponse("id_estudiante,estudiante\r\n", {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
            },
          });
        })
      );
      return consultas;
    }

    it("exporta el reporte de todos los estudiantes en CSV", async () => {
      simulacion = simularDescarga();
      const usuario = userEvent.setup();
      usarEstudiantes();
      const consultas = usarExportacion("reporte-progreso-2026-10-23.csv");

      renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

      const exportar = await screen.findByRole("region", { name: "Exportar reporte" });
      expect(
        within(exportar).getByText(/incluye a todos los estudiantes/i)
      ).toBeInTheDocument();
      await usuario.click(within(exportar).getByRole("button", { name: /exportar csv/i }));

      expect(
        await within(exportar).findByText(/se descargó reporte-progreso-2026-10-23.csv/i)
      ).toBeInTheDocument();
      expect(consultas).toEqual([{ formato: "csv", idUsuario: null }]);
      expect(simulacion.descargas.map((descarga) => descarga.nombre)).toEqual([
        "reporte-progreso-2026-10-23.csv",
      ]);
      expect(await simulacion.descargas[0]?.contenido.text()).toBe(
        "id_estudiante,estudiante\r\n"
      );
    });

    it("exporta en PDF solo al estudiante elegido", async () => {
      simulacion = simularDescarga();
      const usuario = userEvent.setup();
      usarEstudiantes();
      usarReporte();
      const consultas = usarExportacion("reporte-progreso-estudiante-5-2026-10-23.pdf");

      renderizarConProveedores(<ReportesPage />, { rutaInicial: `${RUTA_VISTA}?idUsuario=5` });

      const exportar = await screen.findByRole("region", { name: "Exportar reporte" });
      expect(
        await within(exportar).findByText(/incluye solo a luis estudiante/i)
      ).toBeInTheDocument();
      await usuario.click(within(exportar).getByRole("button", { name: /exportar pdf/i }));

      expect(
        await within(exportar).findByText(
          /se descargó reporte-progreso-estudiante-5-2026-10-23.pdf/i
        )
      ).toBeInTheDocument();
      expect(consultas).toEqual([{ formato: "pdf", idUsuario: "5" }]);
    });

    it("muestra el error del backend cuando la exportacion falla", async () => {
      simulacion = simularDescarga();
      const usuario = userEvent.setup();
      usarEstudiantes();
      servidorMock.use(
        http.get(rutaExportar, () =>
          HttpResponse.json({ error: "Parametros de consulta invalidos" }, { status: 400 })
        )
      );

      renderizarConProveedores(<ReportesPage />, { rutaInicial: RUTA_VISTA });

      const exportar = await screen.findByRole("region", { name: "Exportar reporte" });
      await usuario.click(within(exportar).getByRole("button", { name: /exportar csv/i }));

      expect(await within(exportar).findByRole("alert")).toHaveTextContent(
        /parametros de consulta invalidos/i
      );
      expect(simulacion.descargas).toEqual([]);
    });
  });
});
