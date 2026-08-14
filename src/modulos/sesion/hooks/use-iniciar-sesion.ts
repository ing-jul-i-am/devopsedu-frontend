// Mutacion de TanStack Query para POST /api/auth/login.
// Cubre: RF-02 — CU-01
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import { guardarSesion, type UsuarioSesion } from "@/infraestructura/almacenamiento-sesion";

interface DatosLogin {
  correo: string;
  contrasena: string;
  recordarSesion: boolean;
}

interface RespuestaLogin {
  token: string;
  usuario: UsuarioSesion;
}

export function useIniciarSesion() {
  return useMutation({
    mutationFn: async ({ correo, contrasena }: DatosLogin) => {
      const { data } = await clienteHttp.post<RespuestaLogin>("/auth/login", {
        correo,
        contrasena,
      });
      return data;
    },
    onSuccess: (datos, variables) => {
      guardarSesion(datos.token, datos.usuario, variables.recordarSesion);
    },
  });
}
