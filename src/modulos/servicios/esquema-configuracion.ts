// Unica fuente de verdad de la validacion de configuracion de un servicio,
// compartida por el asistente de creacion (RF-05, RF-06) y por la edicion de
// configuracion (RF-08). Replica los limites del contrato de API seccion 3.5 y
// agrega dos reglas de consistencia que el backend no aplica hoy: puertos de
// host duplicados y claves de variable duplicadas, que fallarian en silencio.
// Cubre: RF-05, RF-06, RF-08, RNF-02 — CU-03
import { z } from "zod";

const FORMATO_CLAVE_ENTORNO = /^[A-Za-z_][A-Za-z0-9_]*$/;

function numeroDePuerto(etiqueta: string) {
  return z
    .number({ invalid_type_error: `${etiqueta} es obligatorio` })
    .int(`${etiqueta} debe ser un numero entero`)
    .min(1, `${etiqueta} debe estar entre 1 y 65535`)
    .max(65535, `${etiqueta} debe estar entre 1 y 65535`);
}

export const esquemaPuerto = z.object({
  host: numeroDePuerto("El puerto del host"),
  contenedor: numeroDePuerto("El puerto del contenedor"),
  protocolo: z.enum(["tcp", "udp"], { invalid_type_error: "Elige un protocolo" }),
});

export const esquemaVariableEntorno = z.object({
  clave: z
    .string()
    .min(1, "La clave es obligatoria")
    .max(255, "La clave no puede superar los 255 caracteres")
    .regex(
      FORMATO_CLAVE_ENTORNO,
      "La clave solo admite letras, numeros y guion bajo, y no puede empezar con un numero"
    ),
  valor: z.string().max(4096, "El valor no puede superar los 4096 caracteres"),
});

export const esquemaVolumen = z.object({
  origen: z.string().min(1, "La ruta en el host es obligatoria"),
  destino: z
    .string()
    .min(1, "La ruta en el contenedor es obligatoria")
    .startsWith("/", "La ruta en el contenedor debe empezar con /"),
  modo: z.enum(["ro", "rw"], { invalid_type_error: "Elige un modo de acceso" }),
});

// Forma de objeto (no ZodObject) para poder combinarla con los campos propios
// de cada formulario antes de aplicar las reglas cruzadas.
export const camposConfiguracion = {
  imagenDocker: z
    .string()
    .min(1, "La imagen Docker es obligatoria")
    .max(255, "La imagen Docker no puede superar los 255 caracteres"),
  cpuAsignado: z
    .number({ invalid_type_error: "La CPU asignada es obligatoria" })
    .positive("La CPU asignada debe ser mayor a 0")
    .max(8, "La CPU asignada no puede superar los 8 nucleos"),
  memoriaAsignada: z
    .number({ invalid_type_error: "La memoria asignada es obligatoria" })
    .int("La memoria asignada debe ser un numero entero")
    .positive("La memoria asignada debe ser mayor a 0")
    .max(131072, "La memoria asignada no puede superar los 131072 MB"),
  almacenamientoAsignado: z
    .number({ invalid_type_error: "El almacenamiento asignado es obligatorio" })
    .int("El almacenamiento asignado debe ser un numero entero")
    .positive("El almacenamiento asignado debe ser mayor a 0")
    .max(1048576, "El almacenamiento asignado no puede superar los 1048576 MB"),
  puertos: z.array(esquemaPuerto),
  variablesEntorno: z.array(esquemaVariableEntorno),
  volumenes: z.array(esquemaVolumen),
};

interface ValorConListas {
  puertos: { host: number }[];
  variablesEntorno: { clave: string }[];
}

export function validarCrucesConfiguracion(valor: ValorConListas, ctx: z.RefinementCtx): void {
  const puertosVistos = new Set<number>();
  valor.puertos.forEach((puerto, indice) => {
    if (puertosVistos.has(puerto.host)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["puertos", indice, "host"],
        message: `El puerto ${puerto.host} del host ya esta asignado en este servicio`,
      });
      return;
    }
    puertosVistos.add(puerto.host);
  });

  const clavesVistas = new Set<string>();
  valor.variablesEntorno.forEach((variable, indice) => {
    if (clavesVistas.has(variable.clave)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variablesEntorno", indice, "clave"],
        message: `La variable ${variable.clave} ya esta definida en este servicio`,
      });
      return;
    }
    clavesVistas.add(variable.clave);
  });
}

export type DatosConfiguracionFormulario = z.infer<z.ZodObject<typeof camposConfiguracion>>;
