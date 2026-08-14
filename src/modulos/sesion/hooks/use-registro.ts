// Mutacion de TanStack Query para POST /api/auth/registro.
// Cubre: RF-01 — DT-01 (el rol no se envia desde el cliente)
import { useMutation } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";
import type { UsuarioSesion } from "@/infraestructura/almacenamiento-sesion";

interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface RespuestaRegistro {
  usuario: UsuarioSesion;
}

export function useRegistro() {
  return useMutation({
    mutationFn: async (datos: DatosRegistro) => {
      const { data } = await clienteHttp.post<RespuestaRegistro>("/auth/registro", datos);
      return data;
    },
  });
}
