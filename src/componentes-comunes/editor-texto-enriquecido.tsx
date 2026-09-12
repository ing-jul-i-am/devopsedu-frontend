// Editor de texto enriquecido (WYSIWYG) que serializa su contenido a
// Markdown, usado para el bloque "texto" de un modulo de aprendizaje
// (docs/contrato-api.md seccion 4.1: el campo `contenido` de ese bloque es
// Markdown). El docente no escribe Markdown crudo: da formato visual con la
// barra de herramientas y el editor exporta el Markdown equivalente.
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";
import { useEffect, useId } from "react";
import { Boton } from "./boton";

function obtenerAlmacenMarkdown(storage: unknown): MarkdownStorage {
  return (storage as { markdown: MarkdownStorage }).markdown;
}

interface Props {
  etiqueta: string;
  valor: string;
  onCambiar: (markdown: string) => void;
}

export function EditorTextoEnriquecido({ etiqueta, valor, onCambiar }: Props) {
  const idEditor = useId();

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: valor,
    onUpdate: ({ editor }) => {
      onCambiar(obtenerAlmacenMarkdown(editor.storage).getMarkdown());
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-xs">
      <span id={idEditor} className="text-sm font-medium text-texto">
        {etiqueta}
      </span>
      <div className="flex gap-xs" role="toolbar" aria-label={`Formato de ${etiqueta}`}>
        <Boton
          type="button"
          variante="secundario"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Negrita
        </Boton>
        <Boton
          type="button"
          variante="secundario"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Cursiva
        </Boton>
        <Boton
          type="button"
          variante="secundario"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </Boton>
      </div>
      <EditorContent
        editor={editor}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={idEditor}
        className="min-h-24 rounded-md border border-borde bg-superficie px-sm py-xs text-texto focus-within:border-enfoque focus-within:outline-none focus-within:ring-2 focus-within:ring-enfoque"
      />
    </div>
  );
}
