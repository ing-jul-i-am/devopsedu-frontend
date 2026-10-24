// Descarga de archivos que entrega la API, como el reporte exportado (DT-19):
// lectura del nombre propuesto en Content-Disposition y guardado mediante un
// enlace temporal sobre una URL de objeto, que se libera al terminar.
// Cubre: RF-25 — CU-16

export function extraerNombreArchivo(cabecera: string | undefined, nombrePorDefecto: string) {
  if (!cabecera) {
    return nombrePorDefecto;
  }

  const codificado = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cabecera)?.[1];
  if (codificado) {
    try {
      return decodeURIComponent(codificado.trim());
    } catch {
      // Si la codificacion es invalida se intenta con filename sin codificar.
    }
  }

  const simple = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(cabecera);
  const nombre = (simple?.[2] ?? simple?.[1])?.trim();
  return nombre ? nombre : nombrePorDefecto;
}

export function guardarArchivo(contenido: Blob, nombre: string) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
