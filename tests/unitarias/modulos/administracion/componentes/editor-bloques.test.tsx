// Cubre: RF-20, RNF-02, RNF-05 — CU-10
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { EditorBloques } from "@/modulos/administracion/componentes/editor-bloques";
import { configuracion } from "@/infraestructura/configuracion";
import type { BloqueContenido } from "@/tipos/aprendizaje";

const rutaImagenes = `${configuracion.prefijoApi}/modulos/imagenes`;

/**
 * EditorBloques es un componente controlado: el padre es dueno del estado.
 * Esta envoltura simula ese padre para las pruebas que necesitan ver el
 * re-render tras una accion (agregar bloque, subir imagen), ademas de
 * espiar las llamadas a onCambiar.
 */
function EditorBloquesControlado({
  inicial = [],
  alCambiar,
}: {
  inicial?: BloqueContenido[];
  alCambiar: (bloques: BloqueContenido[]) => void;
}) {
  const [bloques, setBloques] = useState(inicial);
  return (
    <EditorBloques
      bloques={bloques}
      onCambiar={(nuevos) => {
        setBloques(nuevos);
        alCambiar(nuevos);
      }}
    />
  );
}

describe("EditorBloques", () => {
  it("muestra un mensaje cuando no hay bloques todavia", () => {
    renderizarConProveedores(<EditorBloques bloques={[]} onCambiar={() => {}} />);

    expect(screen.getByText(/aun no agregas contenido/i)).toBeInTheDocument();
  });

  it("agrega un bloque de enlace y notifica sus datos al completarlo", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    renderizarConProveedores(<EditorBloquesControlado alCambiar={alCambiar} />);

    await usuario.selectOptions(screen.getByLabelText(/tipo de bloque a agregar/i), "enlace");
    await usuario.click(screen.getByRole("button", { name: /agregar bloque/i }));

    await usuario.type(screen.getByLabelText(/^url$/i), "https://docs.docker.com/");
    await usuario.type(screen.getByLabelText(/titulo del enlace/i), "Documentacion de Docker");

    const ultimaLlamada = alCambiar.mock.calls[alCambiar.mock.calls.length - 1]?.[0] as BloqueContenido[];
    expect(ultimaLlamada).toEqual([
      { tipo: "enlace", url: "https://docs.docker.com/", titulo: "Documentacion de Docker", descripcion: "" },
    ]);
  });

  it("sube una imagen y notifica la url devuelta por el backend", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    servidorMock.use(
      http.post(rutaImagenes, () =>
        HttpResponse.json({ url: "/archivos/modulos/diagrama.png" }, { status: 201 })
      )
    );

    renderizarConProveedores(<EditorBloquesControlado alCambiar={alCambiar} />);

    await usuario.selectOptions(screen.getByLabelText(/tipo de bloque a agregar/i), "imagen");
    await usuario.click(screen.getByRole("button", { name: /agregar bloque/i }));

    const archivo = new File(["contenido"], "diagrama.png", { type: "image/png" });
    await usuario.upload(screen.getByLabelText(/archivo de imagen/i), archivo);

    await screen.findByAltText(/vista previa/i);
    const ultimaLlamada = alCambiar.mock.calls[alCambiar.mock.calls.length - 1]?.[0] as BloqueContenido[];
    expect(ultimaLlamada[0]).toMatchObject({
      tipo: "imagen",
      url: "/archivos/modulos/diagrama.png",
    });
  });

  it("muestra un mensaje claro cuando el archivo de imagen excede el tamano permitido", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaImagenes, () =>
        HttpResponse.json({ error: "El archivo excede el tamano maximo permitido" }, { status: 400 })
      )
    );

    renderizarConProveedores(<EditorBloquesControlado alCambiar={() => {}} />);

    await usuario.selectOptions(screen.getByLabelText(/tipo de bloque a agregar/i), "imagen");
    await usuario.click(screen.getByRole("button", { name: /agregar bloque/i }));

    const archivo = new File(["contenido"], "grande.png", { type: "image/png" });
    await usuario.upload(screen.getByLabelText(/archivo de imagen/i), archivo);

    expect(await screen.findByText(/excede el tamano maximo permitido/i)).toBeInTheDocument();
  });

  it("agrega un bloque de actividad referenciando su id", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    renderizarConProveedores(<EditorBloquesControlado alCambiar={alCambiar} />);

    await usuario.selectOptions(screen.getByLabelText(/tipo de bloque a agregar/i), "actividad");
    await usuario.click(screen.getByRole("button", { name: /agregar bloque/i }));
    await usuario.type(screen.getByLabelText(/id de la actividad/i), "7");

    const ultimaLlamada = alCambiar.mock.calls[alCambiar.mock.calls.length - 1]?.[0] as BloqueContenido[];
    expect(ultimaLlamada).toEqual([{ tipo: "actividad", idActividad: 7 }]);
  });

  it("quita un bloque existente", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    const bloques: BloqueContenido[] = [
      { tipo: "enlace", url: "https://docs.docker.com/", titulo: "Docker" },
    ];

    renderizarConProveedores(<EditorBloquesControlado inicial={bloques} alCambiar={alCambiar} />);

    await usuario.click(screen.getByRole("button", { name: /quitar bloque/i }));

    expect(alCambiar).toHaveBeenCalledWith([]);
  });

  it("mueve un bloque hacia arriba", async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    const bloques: BloqueContenido[] = [
      { tipo: "enlace", url: "https://a.com", titulo: "A" },
      { tipo: "enlace", url: "https://b.com", titulo: "B" },
    ];

    renderizarConProveedores(<EditorBloquesControlado inicial={bloques} alCambiar={alCambiar} />);

    const botonesSubir = screen.getAllByRole("button", { name: /mover arriba/i });
    await usuario.click(botonesSubir[1] as HTMLElement);

    expect(alCambiar).toHaveBeenCalledWith([
      { tipo: "enlace", url: "https://b.com", titulo: "B" },
      { tipo: "enlace", url: "https://a.com", titulo: "A" },
    ]);
  });
});
