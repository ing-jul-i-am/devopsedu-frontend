export const colores = {
  fondo: "#f8fafc",
  superficie: "#ffffff",
  texto: "#0f172a",
  textoSecundario: "#475569",
  primario: "#2563eb",
  primarioHover: "#1d4ed8",
  primarioContraste: "#ffffff",
  advertencia: "#d97706",
  peligro: "#dc2626",
  peligroHover: "#b91c1c",
  exito: "#16a34a",
  borde: "#cbd5e1",
  enfoque: "#2563eb",
  estadoConfigurado: "#64748b",
  estadoDesplegando: "#d97706",
  estadoEnEjecucion: "#16a34a",
  estadoDetenido: "#475569",
  estadoReiniciando: "#d97706",
  estadoFallido: "#dc2626",
  estadoEliminado: "#94a3b8",
} as const;

export const tipografia = {
  familia: "'Inter', system-ui, sans-serif",
  tamanos: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
} as const;

export const espaciados = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
} as const;

export const radios = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  completo: "9999px",
} as const;

export const sombras = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
} as const;
