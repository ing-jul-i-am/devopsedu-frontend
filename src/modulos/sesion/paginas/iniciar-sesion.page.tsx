// Vista de inicio de sesion (mockup Vista 01).
// Cubre: RF-02, RNF-02, RNF-05 — CU-01
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CasillaVerificacion } from "@/componentes-comunes/casilla-verificacion";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useIniciarSesion } from "../hooks/use-iniciar-sesion";

const esquemaLogin = z.object({
  correo: z.string().min(1, "El correo es obligatorio").email("Correo invalido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
  recordarSesion: z.boolean(),
});

type DatosFormularioLogin = z.infer<typeof esquemaLogin>;

interface EstadoNavegacion {
  desde?: { pathname: string };
}

export function IniciarSesionPage() {
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const iniciarSesion = useIniciarSesion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { correo: "", contrasena: "", recordarSesion: true },
  });

  async function alEnviar(datos: DatosFormularioLogin) {
    setErrorEnvio(null);
    try {
      await iniciarSesion.mutateAsync(datos);
      const estado = ubicacion.state as EstadoNavegacion | null;
      navegar(estado?.desde?.pathname ?? "/", { replace: true });
    } catch (error) {
      setErrorEnvio(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Iniciar sesion</h1>
      <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
        <CampoTexto
          etiqueta="Correo institucional"
          type="email"
          error={errors.correo?.message}
          {...register("correo")}
        />
        <CampoTexto
          etiqueta="Contraseña"
          type="password"
          error={errors.contrasena?.message}
          {...register("contrasena")}
        />
        <CasillaVerificacion etiqueta="Recordar sesion" {...register("recordarSesion")} />
        {errorEnvio ? (
          <p role="alert" className="text-sm text-peligro">
            {errorEnvio}
          </p>
        ) : null}
        <Boton type="submit" cargando={iniciarSesion.isPending}>
          Entrar
        </Boton>
      </form>
      <p className="text-sm text-texto-secundario">
        No tienes cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </main>
  );
}
