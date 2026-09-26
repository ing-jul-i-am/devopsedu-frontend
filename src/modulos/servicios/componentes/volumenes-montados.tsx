// Lo que el contenedor tiene montado ahora mismo segun Docker (DT-17 del
// backend, contrato 3.6). Se muestra junto a la configuracion declarada a
// proposito: la diferencia entre ambas es didactica, porque una imagen con
// instruccion VOLUME crea volumenes que el estudiante nunca declaro.
// Cubre: RF-17, RNF-05 — CU-06
import type { EstadoContenedor } from "@/tipos/servicio";

interface Props {
  contenedor: EstadoContenedor | null;
}

export function VolumenesMontados({ contenedor }: Props) {
  if (!contenedor) {
    return (
      <p className="text-sm text-texto-secundario">
        No se pudo consultar el estado del contenedor.
      </p>
    );
  }

  if (!contenedor.existe) {
    return (
      <p className="text-sm text-texto-secundario">
        Este servicio todavia no tiene un contenedor creado.
      </p>
    );
  }

  if (contenedor.volumenes.length === 0) {
    return (
      <p className="text-sm text-texto-secundario">
        El contenedor no tiene volumenes montados.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-xs">
      {contenedor.volumenes.map((volumen) => (
        <li key={volumen.nombre} className="text-sm text-texto">
          {volumen.destino}{" "}
          <span className="text-texto-secundario">
            ({volumen.anonimo ? "volumen creado por la imagen" : volumen.nombre})
          </span>
        </li>
      ))}
    </ul>
  );
}
