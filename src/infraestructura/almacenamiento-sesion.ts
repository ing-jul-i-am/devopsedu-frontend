const CLAVE_TOKEN = "devopsedu:token";

export interface UsuarioSesion {
  idUsuario: number;
  nombre: string;
  correo: string;
  fechaRegistro: string;
  idRol: number;
}

const CLAVE_USUARIO = "devopsedu:usuario";

export function guardarSesion(token: string, usuario: UsuarioSesion): void {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function obtenerToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuario(): UsuarioSesion | null {
  const crudo = localStorage.getItem(CLAVE_USUARIO);
  if (!crudo) return null;
  return JSON.parse(crudo) as UsuarioSesion;
}

export function limpiarSesion(): void {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}
