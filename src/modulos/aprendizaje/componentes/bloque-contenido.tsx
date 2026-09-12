// Renderiza un bloque de contenido de un modulo (texto, imagen, enlace o
// actividad) segun su forma discriminada por "tipo" (docs/contrato-api.md
// seccion 4.1). Reutilizado por la vista de contenido de modulo (RF-23).
import Markdown from "react-markdown";
import type { BloqueContenido as TipoBloqueContenido } from "@/tipos/aprendizaje";

interface Props {
  bloque: TipoBloqueContenido;
}

export function BloqueContenido({ bloque }: Props) {
  switch (bloque.tipo) {
    case "texto":
      return (
        <div className="prose prose-sm max-w-none text-texto">
          <Markdown>{bloque.contenido}</Markdown>
        </div>
      );
    case "imagen":
      return (
        <img
          src={bloque.url}
          alt={bloque.textoAlternativo ?? ""}
          className="max-w-full rounded-md border border-borde"
        />
      );
    case "enlace":
      return (
        <a
          href={bloque.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-md border border-borde p-sm text-primario hover:underline"
        >
          <span className="font-medium">{bloque.titulo}</span>
          {bloque.descripcion ? (
            <p className="text-sm text-texto-secundario">{bloque.descripcion}</p>
          ) : null}
        </a>
      );
    case "actividad":
      return (
        <div className="rounded-md border border-borde bg-fondo p-sm">
          <p className="text-sm font-medium text-texto">Actividad practica</p>
          {bloque.descripcion ? (
            <p className="text-sm text-texto-secundario">{bloque.descripcion}</p>
          ) : null}
        </div>
      );
  }
}
