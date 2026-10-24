import { isAxiosError } from "axios";

export interface RecursoCantidad {
  cpu: number;
  memoria: number;
  almacenamiento: number;
}

export interface DetalleCampoInvalido {
  campo: string;
  mensaje: string;
}

export interface ErrorApi {
  mensaje: string;
  detalles?: DetalleCampoInvalido[];
  solicitado?: RecursoCantidad;
  disponible?: RecursoCantidad;
}

const MENSAJE_SIN_RESPUESTA = "No fue posible comunicarse con el servidor";
const MENSAJE_GENERICO = "Ocurrio un error inesperado";

export function normalizarErrorApi(error: unknown): ErrorApi {
  if (!isAxiosError(error) || !error.response) {
    return { mensaje: MENSAJE_SIN_RESPUESTA };
  }

  const datos: unknown = error.response.data;
  if (!esRegistro(datos)) {
    return { mensaje: MENSAJE_GENERICO };
  }

  const mensaje = typeof datos["error"] === "string" ? datos["error"] : MENSAJE_GENERICO;
  const resultado: ErrorApi = { mensaje };

  if (Array.isArray(datos["detalles"])) {
    resultado.detalles = datos["detalles"] as DetalleCampoInvalido[];
  }
  if (esRecursoCantidad(datos["solicitado"])) {
    resultado.solicitado = datos["solicitado"];
  }
  if (esRecursoCantidad(datos["disponible"])) {
    resultado.disponible = datos["disponible"];
  }

  return resultado;
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function esRecursoCantidad(valor: unknown): valor is RecursoCantidad {
  return (
    esRegistro(valor) &&
    typeof valor["cpu"] === "number" &&
    typeof valor["memoria"] === "number" &&
    typeof valor["almacenamiento"] === "number"
  );
}

/**
 * En una descarga (`responseType: "blob"`) el cuerpo de un error tambien llega
 * como Blob, aunque contenga el JSON de error de la API (DT-19). Se lee su
 * texto antes de normalizarlo para mostrar el mismo mensaje que en el resto
 * de la aplicacion.
 */
export async function normalizarErrorApiDescarga(error: unknown): Promise<ErrorApi> {
  if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) {
    return normalizarErrorApi(error);
  }

  try {
    const datos: unknown = JSON.parse(await error.response.data.text());
    return normalizarErrorApi({
      ...error,
      isAxiosError: true,
      response: { ...error.response, data: datos },
    });
  } catch {
    return { mensaje: MENSAJE_GENERICO };
  }
}
