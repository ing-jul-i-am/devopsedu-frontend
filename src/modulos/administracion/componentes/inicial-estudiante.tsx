// Circulo con la inicial del estudiante, igual al de la barra superior
// (DT-17). Decorativo: el nombre siempre aparece como texto junto a el.
// Componente presentacional sin logica (CLAUDE.md 7.2).
export function InicialEstudiante({ nombre }: { nombre: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-completo bg-primario-suave text-sm font-semibold text-primario"
    >
      {nombre.charAt(0).toUpperCase()}
    </span>
  );
}
