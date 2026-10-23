// Estado vacio del listado de estudiantes, con la composicion del panel
// principal (DT-17). Compartido por Gestion de estudiantes y Reportes.
// Componente presentacional sin logica (CLAUDE.md 7.2).
import { Users } from "lucide-react";

export function SinEstudiantes() {
  return (
    <div className="flex flex-col items-center gap-sm px-lg py-xl text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primario-suave text-primario">
        <Users aria-hidden="true" className="h-6 w-6" />
      </span>
      <h3 className="font-semibold text-texto">No hay estudiantes registrados</h3>
      <p className="max-w-sm text-sm text-texto-secundario">
        Cuando tus estudiantes creen su cuenta desde la vista de registro, aparecerán aquí.
      </p>
    </div>
  );
}
