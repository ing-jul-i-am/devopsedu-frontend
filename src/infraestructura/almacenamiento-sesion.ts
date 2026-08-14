const CLAVE_TOKEN = "devopsedu:token";

export interface UsuarioSesion {
  idUsuario: number;
  nombre: string;
  correo: string;
  fechaRegistro: string;
  idRol: number;
}

const CLAVE_USUARIO = "devopsedu:usuario";

/**
 * `persistente` refleja el checkbox "recordar sesion" del mockup (Vista 01):
 * marcado usa localStorage (sobrevive al cierre del navegador), desmarcado
 * usa sessionStorage (se pierde al cerrar la pestaña).
 */
export function guardarSesion(
  token: string,
  usuario: UsuarioSesion,
  persistente = true
): void {
  const almacenamiento = persistente ? localStorage : sessionStorage;
  almacenamiento.setItem(CLAVE_TOKEN, token);
  almacenamiento.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function obtenerToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN) ?? sessionStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuario(): UsuarioSesion | null {
  const crudo = localStorage.getItem(CLAVE_USUARIO) ?? sessionStorage.getItem(CLAVE_USUARIO);
  if (!crudo) return null;
  return JSON.parse(crudo) as UsuarioSesion;
}

export function limpiarSesion(): void {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
}
