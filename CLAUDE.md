# CLAUDE.md — Frontend de DevOpsEdu

Este archivo orienta a Claude Code en el desarrollo del frontend de la plataforma educativa para gestión DevOps (DevOpsEdu). Las decisiones aquí registradas se derivan del documento de diseño técnico del proyecto y deben respetarse durante toda la implementación.

**El proyecto sigue una metodología de desarrollo guiada por pruebas (TDD). Antes de leer el resto de este documento, revisa el skill `ciclo-tdd` en `.claude/skills/`. Toda funcionalidad nueva comienza por una prueba que falla.**

---

## 1. Identidad del proyecto

- **Nombre:** Plataforma Educativa para Gestión DevOps (DevOpsEdu)
- **Autor:** Julian Andrés Barrera García — Universidad Mariano Gálvez de Guatemala
- **Repositorio asociado:** Frontend (`devopsedu-frontend`). El backend vive en `devopsedu-backend`.
- **Propósito de la capa de presentación:** ofrecer una interfaz gráfica educativa que sustituya la complejidad de la línea de comandos por formularios guiados, validaciones inmediatas y visualizaciones del estado y consumo de servicios.

El diseño formal se encuentra en `Diseño_tecnico_de_proyecto.pdf`. Cuando una decisión visual o de interacción no esté cubierta por este CLAUDE.md, consulta primero esa fuente.

---

## 2. Stack tecnológico

| Aspecto | Tecnología | Versión objetivo |
| --- | --- | --- |
| Lenguaje | TypeScript | 5.x estricto |
| Biblioteca de UI | React | 18.x |
| Bundler | Vite | última estable |
| Enrutamiento | React Router | 6.x |
| Estilización | Tailwind CSS | 3.x |
| Componentes accesibles base | Radix UI o Headless UI | a elegir, mantener consistencia |
| Gráficas | Recharts | 2.x |
| Validación de formularios | Zod + React Hook Form | últimas estables |
| Cliente HTTP | Axios | 1.x |
| Estado de servidor | TanStack Query | 5.x |
| Iconografía | Lucide React | última estable |
| **Framework de pruebas** | **Vitest** | **última estable** |
| **Pruebas de componentes** | **React Testing Library** | **15.x o superior** |
| **Entorno DOM** | **happy-dom** | **última estable** |
| **Mock de HTTP** | **MSW (Mock Service Worker)** | **2.x** |
| **Aserciones jest-dom** | **@testing-library/jest-dom** | **última estable** |
| **Eventos de usuario** | **@testing-library/user-event** | **14.x** |

No agregues nuevas dependencias sin justificar el aporte respecto al alcance del prototipo (RNF-20).

---

## 3. Arquitectura de la capa de presentación

El frontend cubre la capa de presentación descrita en la sección 4.2.3.1. Su única vía de comunicación con el sistema es la interfaz `IRestAPI` provista por el backend.

```
┌─────────────────────────────────────────────┐
│  Vistas (páginas por ruta)                  │
├─────────────────────────────────────────────┤
│  Componentes de dominio (formularios, paneles, gráficas)
├─────────────────────────────────────────────┤
│  Hooks y servicios de aplicación
├─────────────────────────────────────────────┤
│  Cliente HTTP (Axios + interceptores)
└─────────────────────────────────────────────┘
```

**Regla obligatoria:** la capa de presentación no contiene lógica de negocio propia. El frontend valida formato y obligatoriedad de campos, presenta el estado del sistema y traduce interacciones en peticiones HTTP.

### 3.1 Módulos de interfaz (sección 4.2.15)

1. **Sesión** — iniciar sesión, registro, perfil, cierre de sesión.
2. **Servicios** — panel de activos, creación guiada, detalle, capacidad del servidor.
3. **Monitoreo** — histórico de operaciones, gráficas de métricas.
4. **Aprendizaje** — ruta del estudiante, actividad, evaluación.
5. **Administración** — gestión de módulos, asignación de rutas, reportes, exportación.

---

## 4. Estructura de carpetas

