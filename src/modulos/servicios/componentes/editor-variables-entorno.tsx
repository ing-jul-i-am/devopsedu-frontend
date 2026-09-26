// Editor de las variables de entorno de un servicio. En el formulario se
// manejan como una lista ordenada de pares clave-valor para poder agregarlas,
// quitarlas y reportar errores por fila; la conversion al Record<string,string>
// que exige el contrato ocurre al enviar (ver utilidades/variables-entorno).
// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { useFieldArray, useFormContext } from "react-hook-form";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import { Boton } from "@/componentes-comunes/boton";
import type { DatosConfiguracionFormulario } from "../esquema-configuracion";

export function EditorVariablesEntorno() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DatosConfiguracionFormulario>();
  const { fields, append, remove } = useFieldArray({ control, name: "variablesEntorno" });

  return (
    <div className="flex flex-col gap-sm">
      {fields.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Este servicio no define ninguna variable de entorno. Agrega las que necesite la
          imagen, por ejemplo la contrasena inicial de una base de datos.
        </p>
      ) : null}

      {fields.map((campo, indice) => {
        const erroresVariable = errors.variablesEntorno?.[indice];
        return (
          <fieldset
            key={campo.id}
            className="flex flex-col gap-sm rounded-md border border-borde p-sm"
          >
            <legend className="text-sm font-medium text-texto">Variable {indice + 1}</legend>
            <div className="flex justify-end">
              <Boton type="button" variante="peligro" onClick={() => remove(indice)}>
                Quitar variable {indice + 1}
              </Boton>
            </div>
            <CampoTexto
              etiqueta="Clave"
              textoAyuda="Por ejemplo POSTGRES_PASSWORD. Solo letras, numeros y guion bajo."
              error={erroresVariable?.clave?.message}
              {...register(`variablesEntorno.${indice}.clave`)}
            />
            <CampoTexto
              etiqueta="Valor"
              error={erroresVariable?.valor?.message}
              {...register(`variablesEntorno.${indice}.valor`)}
            />
          </fieldset>
        );
      })}

      <div>
        <Boton
          type="button"
          variante="secundario"
          onClick={() => append({ clave: "", valor: "" })}
        >
          Agregar variable
        </Boton>
      </div>
    </div>
  );
}
