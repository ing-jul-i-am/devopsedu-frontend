// Editor de los volumenes montados por un servicio: ruta del host, ruta dentro
// del contenedor y modo de acceso.
// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { useFieldArray, useFormContext } from "react-hook-form";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { Boton } from "@/componentes-comunes/boton";
import type { DatosConfiguracionFormulario } from "../esquema-configuracion";

const MODOS = [
  { valor: "rw", etiqueta: "Lectura y escritura" },
  { valor: "ro", etiqueta: "Solo lectura" },
];

export function EditorVolumenes() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DatosConfiguracionFormulario>();
  const { fields, append, remove } = useFieldArray({ control, name: "volumenes" });

  return (
    <div className="flex flex-col gap-sm">
      {fields.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Este servicio no monta ningun volumen. Agrega uno si necesitas conservar los datos
          cuando el contenedor se reinicie.
        </p>
      ) : null}

      {fields.map((campo, indice) => {
        const erroresVolumen = errors.volumenes?.[indice];
        return (
          <fieldset
            key={campo.id}
            className="flex flex-col gap-sm rounded-md border border-borde p-sm"
          >
            <legend className="text-sm font-medium text-texto">Volumen {indice + 1}</legend>
            <div className="flex justify-end">
              <Boton type="button" variante="peligro" onClick={() => remove(indice)}>
                Quitar volumen {indice + 1}
              </Boton>
            </div>
            <CampoTexto
              etiqueta="Origen - ruta en el host"
              textoAyuda="Carpeta del servidor donde se guardan los datos, por ejemplo /datos/pg"
              error={erroresVolumen?.origen?.message}
              {...register(`volumenes.${indice}.origen`)}
            />
            <CampoTexto
              etiqueta="Destino - ruta en el contenedor"
              textoAyuda="Ruta absoluta dentro del contenedor, por ejemplo /var/lib/postgresql/data"
              error={erroresVolumen?.destino?.message}
              {...register(`volumenes.${indice}.destino`)}
            />
            <CampoSelector
              etiqueta="Modo - modo de acceso"
              opciones={MODOS}
              error={erroresVolumen?.modo?.message}
              {...register(`volumenes.${indice}.modo`)}
            />
          </fieldset>
        );
      })}

      <div>
        <Boton
          type="button"
          variante="secundario"
          onClick={() => append({ origen: "", destino: "", modo: "rw" })}
        >
          Agregar volumen
        </Boton>
      </div>
    </div>
  );
}