```
devopsedu-frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── modulos/
│   │   ├── sesion/
│   │   │   ├── paginas/
│   │   │   ├── componentes/
│   │   │   └── hooks/
│   │   ├── servicios/
│   │   ├── monitoreo/
│   │   ├── aprendizaje/
│   │   └── administracion/
│   ├── componentes-comunes/
│   ├── diseno/
│   │   ├── tokens.ts
│   │   └── tailwind-base.css
│   ├── enrutamiento/
│   ├── infraestructura/
│   │   ├── cliente-http.ts
│   │   ├── almacenamiento-sesion.ts
│   │   ├── proveedor-query.tsx
│   │   └── configuracion.ts
│   ├── tipos/
│   └── utilidades/
├── tests/
│   ├── unitarias/                 # componentes y hooks aislados
│   │   ├── componentes-comunes/
│   │   ├── modulos/
│   │   └── hooks/
│   ├── integracion/               # flujos que cruzan varios componentes
│   │   └── modulos/
│   ├── fixtures/                  # constructores de datos de prueba
│   ├── mocks/
│   │   ├── handlers.ts            # handlers de MSW por endpoint del backend
│   │   ├── servidor.ts            # instancia de servidor MSW para tests
│   │   └── respuestas/            # respuestas JSON realistas
│   ├── ayudas/
│   │   ├── renderizar-con-proveedores.tsx
│   │   └── crear-usuario-autenticado.ts
│   └── configuracion/
│       └── setup.ts
├── .claude/
│   └── skills/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

Crea las carpetas a medida que cada módulo lo requiera, no todas de golpe.

---

## 5. Configuración de Vitest

El archivo `vitest.config.ts` se configura desde la Etapa 0:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: false,
    setupFiles: ["./tests/configuracion/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/diseno/tokens.ts",
        "src/infraestructura/configuracion.ts",
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },
    testTimeout: 5_000,
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src/"),
    },
  },
});
```

Los umbrales del frontend son ligeramente más bajos que los del backend porque parte del código del frontend (animaciones, transiciones, casos de borde visuales) es difícil de cubrir con pruebas sin caer en sobreingeniería.

### 5.1 Archivo setup.ts

```typescript
// tests/configuracion/setup.ts
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { servidorMock } from "../mocks/servidor";

beforeAll(() => servidorMock.listen({ onUnhandledRequest: "error" }));
afterEach(() => servidorMock.resetHandlers());
afterAll(() => servidorMock.close());
```

Esto inicia MSW antes de la suite, limpia los handlers tras cada test, y lo apaga al finalizar. La opción `onUnhandledRequest: "error"` hace que cualquier petición HTTP no mockeada cause un fallo, lo cual es deliberado: te obliga a documentar explícitamente cada interacción con el backend.

---

## 6. Convenciones obligatorias

### 6.1 Idioma

- Texto visible al usuario: español neutro, sin guatemaltequismos.
- Mensajes de error: claros y orientativos (RNF-02).
- Identificadores en código: español, salvo nombres convencionales de React.
- Convención de archivos: `kebab-case` para archivos (`tarjeta-servicio.tsx`, `tarjeta-servicio.test.tsx`).
- Convención de componentes: `PascalCase` en el código (`TarjetaServicio`).

### 6.2 Convención de archivos de pruebas

- **Tests unitarios de componentes y hooks**: en `tests/unitarias/` espejando la estructura de `src/`. Ejemplo: `src/modulos/servicios/componentes/tarjeta-servicio.tsx` se prueba en `tests/unitarias/modulos/servicios/componentes/tarjeta-servicio.test.tsx`.
- **Tests de integración**: en `tests/integracion/modulos/<modulo>/<flujo>.test.tsx`. Cubren flujos que cruzan varios componentes (ej. completar el formulario de creación de servicio y enviarlo).
- **Tests de hooks**: usan `renderHook` de React Testing Library.

