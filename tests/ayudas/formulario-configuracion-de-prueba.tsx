// Envoltorio para probar los editores de puertos, variables de entorno y
// volumenes de forma aislada: los tres leen el formulario desde el contexto de
// React Hook Form, asi que necesitan un FormProvider con el mismo esquema que
// usan el asistente de creacion y la edicion de configuracion.
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  camposConfiguracion,
  validarCrucesConfiguracion,
  type DatosConfiguracionFormulario,
} from "@/modulos/servicios/esquema-configuracion";

const esquema = z.object(camposConfiguracion).superRefine(validarCrucesConfiguracion);

const VALORES_BASE: DatosConfiguracionFormulario = {
  imagenDocker: "postgres:16-alpine",
  cpuAsignado: 1,
  memoriaAsignada: 512,
  almacenamientoAsignado: 1024,
  puertos: [],
  variablesEntorno: [],
  volumenes: [],
};

interface Props {
  children: ReactNode;
  valoresIniciales?: Partial<DatosConfiguracionFormulario>;
}

export function FormularioConfiguracionDePrueba({ children, valoresIniciales }: Props) {
  const metodos = useForm<DatosConfiguracionFormulario>({
    resolver: zodResolver(esquema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { ...VALORES_BASE, ...valoresIniciales },
  });

  return (
    <FormProvider {...metodos}>
      <form onSubmit={metodos.handleSubmit(() => undefined)} noValidate>
        {children}
        <button type="submit">Guardar</button>
      </form>
    </FormProvider>
  );
}
