// Vista de edicion de un modulo de aprendizaje, con las secciones para crear
// su actividad practica y su evaluacion.
// Cubre: RF-20, RF-23, RF-24, RNF-05 — CU-10, CU-12, CU-14
import { useState } from "react";
import { useParams } from "react-router-dom";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { FormularioModulo } from "../componentes/formulario-modulo";
import { FormularioActividad } from "../componentes/formulario-actividad";
import { FormularioEvaluacion } from "../componentes/formulario-evaluacion";
import { useModulo } from "../hooks/use-modulo";
import { useEditarModulo } from "../hooks/use-editar-modulo";

export function EditarModuloPage() {
  const { idModulo } = useParams<{ idModulo: string }>();
  const id = Number(idModulo);
  const { data: modulo, isLoading, isError, error } = useModulo(id);
  const editarModulo = useEditarModulo(id);
  const [guardado, setGuardado] = useState(false);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando modulo" className="p-lg text-texto-secundario">
        Cargando modulo...
      </p>
    );
  }

  if (isError || !modulo) {
    return <p className="p-lg text-peligro">{normalizarErrorApi(error).mensaje}</p>;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-lg p-lg">
      <section className="flex flex-col gap-md">
        <h1 className="text-2xl font-semibold text-texto">Editar modulo</h1>
        <FormularioModulo
          valoresIniciales={{
            nombre: modulo.nombre,
            orden: modulo.orden,
            contenido: modulo.contenido,
          }}
          alEnviar={async (datos) => {
            setGuardado(false);
            await editarModulo.mutateAsync(datos);
            setGuardado(true);
          }}
          cargando={editarModulo.isPending}
          textoBoton="Guardar cambios"
        />
        {guardado ? (
          <p role="status" className="text-sm text-exito">
            Cambios guardados correctamente.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-medium text-texto">Actividad del modulo</h2>
        <FormularioActividad idModulo={id} />
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-medium text-texto">Evaluacion del modulo</h2>
        <FormularioEvaluacion idModulo={id} />
      </section>
    </main>
  );
}