### 6.3 TypeScript estricto

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "jsx": "react-jsx",
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true
  }
}
```

### 6.4 Sistema de diseño y consistencia visual (RNF-03)

- Paleta, tipografía, radios, sombras y espaciados en `src/diseno/tokens.ts` y expuestos a Tailwind.
- No usar valores hexadecimales sueltos ni clases Tailwind con valores arbitrarios.
- Componentes comunes (botones, entradas, modales, diálogos) en `src/componentes-comunes/`.

### 6.5 Accesibilidad (RNF-05, WCAG AA)

- `label` asociada a todo control de formulario.
- Contraste verificable, nivel AA.
- Navegación por teclado funcional.
- Estados dinámicos comunicados con `aria-live` cuando corresponda.

**Las pruebas verifican accesibilidad**: usar `getByRole`, `getByLabelText` y `getByText` en lugar de `getByTestId` siempre que sea posible. Si una prueba no puede encontrar un elemento por su rol o label, probablemente el elemento no es accesible.

### 6.6 Validación de formularios (RNF-02, RF-06)

- Zod + React Hook Form.
- Texto de ayuda contextual, ejemplos válidos, mensajes de error descriptivos.
- Validación en tiempo real: error tras la primera pérdida de foco o tras el primer envío fallido.

### 6.7 Acciones críticas con confirmación (RNF-04)

Acciones irreversibles requieren diálogo de confirmación con:

- Texto del impacto en lenguaje claro.
- Confirmación destructiva en color de advertencia.
- Botón de cancelar prominente como opción por defecto.

### 6.8 Comunicación con el backend

- Toda llamada HTTP pasa por `src/infraestructura/cliente-http.ts`.
- Los interceptores anexan el token JWT, manejan respuestas 401 y registran errores.
- En tests, las llamadas se interceptan con MSW.

---

## 7. Política de TDD

### 7.1 Cuándo aplica TDD obligatoriamente

- Todo componente con comportamiento condicional (estados de carga, error, vacío, éxito).
- Todo formulario (validación y envío).
- Todo hook personalizado.
- Toda lógica de transformación o presentación de datos.
- Flujos de navegación entre vistas (tests de integración).

### 7.2 Cuándo NO aplica TDD

- Componentes puramente presentacionales sin lógica (un divisor visual, un wrapper de layout).
- Archivos de tipos puros.
- Configuración (Vite, Vitest, Tailwind, tokens).
- Tokens de diseño.

### 7.3 Filosofía: probar comportamiento, no implementación

Las pruebas describen lo que el usuario percibe, no la estructura interna del componente.

Bueno:

```tsx
it("muestra un mensaje de error cuando el correo es invalido", async () => {
  const usuario = userEvent.setup();
  renderizarConProveedores(<FormularioLogin />);
  await usuario.type(screen.getByLabelText(/correo/i), "no-es-correo");
  await usuario.tab();
  expect(screen.getByText(/correo invalido/i)).toBeInTheDocument();
});
```

Malo (acopla la prueba a la implementación):

```tsx
it("actualiza el estado de errores", () => {
  const { result } = renderHook(() => useEstadoFormulario());
  act(() => result.current.setError("correo", "Invalido"));
  expect(result.current.errores.correo).toBe("Invalido");
});
```

Los tests no deben inspeccionar estado interno; deben validar lo que el usuario ve.

### 7.4 Pirámide de pruebas para frontend

| Nivel | Cantidad | Velocidad | Aislamiento |
| --- | --- | --- | --- |
| Unitarias de componentes | Muchas (60-70%) | < 100 ms | Componente solo, MSW para HTTP |
| Integración de flujos | Algunas (25-35%) | < 500 ms | Varios componentes + MSW |
| End-to-end (Playwright) | Fuera de alcance del prototipo | — | — |

### 7.5 Helper de renderizado

Todos los componentes que dependen de proveedores (Router, QueryClient, Sesión) se renderizan con un helper centralizado:

```tsx
// tests/ayudas/renderizar-con-proveedores.tsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderizarConProveedores(
  ui: React.ReactElement,
  opciones: { rutaInicial?: string } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[opciones.rutaInicial ?? "/"]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}
