// Asistente de creacion de un servicio contenedorizado.
// Cubre: RF-05, RF-06, RF-07, RF-09, RNF-02, RNF-05 — CU-03
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { useImagenesDocker } from "../hooks/use-imagenes-docker";
import { useCrearServicio } from "../hooks/use-crear-servicio";

const esquemaCrearServicio = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripcion no puede superar los 500 caracteres")
    .optional(),
  imagenDocker: z
    .string()
    .min(1, "La imagen Docker es obligatoria")
    .max(255, "La imagen Docker no puede superar los 255 caracteres"),
  cpuAsignado: z
    .number({ invalid_type_error: "La CPU asignada es obligatoria" })
    .positive("La CPU asignada debe ser mayor a 0")
    .max(8, "La CPU asignada no puede superar los 8 nucleos"),
  memoriaAsignada: z
    .number({ invalid_type_error: "La memoria asignada es obligatoria" })
    .int("La memoria asignada debe ser un numero entero")
    .positive("La memoria asignada debe ser mayor a 0")
    .max(131072, "La memoria asignada no puede superar los 131072 MB"),
  almacenamientoAsignado: z
    .number({ invalid_type_error: "El almacenamiento asignado es obligatorio" })
    .int("El almacenamiento asignado debe ser un numero entero")
    .positive("El almacenamiento asignado debe ser mayor a 0")
    .max(1048576, "El almacenamiento asignado no puede superar los 1048576 MB"),
});

type DatosFormularioCrearServicio = z.infer<typeof esquemaCrearServicio>;

const CAMPOS_FORMULARIO = [
  "nombre",
  "descripcion",
  "imagenDocker",
  "cpuAsignado",
  "memoriaAsignada",
  "almacenamientoAsignado",
] as const;

function nombreCampoFormulario(campo: string): keyof DatosFormularioCrearServicio | null {
  const sinPrefijo = campo.startsWith("configuracion.")
    ? campo.slice("configuracion.".length)
    : campo;
  return (CAMPOS_FORMULARIO as readonly string[]).includes(sinPrefijo)
    ? (sinPrefijo as keyof DatosFormularioCrearServicio)
    : null;
}

export function CrearServicioPage() {
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const navegar = useNavigate();
  const { data: imagenes } = useImagenesDocker();
  const crearServicio = useCrearServicio();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormularioCrearServicio>({
    resolver: zodResolver(esquemaCrearServicio),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      nombre: "",
      descripcion: "",
      imagenDocker: "",
    },
  });

  async function alEnviar(datos: DatosFormularioCrearServicio) {
    setErrorEnvio(null);
    try {
      const servicio = await crearServicio.mutateAsync({
        nombre: datos.nombre,
        descripcion: datos.descripcion || undefined,
        configuracion: {
          imagenDocker: datos.imagenDocker,
          cpuAsignado: datos.cpuAsignado,
          memoriaAsignada: datos.memoriaAsignada,
          almacenamientoAsignado: datos.almacenamientoAsignado,
          puertos: [],
          variablesEntorno: {},
          volumenes: [],
        },
      });
      navegar(`/servicios/${servicio.idServicio}`, { replace: true });
    } catch (error) {
      const errorApi = normalizarErrorApi(error);

      if (isAxiosError(error) && error.response?.status === 422 && errorApi.solicitado && errorApi.disponible) {
        const { solicitado, disponible } = errorApi;
        setErrorEnvio(
          `${errorApi.mensaje}. Solicitado: ${solicitado.cpu} CPU, ${solicitado.memoria} MB memoria, ` +
            `${solicitado.almacenamiento} MB almacenamiento. Disponible: ${disponible.cpu} CPU, ` +
            `${disponible.memoria} MB memoria, ${disponible.almacenamiento} MB almacenamiento.`
        );
        return;
      }

      if (isAxiosError(error) && error.response?.status === 400) {
        const asignado = errorApi.detalles?.some((detalle) => {
          const campo = nombreCampoFormulario(detalle.campo);
          if (!campo) return false;
          setError(campo, { message: detalle.mensaje });
          return true;
        });
        if (asignado) return;
      }

      setErrorEnvio(errorApi.mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Crear servicio</h1>
      <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
        <CampoTexto etiqueta="Nombre" error={errors.nombre?.message} {...register("nombre")} />
        <CampoTexto
          etiqueta="Descripcion"
          error={errors.descripcion?.message}
          {...register("descripcion")}
        />
        <CampoTexto
          etiqueta="Imagen Docker"
          list="imagenes-docker"
          textoAyuda="Elige una imagen sugerida o escribe otra, por ejemplo postgres:16-alpine"
          error={errors.imagenDocker?.message}
          {...register("imagenDocker")}
        />
        <datalist id="imagenes-docker">
          {imagenes?.map((imagen) => (
            <option key={imagen.nombre} value={imagen.nombre}>
              {imagen.descripcion}
            </option>
          ))}
        </datalist>
        <CampoTexto
          etiqueta="CPU (nucleos)"
          type="number"
          step="0.5"
          error={errors.cpuAsignado?.message}
          {...register("cpuAsignado", { valueAsNumber: true })}
        />
        <CampoTexto
          etiqueta="Memoria (MB)"
          type="number"
          error={errors.memoriaAsignada?.message}
          {...register("memoriaAsignada", { valueAsNumber: true })}
        />
        <CampoTexto
          etiqueta="Almacenamiento (MB)"
          type="number"
          error={errors.almacenamientoAsignado?.message}
          {...register("almacenamientoAsignado", { valueAsNumber: true })}
        />
        {errorEnvio ? (
          <p role="alert" className="text-sm text-peligro">
            {errorEnvio}
          </p>
        ) : null}
        <Boton type="submit" cargando={crearServicio.isPending}>
          Crear servicio
        </Boton>
      </form>
    </main>
  );
}
