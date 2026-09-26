// Resumen de solo lectura de la configuracion vigente de un servicio: imagen,
// recursos, puertos publicados, variables de entorno y volumenes montados.
// Cubre: RF-17, RNF-05 — CU-06
import type { ConfiguracionServicioVigente, TipoVolumen } from "@/tipos/servicio";

interface Props {
  configuracion: ConfiguracionServicioVigente | null;
}

const ETIQUETAS_MODO: Record<"ro" | "rw", string> = {
  ro: "solo lectura",
  rw: "lectura y escritura",
};

// `tipo` orienta al estudiante sobre que sobrevive a un redespliegue. Para
// advertir que se perdera al desplegar o eliminar no sirve: eso se construye con
// los montajes reales del contenedor (contrato 3.9.1).
const ETIQUETAS_TIPO: Record<TipoVolumen, string> = {
  bind: "carpeta del host, se conserva",
  volumen: "volumen de Docker, se borra al recrear",
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <dt className="text-xs text-texto-secundario">{etiqueta}</dt>
      <dd className="text-sm text-texto">{valor}</dd>
    </div>
  );
}

function ListaOVacio({
  etiqueta,
  textoVacio,
  elementos,
}: {
  etiqueta: string;
  textoVacio: string;
  elementos: string[];
}) {
  return (
    <div className="flex flex-col gap-xs">
      <h3 className="text-sm font-medium text-texto">{etiqueta}</h3>
      {elementos.length === 0 ? (
        <p className="text-sm text-texto-secundario">{textoVacio}</p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {elementos.map((elemento) => (
            <li key={elemento} className="text-sm text-texto">
              {elemento}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResumenConfiguracion({ configuracion }: Props) {
  if (!configuracion) {
    return (
      <p className="text-sm text-texto-secundario">
        Este servicio no tiene configuracion registrada.
      </p>
    );
  }

  const puertos = configuracion.puertos.map(
    (puerto) => `${puerto.host} -> ${puerto.contenedor}/${puerto.protocolo}`
  );
  const variables = Object.entries(configuracion.variablesEntorno).map(
    ([clave, valor]) => `${clave} = ${valor}`
  );
  const volumenes = configuracion.volumenes.map(
    (volumen) =>
      `${volumen.origen} -> ${volumen.destino} (${ETIQUETAS_MODO[volumen.modo]}, ${ETIQUETAS_TIPO[volumen.tipo]})`
  );

  return (
    <div className="flex flex-col gap-md rounded-md border border-borde p-sm">
      <dl className="flex flex-wrap gap-lg">
        <Dato etiqueta="Imagen Docker" valor={configuracion.imagenDocker} />
        <Dato etiqueta="CPU (nucleos)" valor={String(configuracion.cpuAsignado)} />
        <Dato etiqueta="Memoria" valor={`${configuracion.memoriaAsignada} MB`} />
        <Dato etiqueta="Almacenamiento" valor={`${configuracion.almacenamientoAsignado} MB`} />
      </dl>

      <ListaOVacio
        etiqueta="Puertos"
        textoVacio="Sin puertos publicados."
        elementos={puertos}
      />
      <ListaOVacio
        etiqueta="Variables de entorno"
        textoVacio="Sin variables de entorno."
        elementos={variables}
      />
      <ListaOVacio
        etiqueta="Volumenes"
        textoVacio="Sin volumenes montados."
        elementos={volumenes}
      />
    </div>
  );
}