```

Prohibido renderizar componentes con dependencias de proveedores sin usar este helper.

### 7.6 Mock Service Worker

Todos los endpoints del backend se mockean con MSW en `tests/mocks/handlers.ts`. Cada test puede sobrescribir un handler específico para probar casos particulares (respuesta de error, latencia, datos inesperados).

---

## 8. Mapeo entre vistas y requerimientos

| Módulo | Vista | RF | CU |
| --- | --- | --- | --- |
| Sesión | Iniciar sesión | RF-02 | CU-01 |
| Sesión | Registro | RF-01 | — |
| Sesión | Perfil / Cerrar sesión | RF-03 | CU-02 |
| Servicios | Panel de servicios activos | RF-16 | CU-08 |
| Servicios | Crear servicio (asistente) | RF-05 a RF-08 | CU-03 |
| Servicios | Detalle de servicio | RF-17, RF-12 a RF-14 | CU-06, CU-07 |
| Servicios | Capacidad del servidor | RF-10 | (apoya CU-04) |
| Monitoreo | Histórico de operaciones | RF-15 | CU-09 |
| Monitoreo | Gráficas de métricas | RF-18 | (apoya CU-08) |
| Aprendizaje | Mi ruta | RF-22 | CU-13 |
| Aprendizaje | Actividad | RF-23 | CU-12 |
| Aprendizaje | Evaluación | RF-24 | CU-14 |
| Administración | Gestión de módulos | RF-20 | CU-10 |
| Administración | Asignación de rutas | RF-21 | CU-11 |
| Administración | Reportes | RF-25 | CU-15 |
| Administración | Exportación | RF-26 | CU-16 |

Al crear una vista nueva, registra en un comentario al inicio del archivo y de su archivo de pruebas los RF y CU que cubre.

---

## 9. Skills disponibles

En `.claude/skills/`:

- **`ciclo-tdd`** — flujo Red-Green-Refactor obligatorio. Consúltalo antes de cualquier otro skill cuando vayas a escribir código nuevo.
- **`nueva-vista-react`** — crear una vista nueva respetando la estructura por módulos, el sistema de diseño, accesibilidad y TDD.
- **`trazabilidad-requerimientos`** — formato de mensajes de commit y comentarios para mantener referencias con RF, RNF y CU.

Si una tarea solicitada coincide con el alcance de un skill, léelo y síguelo.

---

## 10. Comandos comunes

| Acción | Comando |
| --- | --- |
| Instalar dependencias | `npm install` |
| Servidor de desarrollo | `npm run dev` |
| Compilar | `npm run build` |
| Previsualizar build | `npm run preview` |
| **Correr todas las pruebas** | **`npm test`** |
| **Pruebas en modo watch** | **`npm run test:watch`** |
| **Pruebas con cobertura** | **`npm run test:coverage`** |
| **Solo unitarias** | **`npm run test:unit`** |
| **Solo integración** | **`npm run test:integration`** |
| Lintar y formatear | `npm run lint`, `npm run format` |

Scripts esperados en `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:unit": "vitest run tests/unitarias",
  "test:integration": "vitest run tests/integracion",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write \"src/**/*.{ts,tsx}\" \"tests/**/*.{ts,tsx}\""
}
```

---

## 11. Reglas para Claude Code al modificar este repositorio

1. **Antes de escribir código de producción, escribe la prueba que lo justifique.** (Excepciones en sección 7.2.)
2. **No introduzcas componentes de UI sueltos.** Si un control no está en `componentes-comunes/`, agrégalo allí y luego úsalo.
3. **No agregues llamadas HTTP fuera del cliente centralizado.** Toda integración con el backend pasa por `cliente-http.ts` y por hooks de TanStack Query.
4. **No uses estilos en línea con valores arbitrarios.** El sistema de diseño es la única fuente de verdad (RNF-03).
5. **Toda acción irreversible necesita confirmación** y su prueba correspondiente.
6. **Las pruebas validan comportamiento, no implementación.** Prefiere `getByRole` y `getByLabelText` sobre `getByTestId`.
7. **Toda llamada HTTP en tests pasa por MSW.** Si un test causa una petición no mockeada, el test falla.
8. **Cada cambio funcional acompaña su referencia a RF, RNF o CU** en el comentario inicial del archivo y en el mensaje del commit.
9. **No uses emojis en código, comentarios, mensajes de commit ni documentación generada.**
10. **No marques un cambio como terminado si las pruebas no pasan localmente.** Tampoco si la cobertura cae por debajo de los umbrales.

---

## 12. Referencias rápidas

- Diagrama de interfaz de usuario: sección 4.2.15.
- Casos de uso: sección 4.2.8 (CU-01 a CU-16).
- Catálogo de RF: sección 4.2.6.1.1.
- Catálogo de RNF: sección 4.2.6.1.2.
- Diagrama de componentes: sección 4.2.16.
- Diagrama de estados del servicio: sección 4.2.14.
- Mockups detallados de cada vista: sección 4.2.18.
