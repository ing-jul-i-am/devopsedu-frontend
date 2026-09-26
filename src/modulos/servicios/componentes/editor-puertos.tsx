// Editor de la lista de puertos publicados por un servicio. Lee el formulario
// desde el contexto de React Hook Form para poder reutilizarse tanto en el
// asistente de creacion como en la edicion de configuracion.
// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { useFieldArray, useFormContext } from "react-hook-form";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { Boton } from "@/componentes-comunes/boton";
import type { DatosConfiguracionFormulario } from "../esquema-configuracion";

const PROTOCOLOS = [
  { valor: "tcp", etiqueta: "TCP" },
  { valor: "udp", etiqueta: "UDP" },
];

export function EditorPuertos() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DatosConfiguracionFormulario>();
  const { fields, append, remove } = useFieldArray({ control, name: "puertos" });

  return (
    <div className="flex flex-col gap-sm">
      {fields.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Este servicio no publica ningun puerto. Agrega uno si necesitas acceder al contenedor
          desde el servidor.
        </p>
      ) : null}

      {fields.map((campo, indice) => {
        const erroresPuerto = errors.puertos?.[indice];
        return (
          <fieldset
            key={campo.id}
            className="flex flex-col gap-sm rounded-md border border-borde p-sm"
          >
            <legend className="text-sm font-medium text-texto">Puerto {indice + 1}</legend>
            <div className="flex justify-end">
              <Boton type="button" variante="peligro" onClick={() => remove(indice)}>
                Quitar puerto {indice + 1}
              </Boton>
            </div>
            <CampoTexto
              etiqueta="Puerto del host"
              type="number"
              textoAyuda="Puerto por el que se accede desde el servidor, por ejemplo 5432"
              error={erroresPuerto?.host?.message}
              {...register(`puertos.${indice}.host`, { valueAsNumber: true })}
            />
            <CampoTexto
              etiqueta="Puerto del contenedor"
              type="number"
              textoAyuda="Puerto que expone la imagen dentro del contenedor"
              error={erroresPuerto?.contenedor?.message}
              {...register(`puertos.${indice}.contenedor`, { valueAsNumber: true })}
            />
            <CampoSelector
              etiqueta="Protocolo"
              opciones={PROTOCOLOS}
              error={erroresPuerto?.protocolo?.message}
              {...register(`puertos.${indice}.protocolo`)}
            />
          </fieldset>
        );
      })}

      <div>
        <Boton
          type="button"
          variante="secundario"
          onClick={() =>
            append({ host: Number.NaN, contenedor: Number.NaN, protocolo: "tcp" })
          }
        >
          Agregar puerto
        </Boton>
      </div>
    </div>
  );
}
