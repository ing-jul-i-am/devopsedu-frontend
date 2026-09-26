// Cuerpo del dialogo de confirmacion de desplegar y eliminar: enumera lo que el
// estudiante va a perder.
//
// Se construye con los montajes REALES del contenedor (contrato 3.9.1, DT-17 del
// backend) y nunca con `configuracion.volumenes`, que describe lo que se pidio y
// no lo que esta montado. El caso decisivo es el volumen anonimo: al desplegar
// postgres, mysql, mongo o redis sin declarar volumenes, Docker crea uno por la
// instruccion VOLUME de la imagen con la base de datos entera dentro. La
// configuracion lista cero volumenes, asi que un aviso basado en ella afirmaria
// que no se pierde nada justo antes de borrarla.
// Cubre: RF-11, RF-14, RNF-04 — CU-05, CU-07
import type { EstadoContenedor } from "@/tipos/servicio";

interface Props {
  contenedor: EstadoContenedor | null;
  operacion: "desplegar" | "eliminar";
}

export function AvisoPerdidaDatos({ contenedor, operacion }: Props) {
  const queOcurre =
    operacion === "desplegar"
      ? "Se eliminara el contenedor actual y se creara uno nuevo con la configuracion vigente."
      : "Se eliminara el contenedor y se liberaran los recursos asociados. Esta accion no se puede deshacer.";

  // No haber podido preguntar a Docker no es lo mismo que saber que no hay nada
  // montado: ante la duda se advierte, nunca se tranquiliza.
  if (!contenedor) {
    return (
      <>
        <p>{queOcurre}</p>
        <p className="text-peligro">
          No se pudo consultar el estado del contenedor. Si tiene volumenes, sus datos se
          perderan.
        </p>
      </>
    );
  }

  if (!contenedor.existe) {
    return (
      <>
        <p>{queOcurre}</p>
        <p>Este servicio no tiene un contenedor creado, asi que no hay datos que perder.</p>
      </>
    );
  }

  if (contenedor.volumenes.length === 0) {
    return (
      <>
        <p>{queOcurre}</p>
        <p>El contenedor no tiene volumenes montados.</p>
      </>
    );
  }

  return (
    <>
      <p>{queOcurre}</p>
      <p className="text-peligro">Se perdera el contenido de estos volumenes:</p>
      <ul className="flex flex-col gap-xs">
        {contenedor.volumenes.map((volumen) => (
          <li key={volumen.nombre} className="text-texto">
            {volumen.destino}{" "}
            <span className="text-texto-secundario">
              ({volumen.anonimo ? "volumen creado por la imagen" : volumen.nombre})
            </span>
          </li>
        ))}
      </ul>
      <p>Las carpetas del host montadas en el contenedor se conservan.</p>
    </>
  );
}
