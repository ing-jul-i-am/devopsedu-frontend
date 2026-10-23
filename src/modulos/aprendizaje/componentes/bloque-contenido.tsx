// Renderiza un bloque de contenido de un modulo (texto, imagen, enlace o
// actividad) segun su forma discriminada por "tipo" (docs/contrato-api.md
// secciones 4.1 y 6.1b). Reutilizado por la vista de contenido de modulo (RF-23).
import Markdown from "react-markdown";
import type { BloqueContenidoEstudiante } from "@/tipos/aprendizaje";
import { TarjetaActividad } from "./tarjeta-actividad";

interface Props {
  bloque: BloqueContenidoEstudiante;
  numeroActividad?: number | undefined;
}

export function BloqueContenido({ bloque, numeroActividad }: Props) {
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
      return <TarjetaActividad actividad={bloque} numero={numeroActividad} />;
  }
}
