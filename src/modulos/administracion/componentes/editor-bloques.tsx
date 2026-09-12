// Editor de la lista ordenada de bloques de un modulo (RF-20, CU-10): agregar,
// quitar y reordenar bloques de texto, imagen y enlace. Los bloques de tipo
// "actividad" se agregan desde la seccion de Actividad del modulo (ver
// crear-editar-modulo.page.tsx), no desde este control generico.
import { useState } from "react";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { EditorTextoEnriquecido } from "@/componentes-comunes/editor-texto-enriquecido";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useSubirImagenModulo } from "../hooks/use-subir-imagen-modulo";
import type { BloqueContenido } from "@/tipos/aprendizaje";

interface Props {
  bloques: BloqueContenido[];
  onCambiar: (bloques: BloqueContenido[]) => void;
}

const TIPOS_AGREGABLES = [
  { valor: "texto", etiqueta: "Texto" },
  { valor: "imagen", etiqueta: "Imagen" },
  { valor: "enlace", etiqueta: "Enlace" },
  { valor: "actividad", etiqueta: "Actividad" },
];

function bloqueVacio(tipo: string): BloqueContenido {
  switch (tipo) {
    case "imagen":
      return { tipo: "imagen", url: "", textoAlternativo: "" };
    case "enlace":
      return { tipo: "enlace", url: "", titulo: "", descripcion: "" };
    case "actividad":
      return { tipo: "actividad", idActividad: 0 };
    default:
      return { tipo: "texto", contenido: "" };
  }
}

export function EditorBloques({ bloques, onCambiar }: Props) {
  const [tipoAAgregar, setTipoAAgregar] = useState("texto");
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const subirImagen = useSubirImagenModulo();

  function actualizarBloque(indice: number, bloque: BloqueContenido) {
    onCambiar(bloques.map((actual, i) => (i === indice ? bloque : actual)));
  }

  function quitarBloque(indice: number) {
    onCambiar(bloques.filter((_, i) => i !== indice));
  }

  function moverBloque(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= bloques.length) return;
    const copia = [...bloques];
    const [movido] = copia.splice(indice, 1);
    if (!movido) return;
    copia.splice(destino, 0, movido);
    onCambiar(copia);
  }

  async function alSeleccionarArchivo(indice: number, bloque: Extract<BloqueContenido, { tipo: "imagen" }>, archivo: File) {
    setErrorSubida(null);
    try {
      const { url } = await subirImagen.mutateAsync(archivo);
      actualizarBloque(indice, { ...bloque, url });
    } catch (error) {
      setErrorSubida(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <div className="flex flex-col gap-md">
      {bloques.length === 0 ? (
        <p className="text-texto-secundario">Aun no agregas contenido a este modulo.</p>
      ) : null}

      <div className="flex flex-col gap-md">
        {bloques.map((bloque, indice) => (
          <fieldset key={indice} className="flex flex-col gap-sm rounded-md border border-borde p-sm">
            <div className="flex items-center justify-between gap-xs">
              <legend className="text-sm font-medium text-texto">
                Bloque {indice + 1}: {bloque.tipo}
              </legend>
              <div className="flex gap-xs">
                <Boton
                  type="button"
                  variante="secundario"
                  disabled={indice === 0}
                  onClick={() => moverBloque(indice, -1)}
                >
                  Mover arriba
                </Boton>
                <Boton
                  type="button"
                  variante="secundario"
                  disabled={indice === bloques.length - 1}
                  onClick={() => moverBloque(indice, 1)}
                >
                  Mover abajo
                </Boton>
                <Boton type="button" variante="peligro" onClick={() => quitarBloque(indice)}>
                  Quitar bloque
                </Boton>
              </div>
            </div>

            {bloque.tipo === "texto" ? (
              <EditorTextoEnriquecido
                etiqueta="Contenido"
                valor={bloque.contenido}
                onCambiar={(markdown) => actualizarBloque(indice, { tipo: "texto", contenido: markdown })}
              />
            ) : null}

            {bloque.tipo === "imagen" ? (
              <div className="flex flex-col gap-xs">
                <label htmlFor={`imagen-${indice}`} className="text-sm font-medium text-texto">
                  Archivo de imagen
                </label>
                <input
                  id={`imagen-${indice}`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(evento) => {
                    const archivo = evento.target.files?.[0];
                    if (archivo) void alSeleccionarArchivo(indice, bloque, archivo);
                  }}
                />
                {bloque.url ? <img src={bloque.url} alt="Vista previa de la imagen" className="max-w-xs rounded-md border border-borde" /> : null}
                <CampoTexto
                  etiqueta="Texto alternativo"
                  value={bloque.textoAlternativo ?? ""}
                  onChange={(evento) =>
                    actualizarBloque(indice, { ...bloque, textoAlternativo: evento.target.value })
                  }
                />
              </div>
            ) : null}

            {bloque.tipo === "enlace" ? (
              <div className="flex flex-col gap-xs">
                <CampoTexto
                  etiqueta="URL"
                  value={bloque.url}
                  onChange={(evento) => actualizarBloque(indice, { ...bloque, url: evento.target.value })}
                />
                <CampoTexto
                  etiqueta="Titulo del enlace"
                  value={bloque.titulo}
                  onChange={(evento) => actualizarBloque(indice, { ...bloque, titulo: evento.target.value })}
                />
                <CampoTexto
                  etiqueta="Descripcion"
                  value={bloque.descripcion ?? ""}
                  onChange={(evento) =>
                    actualizarBloque(indice, { ...bloque, descripcion: evento.target.value })
                  }
                />
              </div>
            ) : null}

            {bloque.tipo === "actividad" ? (
              <CampoTexto
                etiqueta="ID de la actividad"
                type="number"
                textoAyuda="Ingresa el id devuelto al crear la actividad en la seccion de abajo."
                value={bloque.idActividad || ""}
                onChange={(evento) =>
                  actualizarBloque(indice, {
                    tipo: "actividad",
                    idActividad: Number(evento.target.value),
                  })
                }
              />
            ) : null}
          </fieldset>
        ))}
      </div>

      {errorSubida ? (
        <p role="alert" className="text-sm text-peligro">
          {errorSubida}
        </p>
      ) : null}

      <div className="flex items-end gap-sm">
        <CampoSelector
          etiqueta="Tipo de bloque a agregar"
          opciones={TIPOS_AGREGABLES}
          value={tipoAAgregar}
          onChange={(evento) => setTipoAAgregar(evento.target.value)}
        />
        <Boton
          type="button"
          variante="secundario"
          onClick={() => onCambiar([...bloques, bloqueVacio(tipoAAgregar)])}
        >
          Agregar bloque
        </Boton>
      </div>
    </div>
  );
}
