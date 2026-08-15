// Vista de graficas de metricas: el usuario elige uno de sus servicios y
// se muestran dos graficas de linea independientes (CPU y memoria), cada
// una con su propia escala — un solo eje compartido distorsionaria la
// lectura porque CPU (0-8 nucleos) y memoria (hasta 131072 MB) tienen
// magnitudes muy distintas.
// Cubre: RF-18, RF-19, RNF-05 — apoya CU-08
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CampoSelector } from "@/componentes-comunes/campo-selector";
import { colores } from "@/diseno/tokens";
import { useServicios } from "@/modulos/servicios/hooks/use-servicios";
import { useMetricasServicio } from "../hooks/use-metricas-servicio";

function formatearHora(valor: string) {
  return new Date(valor).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
}

function formatearFechaHora(valor: string) {
  return new Date(valor).toLocaleString("es-GT");
}

export function GraficasMetricasPage() {
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const { data: servicios } = useServicios();
  const metricas = useMetricasServicio(idSeleccionado ?? NaN);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-md p-lg">
      <h1 className="text-2xl font-semibold text-texto">Graficas de metricas</h1>

      {servicios && servicios.length > 0 ? (
        <CampoSelector
          etiqueta="Selecciona un servicio"
          placeholder="Elige un servicio"
          opciones={servicios.map((servicio) => ({
            valor: String(servicio.idServicio),
            etiqueta: servicio.nombre,
          }))}
          value={idSeleccionado !== null ? String(idSeleccionado) : ""}
          onChange={(evento) =>
            setIdSeleccionado(evento.target.value ? Number(evento.target.value) : null)
          }
        />
      ) : (
        <p className="text-texto-secundario">Aun no tienes servicios para consultar.</p>
      )}

      {idSeleccionado !== null && metricas.isLoading ? (
        <p role="status" aria-label="Cargando metricas" className="text-texto-secundario">
          Cargando metricas...
        </p>
      ) : null}

      {idSeleccionado !== null && metricas.isError ? (
        <p role="alert" className="text-peligro">
          No fue posible cargar las metricas de este servicio.
        </p>
      ) : null}

      {metricas.data && metricas.data.length === 0 ? (
        <p className="text-texto-secundario">
          Aun no hay metricas registradas para este servicio.
        </p>
      ) : null}

      {metricas.data && metricas.data.length > 0 ? (
        <div className="grid gap-md sm:grid-cols-2">
          <div>
            <h2 className="mb-xs text-sm font-medium text-texto">CPU (nucleos)</h2>
            {/* Recharts exige una altura explicita en el contenedor para ResponsiveContainer */}
            <div role="img" aria-label="Consumo de CPU en el tiempo" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricas.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colores.borde} />
                  <XAxis
                    dataKey="marcaTiempo"
                    tickFormatter={formatearHora}
                    stroke={colores.textoSecundario}
                  />
                  <YAxis stroke={colores.textoSecundario} />
                  <Tooltip labelFormatter={(valor) => formatearFechaHora(String(valor))} />
                  <Line
                    type="monotone"
                    dataKey="consumoCpu"
                    stroke={colores.primario}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h2 className="mb-xs text-sm font-medium text-texto">Memoria (MB)</h2>
            <div role="img" aria-label="Consumo de memoria en el tiempo" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricas.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colores.borde} />
                  <XAxis
                    dataKey="marcaTiempo"
                    tickFormatter={formatearHora}
                    stroke={colores.textoSecundario}
                  />
                  <YAxis stroke={colores.textoSecundario} />
                  <Tooltip labelFormatter={(valor) => formatearFechaHora(String(valor))} />
                  <Line
                    type="monotone"
                    dataKey="consumoMemoria"
                    stroke={colores.exito}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
