// Formulario compartido para crear y editar un modulo de aprendizaje.
// Cubre: RF-20, RNF-02, RNF-05 — CU-10
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { EditorBloques } from "./editor-bloques";
import type { BloqueContenido } from "@/tipos/aprendizaje";
import type { DatosModulo } from "../hooks/use-crear-modulo";

const esquemaModulo = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(160, "El nombre no puede superar los 160 caracteres"),
  orden: z
    .number({ invalid_type_error: "El orden es obligatorio" })
    .int("El orden debe ser un numero entero")
    .positive("El orden debe ser mayor a 0"),
});

type DatosFormulario = z.infer<typeof esquemaModulo>;

interface ValoresIniciales {
  nombre: string;
  orden: number;
  contenido: BloqueContenido[];
}

interface Props {
  valoresIniciales?: ValoresIniciales;
  alEnviar: (datos: DatosModulo) => Promise<void>;
  cargando: boolean;
  textoBoton: string;
}

export function FormularioModulo({ valoresIniciales, alEnviar, cargando, textoBoton }: Props) {
  const [bloques, setBloques] = useState<BloqueContenido[]>(valoresIniciales?.contenido ?? []);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaModulo),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      nombre: valoresIniciales?.nombre ?? "",
      ...(valoresIniciales ? { orden: valoresIniciales.orden } : {}),
    },
  });

  async function alConfirmar(datos: DatosFormulario) {
    setErrorEnvio(null);
    try {
      await alEnviar({ nombre: datos.nombre, orden: datos.orden, contenido: bloques });
    } catch (error) {
      const errorApi = normalizarErrorApi(error);

      if (isAxiosError(error) && error.response?.status === 400 && errorApi.detalles) {
        const asignado = errorApi.detalles.some((detalle) => {
          if (detalle.campo !== "nombre" && detalle.campo !== "orden") return false;
          setError(detalle.campo, { message: detalle.mensaje });
          return true;
        });
        if (asignado) return;
      }

      setErrorEnvio(errorApi.mensaje);
    }
  }

  return (
    <form onSubmit={handleSubmit(alConfirmar)} noValidate className="flex flex-col gap-md">
      <CampoTexto
        etiqueta="Nombre del modulo"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <CampoTexto
        etiqueta="Orden"
        type="number"
        error={errors.orden?.message}
        {...register("orden", { valueAsNumber: true })}
      />

      <EditorBloques bloques={bloques} onCambiar={setBloques} />

      {errorEnvio ? (
        <p role="alert" className="text-sm text-peligro">
          {errorEnvio}
        </p>
      ) : null}

      <Boton type="submit" cargando={cargando}>
        {textoBoton}
      </Boton>
    </form>
  );
}
