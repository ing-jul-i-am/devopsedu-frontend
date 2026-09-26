// Conversion entre la forma que usa el formulario (lista ordenada de pares
// clave-valor, editable y con errores por indice) y la que exige el contrato
// de API en configuracion.variablesEntorno (Record<string, string>).
// Cubre: RF-05, RF-06, RF-08 — CU-03
export interface ParVariableEntorno {
  clave: string;
  valor: string;
}

export function aRegistroVariables(pares: ParVariableEntorno[]): Record<string, string> {
  const registro: Record<string, string> = {};
  for (const par of pares) {
    const clave = par.clave.trim();
    if (clave === "") continue;
    registro[clave] = par.valor;
  }
  return registro;
}

export function aParesVariables(registro: Record<string, string>): ParVariableEntorno[] {
  return Object.entries(registro).map(([clave, valor]) => ({ clave, valor }));
}
