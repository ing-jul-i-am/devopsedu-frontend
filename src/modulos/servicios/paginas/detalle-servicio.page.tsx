// Vista de detalle de un servicio: estado, acciones de ciclo de vida,
// configuracion declarada, volumenes realmente montados e historico.
//
// Desde DT-15 del backend, desplegar recrea el contenedor y destruye sus
// volumenes, asi que deja de ser una accion inocua: cuando ya existe un
// contenedor se confirma igual que una eliminacion (RNF-04). La advertencia se
// construye con `contenedor` (DT-17), no con la configuracion declarada.
// Cubre: RF-11, RF-12, RF-13, RF-14, RF-17, RNF-04, RNF-05 — CU-05, CU-06, CU-07
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { InsigniaEstado } from "@/componentes-comunes/insignia-estado";
import { Boton } from "@/componentes-comunes/boton";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";
import { ESTADOS_ORIGEN_VALIDOS, type ResultadoOperacion } from "@/tipos/servicio";
import { ListaRegistros } from "../componentes/lista-registros";
import { ResumenConfiguracion } from "../componentes/resumen-configuracion";
import { AvisoPerdidaDatos } from "../componentes/aviso-perdida-datos";
import { VolumenesMontados } from "../componentes/volumenes-montados";
import { useServicio } from "../hooks/use-servicio";
import {
  useDesplegarServicio,
  useDetenerServicio,
  useReiniciarServicio,
  useEliminarServicio,
} from "../hooks/use-acciones-servicio";

interface EstadoNavegacion {
  configuracionActualizada?: boolean;
}

function textoResultado(resultado: ResultadoOperacion): string[] {
  const lineas: string[] = [];
  if (resultado.recreado) {
    lineas.push("Se recreo el contenedor con la configuracion vigente.");
  }
  if (resultado.volumenesEliminados.length > 0) {
    lineas.push(
      `Se eliminaron los volumenes: ${resultado.volumenesEliminados.join(", ")}. Sus datos se perdieron.`
    );
  }
  if (resultado.volumenesOmitidos.length > 0) {
    lineas.push(
      `Estos volumenes se conservaron porque otro contenedor los usa: ${resultado.volumenesOmitidos.join(", ")}.`
    );
  }
  return lineas;
}

