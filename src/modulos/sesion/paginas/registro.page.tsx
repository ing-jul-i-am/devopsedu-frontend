// Vista de registro de usuarios (mockup Vista 02).
// Cubre: RF-01, RNF-02, RNF-05 — DT-01 (sin campo de rol: el backend siempre
// asigna el rol "estudiante")
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useRegistro } from "../hooks/use-registro";

const esquemaRegistro = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  correo: z
    .string()
    .min(1, "El correo es obligatorio")
    .max(160, "El correo no puede superar los 160 caracteres")
    .email("Correo invalido"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede superar los 128 caracteres"),
});

type DatosFormularioRegistro = z.infer<typeof esquemaRegistro>;

const CAMPOS_FORMULARIO = ["nombre", "correo", "contrasena"] as const;

export function RegistroPage() {
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const registro = useRegistro();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormularioRegistro>({
    resolver: zodResolver(esquemaRegistro),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { nombre: "", correo: "", contrasena: "" },
  });

  async function alEnviar(datos: DatosFormularioRegistro) {
    setErrorEnvio(null);
    try {
      await registro.mutateAsync(datos);
      setRegistroExitoso(true);
    } catch (error) {
      const errorApi = normalizarErrorApi(error);
      if (isAxiosError(error) && error.response?.status === 400) {
        const asignado = errorApi.detalles?.some((detalle) => {
          if (!(CAMPOS_FORMULARIO as readonly string[]).includes(detalle.campo)) return false;
          setError(detalle.campo as keyof DatosFormularioRegistro, {
            message: detalle.mensaje,
          });
          return true;
        });
        if (asignado) return;
      }
      setErrorEnvio(errorApi.mensaje);
    }
  }

  if (registroExitoso) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-md p-lg">
        <h1 className="text-2xl font-semibold text-texto">Cuenta creada</h1>
        <p className="text-sm text-texto-secundario">
          Tu cuenta se creo correctamente. Ahora puedes iniciar sesion.
        </p>
        <Link to="/iniciar-sesion" className="text-primario underline">
          Iniciar sesion
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Crear cuenta</h1>
      <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
        <CampoTexto etiqueta="Nombre" error={errors.nombre?.message} {...register("nombre")} />
        <CampoTexto
          etiqueta="Correo institucional"
          type="email"
          error={errors.correo?.message}
          {...register("correo")}
        />
        <CampoTexto
          etiqueta="Contraseña"
          type="password"
          textoAyuda="Minimo 8 caracteres"
          error={errors.contrasena?.message}
          {...register("contrasena")}
        />
        {errorEnvio ? (
          <p role="alert" className="text-sm text-peligro">
            {errorEnvio}
          </p>
        ) : null}
        <Boton type="submit" cargando={registro.isPending}>
          Crear cuenta
        </Boton>
      </form>
      <p className="text-sm text-texto-secundario">
        Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesion</Link>
      </p>
    </main>
  );
}
