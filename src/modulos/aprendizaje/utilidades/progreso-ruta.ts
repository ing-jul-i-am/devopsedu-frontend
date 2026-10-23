// Lectura del avance de la ruta del estudiante a partir del `estado` de cada
// modulo (contrato 6.1), compartida por la barra lateral y el panel principal.
// Cubre: RF-22 — CU-13
import type { MiRuta, ModuloMiRuta } from "@/tipos/aprendizaje";

export function contarModulosCompletados(ruta: MiRuta): number {
  return ruta.modulos.filter((modulo) => modulo.estado === "completado").length;
}

export function buscarModuloParaContinuar(
  ruta: MiRuta
): { modulo: ModuloMiRuta; posicion: number } | null {
  const ordenados = [...ruta.modulos].sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
  const indice = ordenados.findIndex((modulo) => modulo.estado !== "completado");
  const modulo = ordenados[indice];
  return modulo ? { modulo, posicion: indice + 1 } : null;
}