export function DetalleServicioPage() {
  const { idServicio } = useParams<{ idServicio: string }>();
  const id = Number(idServicio);
  const { data: servicio, isLoading, isError } = useServicio(id);
  const location = useLocation();
  const navegar = useNavigate();
  const [resultado, setResultado] = useState<ResultadoOperacion | null>(null);

  // El aviso de "configuracion guardada" se consume una sola vez. Se copia a
  // estado local y se limpia del historial para que ni un refresh ni un "atras"
  // lo revivan despues de haber desplegado, que es justo cuando deja de aplicar.
  const [avisoConfiguracion, setAvisoConfiguracion] = useState(
    () => (location.state as EstadoNavegacion | null)?.configuracionActualizada === true
  );

  useEffect(() => {
    if (!avisoConfiguracion) return;
    navegar(location.pathname, { replace: true, state: null });
  }, [avisoConfiguracion, location.pathname, navegar]);

  const desplegar = useDesplegarServicio(id);
  const detener = useDetenerServicio(id);
  const reiniciar = useReiniciarServicio(id);
  const eliminar = useEliminarServicio(id);

  if (isLoading) {
    return (
      <p role="status" aria-label="Cargando servicio" className="p-lg text-texto-secundario">
        Cargando servicio...
      </p>
    );
  }

  if (isError || !servicio) {
    return <p className="p-lg text-peligro">Servicio no encontrado.</p>;
  }

  const estado = servicio.estado;
  const contenedor = servicio.contenedor;
  // Solo se puede afirmar que no hay nada que perder cuando el backend lo
  // confirma. Con `null` no se sabe, asi que se confirma igual.
  const requiereConfirmarDespliegue = contenedor?.existe !== false;
  const puedeDesplegar = ESTADOS_ORIGEN_VALIDOS.desplegar.includes(estado);

  // Desplegar es justo lo que el aviso pedia hacer: una vez hecho, sobra. Se
  // conserva durante "detener" a proposito, porque ese es solo el paso previo y
  // el texto se adapta al estado nuevo.
  function alDesplegar() {
    setResultado(null);
    setAvisoConfiguracion(false);
    desplegar.mutate(undefined, { onSuccess: setResultado });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-md p-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="text-2xl font-semibold text-texto">{servicio.nombre}</h1>
        <InsigniaEstado estado={estado} />
      </div>

      {servicio.descripcion ? (
        <p className="text-texto-secundario">{servicio.descripcion}</p>
      ) : null}

      {avisoConfiguracion ? (
        <p role="status" className="rounded-md bg-superficie p-sm text-sm text-texto">
          La configuracion se guardo.{" "}
          {estado === "en_ejecucion"
            ? "Para aplicarla, deten el servicio y vuelve a desplegarlo."
            : "Para aplicarla, vuelve a desplegar el servicio."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-sm">
        {requiereConfirmarDespliegue ? (
          <BotonAccionCritica
            textoBoton="Desplegar"
            variante="primario"
            tituloDialogo="Volver a desplegar este servicio"
            descripcionDialogo={
              <AvisoPerdidaDatos contenedor={contenedor} operacion="desplegar" />
            }
            textoConfirmacion="Desplegar"
            disabled={!puedeDesplegar}
            cargando={desplegar.isPending}
            onConfirmar={alDesplegar}
          />
        ) : (
          <Boton
            disabled={!puedeDesplegar}
            cargando={desplegar.isPending}
            onClick={alDesplegar}
          >
            Desplegar
          </Boton>
        )}
        <Boton
          variante="secundario"
          disabled={!ESTADOS_ORIGEN_VALIDOS.detener.includes(estado)}
          cargando={detener.isPending}
          onClick={() => detener.mutate()}
        >
          Detener
        </Boton>
        <Boton
          variante="secundario"
          disabled={!ESTADOS_ORIGEN_VALIDOS.reiniciar.includes(estado)}
          cargando={reiniciar.isPending}
          onClick={() => reiniciar.mutate()}
        >
          Reiniciar
        </Boton>
        <BotonAccionCritica
          textoBoton="Eliminar servicio"
          tituloDialogo="Eliminar este servicio"
          descripcionDialogo={
            <AvisoPerdidaDatos contenedor={contenedor} operacion="eliminar" />
          }
          textoConfirmacion="Eliminar"
          disabled={!ESTADOS_ORIGEN_VALIDOS.eliminar.includes(estado)}
          cargando={eliminar.isPending}
          onConfirmar={() => {
            setResultado(null);
            setAvisoConfiguracion(false);
            eliminar.mutate(undefined, { onSuccess: setResultado });
          }}
        />
      </div>

      {resultado ? (
        <div
          role="status"
          className="flex flex-col gap-xs rounded-md bg-superficie p-sm text-sm"
        >
          {textoResultado(resultado).map((linea) => (
            <p key={linea} className="text-texto">
              {linea}
            </p>
          ))}
        </div>
      ) : null}

      <section className="flex flex-col gap-sm">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <h2 className="text-lg font-medium text-texto">Configuracion</h2>
          <Link
            to={`/servicios/${servicio.idServicio}/configuracion`}
            className="text-sm font-medium text-primario underline"
          >
            Editar configuracion
          </Link>
        </div>
        <ResumenConfiguracion configuracion={servicio.configuracion} />
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-medium text-texto">Volumenes montados</h2>
        <VolumenesMontados contenedor={contenedor} />
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-medium text-texto">Historico de operaciones</h2>
        <ListaRegistros registros={servicio.registros} />
      </section>
    </main>
  );
}
