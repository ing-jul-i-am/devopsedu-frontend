import axios, { type AxiosInstance } from "axios";
import { configuracion } from "./configuracion";
import { limpiarSesion, obtenerToken } from "./almacenamiento-sesion";

export const clienteHttp: AxiosInstance = axios.create({
  baseURL: configuracion.prefijoApi,
});

clienteHttp.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      limpiarSesion();
      window.location.assign("/iniciar-sesion");
    }
    return Promise.reject(error);
  }
);
