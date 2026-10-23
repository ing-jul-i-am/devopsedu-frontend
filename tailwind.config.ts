import type { Config } from "tailwindcss";
import { colores, tipografia, espaciados, radios, sombras } from "./src/diseno/tokens";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fondo: colores.fondo,
        superficie: colores.superficie,
        texto: colores.texto,
        "texto-secundario": colores.textoSecundario,
        primario: {
          DEFAULT: colores.primario,
          hover: colores.primarioHover,
          contraste: colores.primarioContraste,
          suave: colores.primarioSuave,
        },
        advertencia: {
          DEFAULT: colores.advertencia,
          suave: colores.advertenciaSuave,
          borde: colores.advertenciaBorde,
          texto: colores.advertenciaTexto,
          hover: colores.advertenciaHover,
        },
        peligro: {
          DEFAULT: colores.peligro,
          hover: colores.peligroHover,
        },
        exito: {
          DEFAULT: colores.exito,
          suave: colores.exitoSuave,
          borde: colores.exitoBorde,
          texto: colores.exitoTexto,
        },
        recurso: {
          cpu: colores.recursoCpu,
          memoria: colores.recursoMemoria,
          almacenamiento: colores.recursoAlmacenamiento,
        },
        borde: colores.borde,
        enfoque: colores.enfoque,
        estado: {
          configurado: colores.estadoConfigurado,
          desplegando: colores.estadoDesplegando,
          "en-ejecucion": colores.estadoEnEjecucion,
          detenido: colores.estadoDetenido,
          reiniciando: colores.estadoReiniciando,
          fallido: colores.estadoFallido,
          eliminado: colores.estadoEliminado,
        },
      },
      fontFamily: {
        sans: [tipografia.familia],
      },
      fontSize: tipografia.tamanos,
      spacing: espaciados,
      borderRadius: radios,
      boxShadow: sombras,
    },
  },
  plugins: [],
} satisfies Config;
