// Vista de creacion de un modulo de aprendizaje.
// Cubre: RF-20, RNF-02, RNF-05 — CU-10
import { useNavigate } from "react-router-dom";
import { FormularioModulo } from "../componentes/formulario-modulo";
import { useCrearModulo } from "../hooks/use-crear-modulo";

export function CrearModuloPage() {
  const navegar = useNavigate();
  const crearModulo = useCrearModulo();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Crear modulo</h1>
      <FormularioModulo
        alEnviar={async (datos) => {
          const modulo = await crearModulo.mutateAsync(datos);
          navegar(`/administracion/modulos/${modulo.idModulo}`, { replace: true });
        }}
        cargando={crearModulo.isPending}
        textoBoton="Crear modulo"
      />
    </main>
  );
}
