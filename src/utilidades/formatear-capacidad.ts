// Presentacion legible de los recursos del servidor (RF-10, RNF-02). El
// contrato expresa la CPU en nucleos y la memoria y el almacenamiento en MB
// (docs/contrato-api.md seccion 8).
const MB_POR_GB = 1024;

function sinCerosSobrantes(valor: number, decimales: number): string {
  return String(Number(valor.toFixed(decimales)));
}

function separarMegabytes(megabytes: number): { cifra: string; unidad: "MB" | "GB" } {
  if (megabytes >= MB_POR_GB) {
    return { cifra: sinCerosSobrantes(megabytes / MB_POR_GB, 1), unidad: "GB" };
  }
  return { cifra: sinCerosSobrantes(megabytes, 0), unidad: "MB" };
}

export function formatearNucleos(nucleos: number): string {
  return sinCerosSobrantes(nucleos, 2);
}

export function formatearMegabytes(megabytes: number): string {
  const { cifra, unidad } = separarMegabytes(megabytes);
  return `${cifra} ${unidad}`;
}

export function formatearUsoMegabytes(usado: number, total: number): string {
  const parteUsada = separarMegabytes(usado);
  const parteTotal = separarMegabytes(total);
  if (parteUsada.unidad === parteTotal.unidad) {
    return `${parteUsada.cifra} / ${parteTotal.cifra} ${parteTotal.unidad}`;
  }
  return `${formatearMegabytes(usado)} / ${formatearMegabytes(total)}`;
}
