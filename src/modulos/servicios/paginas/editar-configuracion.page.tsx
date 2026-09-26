// Edicion de la configuracion de un servicio existente, con los mismos dos
// pasos que el asistente de creacion: imagen y recursos primero, configuracion
// avanzada despues. Comparte esquema, editores y ambos pasos con la creacion
// (ver DT-13).
// Cubre: RF-08, RNF-02, RNF-05 — CU-03
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Boton } from "@/componentes-comunes/boton";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import {
  camposConfiguracion,
  validarCrucesConfiguracion,
  type DatosConfiguracionFormulario,
} from "../esquema-configuracion";
import { aParesVariables, aRegistroVariables } from "../utilidades/variables-entorno";
import { CamposRecursos } from "../componentes/campos-recursos";
import { PasoConfiguracionAvanzada } from "../componentes/paso-configuracion-avanzada";
import { useServicio } from "../hooks/use-servicio";
import { useEditarConfiguracion } from "../hooks/use-editar-configuracion";

const esquemaConfiguracion = z
  .object(camposConfiguracion)
  .superRefine(validarCrucesConfiguracion);

const CAMPOS_PASO_UNO = [
  "imagenDocker",
  "cpuAsignado",
  "memoriaAsignada",
  "almacenamientoAsignado",
] as const;

export function EditarConfiguracionPage() {
  const { idServicio } = useParams<{ idServicio: string }>();
  const id = Number(idServicio);
  const navegar = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const { data: servicio, isLoading, isError } = useServicio(id);
  const editarConfiguracion = useEditarConfiguracion(id);

  const metodos = useForm<DatosConfiguracionFormulario>({
    resolver: zodResolver(esquemaConfiguracion),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      imagenDocker: "",
      puertos: [],
      variablesEntorno: [],
      volumenes: [],
    },
  });

  const { handleSubmit, reset, trigger } = metodos;

  const configuracionVigente = servicio?.configuracion ?? null;

  useEffect(() => {
    if (!configuracionVigente) return;
    reset({
      imagenDocker: configuracionVigente.imagenDocker,
      cpuAsignado: configuracionVigente.cpuAsignado,
      memoriaAsignada: configuracionVigente.memoriaAsignada,
      almacenamientoAsignado: configuracionVigente.almacenamientoAsignado,
      puertos: configuracionVigente.puertos,
      variablesEntorno: aParesVariables(configuracionVigente.variablesEntorno),
      // `tipo` es un campo derivado de solo lectura: se descarta para que no
      // viaje de vuelta en el PUT (contrato 3.1).
      volumenes: configuracionVigente.volumenes.map(({ origen, destino, modo }) => ({
        origen,
        destino,
        modo,
      })),
    });
  }, [configuracionVigente, reset]);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando servicio" className="p-lg text-texto-secundario">
        Cargando servicio...
      </p>
    );
  }

  if (isError || !servicio) {
    return <p className="p-lg text-peligro">Servicio no encontrado.</p>;
  }

  async function alPulsarSiguiente() {
    const esValido = await trigger([...CAMPOS_PASO_UNO]);
    if (esValido) setPaso(2);
  }

  async function alEnviar(datos: DatosConfiguracionFormulario) {
    setErrorEnvio(null);
    try {
      await editarConfiguracion.mutateAsync({
        imagenDocker: datos.imagenDocker,
        cpuAsignado: datos.cpuAsignado,
        memoriaAsignada: datos.memoriaAsignada,
        almacenamientoAsignado: datos.almacenamientoAsignado,
        puertos: datos.puertos,
        variablesEntorno: aRegistroVariables(datos.variablesEntorno),
        volumenes: datos.volumenes,
      });
      navegar(`/servicios/${id}`, { state: { configuracionActualizada: true } });
    } catch (error) {
      setErrorEnvio(normalizarErrorApi(error).mensaje);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Editar configuracion</h1>
      <p className="text-texto-secundario">{servicio.nombre}</p>
      <h2 aria-live="polite" className="text-sm font-medium text-texto-secundario">
        {paso === 1 ? "Paso 1 de 2: Imagen y recursos" : "Paso 2 de 2: Configuracion avanzada"}
      </h2>
      <p className="text-sm text-texto-secundario">
        Los cambios se guardan como una version nueva de la configuracion y se aplican cuando
        vuelvas a desplegar el servicio, porque el contenedor se crea de nuevo. Si el servicio
        esta en ejecucion, primero tienes que detenerlo.
      </p>

      <FormProvider {...metodos}>
        <form onSubmit={handleSubmit(alEnviar)} noValidate className="flex flex-col gap-md">
          {paso === 1 ? (
            <>
              <CamposRecursos />
              <div className="flex flex-wrap gap-sm">
                <Boton
                  type="button"
                  variante="secundario"
                  onClick={() => navegar(`/servicios/${id}`)}
                >
                  Cancelar
                </Boton>
                <Boton type="button" onClick={() => void alPulsarSiguiente()}>
                  Siguiente
                </Boton>
              </div>
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
                <Boton type="submit" cargando={editarConfiguracion.isPending}>
                  Guardar configuracion
                </Boton>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </main>
  );
}
