// Segundo paso comun al asistente de creacion y a la edicion de configuracion:
// puertos, variables de entorno y volumenes. Ambas pantallas comparten este
// componente para que la experiencia sea identica (ver DT-13).
// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { EditorPuertos } from "./editor-puertos";
import { EditorVariablesEntorno } from "./editor-variables-entorno";
import { EditorVolumenes } from "./editor-volumenes";

export function PasoConfiguracionAvanzada() {
  return (
    <>
      <section className="flex flex-col gap-sm">
        <h3 className="text-lg font-medium text-texto">Puertos</h3>
        <EditorPuertos />
      </section>
      <section className="flex flex-col gap-sm">
        <h3 className="text-lg font-medium text-texto">Variables de entorno</h3>
        <EditorVariablesEntorno />
      </section>
      <section className="flex flex-col gap-sm">
        <h3 className="text-lg font-medium text-texto">Volumenes</h3>
        <EditorVolumenes />
      </section>
    </>
  );
}
