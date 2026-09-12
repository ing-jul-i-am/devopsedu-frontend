// Formulario para crear la actividad practica de un modulo (RF-23, CU-12,
// ver DT-10 del contrato). El id devuelto se referencia luego desde un
// bloque "actividad" en el contenido del modulo (EditorBloques).
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useCrearActividad } from "../hooks/use-crear-actividad";

const OPERACIONES = [
  { valor: "desplegar", etiqueta: "Desplegar" },
  { valor: "detener", etiqueta: "Detener" },
  { valor: "reiniciar", etiqueta: "Reiniciar" },
  { valor: "eliminar", etiqueta: "Eliminar" },
];

const esquemaActividad = z.object({
  descripcion: z.string().min(3, "La descripcion debe tener al menos 3 caracteres"),
  operacion: z.enum(["desplegar", "detener", "reiniciar", "eliminar"]),
  orden: z
    .number({ invalid_type_error: "El orden es obligatorio" })
    .int("El orden debe ser un numero entero")
    .positive("El orden debe ser mayor a 0"),
});

type DatosFormulario = z.infer<typeof esquemaActividad>;

interface Props {
  idModulo: number;
}

export function FormularioActividad({ idModulo }: Props) {
  const [idCreado, setIdCreado] = useState<number | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const crearActividad = useCrearActividad(idModulo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaActividad),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { descripcion: "" },
  });

  async function alEnviar(datos: DatosFormulario) {
    setErrorEnvio(null);
    setIdCreado(null);
    try {
      const actividad = await crearActividad.mutateAsync({
        descripcion: datos.descripcion,
        criteriosValidacion: { operacion: datos.operacion },
        orden: datos.orden,
      });
      setIdCreado(actividad.idActividad);
    } catch (error) {
      setErrorEnvio(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
      <CampoTexto
        etiqueta="Descripcion de la actividad"
        error={errors.descripcion?.message}
        {...register("descripcion")}
      />
      <CampoSelector
        etiqueta="Operacion"
        opciones={OPERACIONES}
        error={errors.operacion?.message}
        {...register("operacion")}
      />
      <CampoTexto
        etiqueta="Orden"
        type="number"
        error={errors.orden?.message}
        {...register("orden", { valueAsNumber: true })}
      />

      {idCreado !== null ? (
        <p role="status" className="text-sm text-exito">
          Actividad creada con id {idCreado}.
        </p>
      ) : null}

      {errorEnvio ? (
        <p role="alert" className="text-sm text-peligro">
          {errorEnvio}
        </p>
      ) : null}

      <Boton type="submit" cargando={crearActividad.isPending}>
        Crear actividad
      </Boton>
    </form>
  );
}
