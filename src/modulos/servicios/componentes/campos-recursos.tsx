// Primer paso comun al asistente de creacion y a la edicion de configuracion:
// imagen Docker (con el catalogo sugerido de RF-07) y los tres limites de
// recursos. Lee el formulario desde el contexto de React Hook Form.
// Cubre: RF-05, RF-06, RF-07, RF-08, RNF-02, RNF-05 — CU-03
import { useFormContext } from "react-hook-form";
import { CampoTexto } from "@/componentes-comunes/campo-texto";
import type { DatosConfiguracionFormulario } from "../esquema-configuracion";
import { useImagenesDocker } from "../hooks/use-imagenes-docker";

export function CamposRecursos() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DatosConfiguracionFormulario>();
  const { data: imagenes } = useImagenesDocker();

  return (
    <>
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
    </>
  );
}
