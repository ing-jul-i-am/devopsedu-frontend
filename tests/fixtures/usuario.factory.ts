import type { UsuarioSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_ESTUDIANTE } from "@/tipos/roles";

let contador = 0;

export function crearUsuarioDePrueba(
  sobreescrituras: Partial<UsuarioSesion> = {}
): UsuarioSesion {
  contador += 1;
  return {
    idUsuario: contador,
    nombre: "Estudiante de prueba",
    correo: `estudiante${contador}@devopsedu.local`,
    fechaRegistro: "2026-08-07T00:00:00.000Z",
    idRol: ID_ROL_ESTUDIANTE,
    ...sobreescrituras,
  };
}
