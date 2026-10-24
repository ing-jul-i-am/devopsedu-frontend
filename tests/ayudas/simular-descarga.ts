// Simula la descarga de archivos del navegador (DT-19): reemplaza
// URL.createObjectURL y revokeObjectURL, y registra los clics sobre enlaces
// de descarga sin navegar. `restaurar` deja todo como estaba.
import { vi } from "vitest";

export interface DescargaRegistrada {
  nombre: string;
  contenido: Blob;
}

export function simularDescarga() {
  const originales = {
    crear: URL.createObjectURL,
    liberar: URL.revokeObjectURL,
  };
  const contenidos = new Map<string, Blob>();
  const descargas: DescargaRegistrada[] = [];
  let contador = 0;

  const crearUrl = vi.fn((contenido: Blob) => {
    contador += 1;
    const url = `blob:descarga-${contador}`;
    contenidos.set(url, contenido);
    return url;
  });
  const liberarUrl = vi.fn();
  URL.createObjectURL = crearUrl;
  URL.revokeObjectURL = liberarUrl;

  const clic = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    const contenido = contenidos.get(this.href);
    if (contenido) {
      descargas.push({ nombre: this.download, contenido });
    }
  });

  return {
    descargas,
    crearUrl,
    liberarUrl,
    restaurar() {
      URL.createObjectURL = originales.crear;
      URL.revokeObjectURL = originales.liberar;
      clic.mockRestore();
    },
  };
}
