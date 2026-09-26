// Asistente de creacion de un servicio contenedorizado, en dos pasos: datos y
// recursos primero, configuracion avanzada (puertos, variables de entorno y
// volumenes) despues. Ver DT-13.
// Cubre: RF-05, RF-06, RF-07, RF-09, RNF-02, RNF-05 — CU-03
import { useState } from "react";
import { FormProvider, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { camposConfiguracion, validarCrucesConfiguracion } from "../esquema-configuracion";
import { aRegistroVariables } from "../utilidades/variables-entorno";
import { CamposRecursos } from "../componentes/campos-recursos";
import { PasoConfiguracionAvanzada } from "../componentes/paso-configuracion-avanzada";
import { useCrearServicio } from "../hooks/use-crear-servicio";

const esquemaCrearServicio = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(120, "El nombre no puede superar los 120 caracteres"),
    descripcion: z
      .string()
      .max(500, "La descripcion no puede superar los 500 caracteres")
      .optional(),
    ...camposConfiguracion,
  })
  .superRefine(validarCrucesConfiguracion);

type DatosFormularioCrearServicio = z.infer<typeof esquemaCrearServicio>;
type RutaCampo = Path<DatosFormularioCrearServicio>;

const CAMPOS_PASO_UNO = [
  "nombre",
  "descripcion",
  "imagenDocker",
  "cpuAsignado",
  "memoriaAsignada",
  "almacenamientoAsignado",
] as const;

const RAICES_PASO_DOS = ["puertos", "variablesEntorno", "volumenes"];

// Traduce el `campo` en notacion de punto que devuelve el backend (contrato
// seccion 1.4, por ejemplo "configuracion.puertos.0.host") a la ruta del
// formulario, e indica en que paso del asistente vive para poder mostrarlo.
function ubicarCampoFormulario(campo: string): { ruta: RutaCampo; paso: 1 | 2 } | null {
  const sinPrefijo = campo.startsWith("configuracion.")
    ? campo.slice("configuracion.".length)
    : campo;
  const partes = sinPrefijo.split(".");
  const raiz = partes[0];
  if (!raiz) return null;

  if ((CAMPOS_PASO_UNO as readonly string[]).includes(raiz)) {
    return partes.length === 1 ? { ruta: raiz as RutaCampo, paso: 1 } : null;
  }

  // Las listas del paso 2 solo se pueden marcar cuando el backend indica el
  // indice del elemento; variablesEntorno viaja como diccionario, asi que sus
  // errores no tienen equivalente en la lista de pares del formulario.
  if (RAICES_PASO_DOS.includes(raiz) && partes.length === 3 && /^\d+$/.test(partes[1] ?? "")) {
    return { ruta: sinPrefijo as RutaCampo, paso: 2 };
  }

  return null;
}

export function CrearServicioPage() {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const navegar = useNavigate();
  const crearServicio = useCrearServicio();

  const metodos = useForm<DatosFormularioCrearServicio>({
    resolver: zodResolver(esquemaCrearServicio),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      nombre: "",
      descripcion: "",
      imagenDocker: "",
      puertos: [],
      variablesEntorno: [],
      volumenes: [],
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors },
  } = metodos;

  async function alPulsarSiguiente() {
    const esValido = await trigger([...CAMPOS_PASO_UNO]);
    if (esValido) setPaso(2);
  }

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
          puertos: datos.puertos,
          variablesEntorno: aRegistroVariables(datos.variablesEntorno),
          volumenes: datos.volumenes,
        },
      });
      navegar(`/servicios/${servicio.idServicio}`, { replace: true });
    } catch (error) {
      const errorApi = normalizarErrorApi(error);

      if (
        isAxiosError(error) &&
        error.response?.status === 422 &&
        errorApi.solicitado &&
        errorApi.disponible
      ) {
        const { solicitado, disponible } = errorApi;
        setErrorEnvio(
          `${errorApi.mensaje}. Solicitado: ${solicitado.cpu} CPU, ${solicitado.memoria} MB memoria, ` +
            `${solicitado.almacenamiento} MB almacenamiento. Disponible: ${disponible.cpu} CPU, ` +
            `${disponible.memoria} MB memoria, ${disponible.almacenamiento} MB almacenamiento.`
        );
        return;
      }

      // DT-16 del backend: el nombre solo esta reservado entre los servicios
      // activos del usuario. El error es del paso 1, asi que hay que volver a el.
      if (isAxiosError(error) && error.response?.status === 409) {
        setError("nombre", { message: errorApi.mensaje });
        setPaso(1);
        return;
      }

      if (isAxiosError(error) && error.response?.status === 400) {
        let pasoConError: 1 | 2 | null = null;
        for (const detalle of errorApi.detalles ?? []) {
          const ubicacion = ubicarCampoFormulario(detalle.campo);
          if (!ubicacion) continue;
          setError(ubicacion.ruta, { message: detalle.mensaje });
          // Si el error mas temprano esta en el paso 1, hay que volver a el
          // para que el usuario pueda verlo.
          if (pasoConError === null || ubicacion.paso < pasoConError) {
            pasoConError = ubicacion.paso;
          }
        }
        if (pasoConError !== null) {
          setPaso(pasoConError);
          return;
        }
      }

      setErrorEnvio(errorApi.mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Crear servicio</h1>
      <h2 aria-live="polite" className="text-sm font-medium text-texto-secundario">
        {paso === 1
          ? "Paso 1 de 2: Datos del servicio"
          : "Paso 2 de 2: Configuracion avanzada"}
      </h2>

      <FormProvider {...metodos}>
        <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
          {paso === 1 ? (
            <>
              <CampoTexto
                etiqueta="Nombre"
                textoAyuda="Debe ser distinto al de tus otros servicios activos. Al eliminar un servicio su nombre vuelve a quedar libre."
                error={errors.nombre?.message}
                {...register("nombre")}
              />
              <CampoTexto
                etiqueta="Descripcion"
                error={errors.descripcion?.message}
                {...register("descripcion")}
              />
              <CamposRecursos />
              <Boton type="button" onClick={() => void alPulsarSiguiente()}>
                Siguiente
              </Boton>
            </>
          ) : (
            <>
              <PasoConfiguracionAvanzada />

              {errorEnvio ? (
                <p role="alert" className="text-sm text-peligro">
                  {errorEnvio}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-sm">
                <Boton type="button" variante="secundario" onClick={() => setPaso(1)}>
                  Atras
                </Boton>
                <Boton type="submit" cargando={crearServicio.isPending}>
                  Crear servicio
                </Boton>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </main>
  );
}
