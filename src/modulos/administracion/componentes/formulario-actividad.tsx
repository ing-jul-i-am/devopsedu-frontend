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
import type { CondicionesActividad } from "@/tipos/aprendizaje";

const OPERACIONES = [
  { valor: "desplegar", etiqueta: "Desplegar" },
  { valor: "detener", etiqueta: "Detener" },
  { valor: "reiniciar", etiqueta: "Reiniciar" },
  { valor: "eliminar", etiqueta: "Eliminar" },
];

// Las condiciones son opcionales: un campo vacio se convierte en undefined para
// que no viaje en el cuerpo. El backend solo evalua las que recibe.
const numeroOpcional = (mensaje: string) =>
  z.preprocess(
    (valor) => (valor === "" || valor === null || Number.isNaN(valor) ? undefined : valor),
    z.number({ invalid_type_error: mensaje }).optional()
  );

const esquemaActividad = z.object({
  descripcion: z.string().min(3, "La descripcion debe tener al menos 3 caracteres"),
  operacion: z.enum(["desplegar", "detener", "reiniciar", "eliminar"]),
  orden: z
    .number({ invalid_type_error: "El orden es obligatorio" })
    .int("El orden debe ser un numero entero")
    .positive("El orden debe ser mayor a 0"),
  imagenDocker: z.string().optional(),
  puertosMinimos: numeroOpcional("Los puertos minimos deben ser un numero"),
  volumenesMinimos: numeroOpcional("Los volumenes minimos deben ser un numero"),
  cpuMinimo: numeroOpcional("La CPU minima debe ser un numero"),
  memoriaMinima: numeroOpcional("La memoria minima debe ser un numero"),
});

type DatosFormulario = z.infer<typeof esquemaActividad>;

function construirCondiciones(datos: DatosFormulario): CondicionesActividad | undefined {
  const condiciones: CondicionesActividad = {};
  if (datos.imagenDocker) condiciones.imagenDocker = datos.imagenDocker;
  if (datos.puertosMinimos !== undefined) condiciones.puertosMinimos = datos.puertosMinimos;
  if (datos.volumenesMinimos !== undefined)
    condiciones.volumenesMinimos = datos.volumenesMinimos;
  if (datos.cpuMinimo !== undefined) condiciones.cpuMinimo = datos.cpuMinimo;
  if (datos.memoriaMinima !== undefined) condiciones.memoriaMinima = datos.memoriaMinima;
  return Object.keys(condiciones).length > 0 ? condiciones : undefined;
}

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
      const condiciones = construirCondiciones(datos);
      const actividad = await crearActividad.mutateAsync({
        descripcion: datos.descripcion,
        criteriosValidacion: condiciones
          ? { operacion: datos.operacion, condiciones }
          : { operacion: datos.operacion },
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

      <fieldset className="flex flex-col gap-sm rounded-md border border-borde p-sm">
        <legend className="text-sm font-medium text-texto">
          Condiciones de aprobacion (opcionales)
        </legend>
        <p className="text-xs text-texto-secundario">
          Si dejas estos campos vacios, la actividad se aprueba con solo ejecutar la operacion
          indicada sobre cualquier servicio.
        </p>
        <CampoTexto
          etiqueta="Imagen Docker exigida"
          textoAyuda="Se compara de forma exacta, incluyendo la etiqueta: nginx no coincide con nginx:1.27-alpine."
          error={errors.imagenDocker?.message}
          {...register("imagenDocker")}
        />
        <CampoTexto
          etiqueta="Puertos minimos"
          type="number"
          textoAyuda="Cantidad minima de puertos que debe publicar el servicio."
          error={errors.puertosMinimos?.message}
          {...register("puertosMinimos", { valueAsNumber: true })}
        />
        <CampoTexto
          etiqueta="Volumenes minimos"
          type="number"
          textoAyuda="Cantidad minima de volumenes que debe montar el servicio."
          error={errors.volumenesMinimos?.message}
          {...register("volumenesMinimos", { valueAsNumber: true })}
        />
        <CampoTexto
          etiqueta="CPU minima (nucleos)"
          type="number"
          step="0.5"
          error={errors.cpuMinimo?.message}
          {...register("cpuMinimo", { valueAsNumber: true })}
        />
        <CampoTexto
          etiqueta="Memoria minima (MB)"
          type="number"
          error={errors.memoriaMinima?.message}
          {...register("memoriaMinima", { valueAsNumber: true })}
        />
      </fieldset>

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
