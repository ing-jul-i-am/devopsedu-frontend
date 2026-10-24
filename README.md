# DevOpsEdu — Frontend

Interfaz web de la Plataforma Educativa para Gestión DevOps (DevOpsEdu). Sustituye la línea de comandos por formularios guiados con validación inmediata para que los estudiantes configuren, desplieguen y monitoreen contenedores Docker, y ofrece al docente la gestión de módulos y rutas de aprendizaje.

- Autor: Julian Andrés Barrera García, Universidad Mariano Gálvez de Guatemala.
- Backend asociado: repositorio `devopsedu-backend`.
- Cubre: RNF-16 (documentación técnica).

## Stack

| Aspecto | Tecnología |
| --- | --- |
| Lenguaje | TypeScript 5 (modo estricto) |
| UI y bundler | React 18 y Vite 5 |
| Enrutamiento | React Router 6 |
| Estilos | Tailwind CSS 3, con tokens en `src/diseno/tokens.ts` |
| Componentes accesibles | Radix UI (diálogo y selector) |
| Estado de servidor y HTTP | TanStack Query 5 y Axios |
| Formularios | React Hook Form y Zod |
| Gráficas | Recharts |
| Contenido educativo | `react-markdown` (lectura) y TipTap (edición, ver `DT-07` y `DT-08`) |
| Iconos | Lucide React |
| Pruebas | Vitest, React Testing Library, happy-dom y MSW |

## Arquitectura

El frontend es solo la capa de presentación: valida formato y obligatoriedad de campos, presenta el estado del sistema y traduce las interacciones en peticiones HTTP. No contiene lógica de negocio propia.

| Capa | Carpetas |
| --- | --- |
| Vistas (una por ruta) | `src/modulos/<modulo>/paginas/` |
| Componentes de dominio | `src/modulos/<modulo>/componentes/` |
| Hooks de TanStack Query | `src/modulos/<modulo>/hooks/` |
| Cliente HTTP y piezas transversales | `src/infraestructura/` |

Además, `src/componentes-comunes/` reúne los controles reutilizables (botones, campos, diálogos de confirmación, tarjetas), `src/enrutamiento/` define las rutas, las guardas de sesión y rol y el diseño autenticado, y `src/tipos/` contiene los tipos que reflejan el contrato de la API.

Toda petición pasa por `src/infraestructura/cliente-http.ts`. Sus interceptores anexan el token JWT y, ante un `401`, cierran la sesión local y redirigen a iniciar sesión.

## Requisitos

- Node.js 20 o superior y npm.
- El backend `devopsedu-backend` en marcha para usar la aplicación. Las pruebas no lo necesitan, porque simulan la API con MSW.

## Puesta en marcha

```bash
# 1. Levantar el backend (ver su README: Docker Compose, migraciones y seed)
#    Por defecto queda en http://localhost:3000

# 2. Dependencias del frontend
npm install

# 3. Variables de entorno
cp .env.example .env

# 4. Servidor de desarrollo (http://localhost:5173)
npm run dev
```

Para entrar como docente se usa la cuenta administradora que crea el seed del backend (`admin@devopsedu.local`; la contraseña está en el README del backend). Las cuentas creadas desde la vista de registro siempre reciben el rol `estudiante`, porque el backend no acepta el rol desde el cliente (`DT-01`).

### Problemas frecuentes

- **Las peticiones fallan por CORS en el navegador.** El backend solo autoriza los orígenes de `CORS_ORIGENES`, que por defecto son `http://localhost:5173` y `http://127.0.0.1:5173`. Si Vite arranca en otro puerto porque el 5173 está ocupado, agrega ese origen en el `.env` del backend.
- **Un docente es redirigido al panel principal al abrir Administración.** Las guardas de rol comparan el `idRol` numérico: `estudiante = 1` y `docente = 2` (`src/tipos/roles.ts`, `DT-01`). Si el seed del backend asignara otros ids, hay que ajustar ese archivo.

## Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `VITE_API_URL` | No (`http://localhost:3000`) | URL base del backend. El prefijo `/api` se agrega en `src/infraestructura/configuracion.ts` |

Vite incrusta las variables `VITE_*` en el bundle al compilar, así que un cambio en `.env` requiere reiniciar `npm run dev` o volver a ejecutar `npm run build`.

## Pruebas

El proyecto sigue TDD (ver `.claude/skills/ciclo-tdd`): toda funcionalidad nueva empieza por una prueba que falla. Las pruebas describen lo que el usuario percibe y buscan los elementos por rol o etiqueta (`getByRole`, `getByLabelText`), lo que también verifica la accesibilidad (RNF-05).

| Acción | Comando |
| --- | --- |
| Toda la suite | `npm test` |
| Solo unitarias | `npm run test:unit` |
| Solo integración | `npm run test:integration` |
| Con cobertura | `npm run test:coverage` |
| Modo watch | `npm run test:watch` |

- `tests/unitarias/` refleja la estructura de `src/`; `tests/integracion/` cubre flujos que cruzan varias vistas.
- Toda petición HTTP se intercepta con MSW (`tests/mocks/handlers.ts`). Una petición sin handler hace fallar la prueba, de modo que cada interacción con el backend queda documentada.
- Los componentes que necesitan Router o QueryClient se renderizan con `tests/ayudas/renderizar-con-proveedores.tsx`.
- Umbrales de cobertura: 75% en líneas, funciones y declaraciones, y 70% en ramas.
- Revisa que la salida no reporte "Unhandled errors": Vitest los muestra aparte, y una prueba puede seguir en verde aunque el componente haya fallado.

## Otros comandos

| Acción | Comando |
| --- | --- |
| Compilar (verifica tipos y genera `dist/`) | `npm run build` |
| Previsualizar lo compilado | `npm run preview` |
| Lint | `npm run lint` |
| Formato | `npm run format` |

## Mapa de vistas

| Módulo | Vista | Ruta | Acceso | Requerimientos |
| --- | --- | --- | --- | --- |
| Sesión | Iniciar sesión | `/iniciar-sesion` | Sin sesión | RF-02, CU-01 |
| Sesión | Registro | `/registro` | Sin sesión | RF-01 |
| Sesión | Perfil y cierre de sesión | `/perfil` | Con sesión | RF-03, CU-02 |
| Principal | Panel principal | `/` | Con sesión | RF-10, RF-16, RF-22 |
| Servicios | Panel de servicios | `/servicios` | Estudiante, docente | RF-16, CU-08 |
| Servicios | Crear servicio (asistente) | `/servicios/nuevo` | Estudiante, docente | RF-05 a RF-07, RF-09, CU-03 |
| Servicios | Detalle de servicio | `/servicios/:idServicio` | Estudiante, docente | RF-11 a RF-14, RF-17, CU-05, CU-06 |
| Servicios | Editar configuración | `/servicios/:idServicio/configuracion` | Estudiante, docente | RF-08, CU-07 |
| Servicios | Capacidad del servidor | `/capacidad-servidor` | Con sesión | RF-10, CU-04 |
| Monitoreo | Histórico de operaciones | `/monitoreo/historico` | Estudiante, docente | RF-15, CU-09 |
| Monitoreo | Gráficas de métricas | `/monitoreo/metricas` | Estudiante, docente | RF-18, RF-19 |
| Aprendizaje | Mi ruta | `/aprendizaje/mi-ruta` | Estudiante | RF-22, CU-13 |
| Aprendizaje | Contenido y actividad del módulo | `/aprendizaje/modulos/:idModulo` | Estudiante | RF-23, CU-12 |
| Aprendizaje | Evaluación | `/aprendizaje/modulos/:idModulo/evaluacion` | Estudiante | RF-24, CU-14 |
| Administración | Gestión de módulos | `/administracion/modulos` | Docente | RF-20, CU-10 |
| Administración | Crear y editar módulo | `/administracion/modulos/nuevo`, `/administracion/modulos/:idModulo` | Docente | RF-20, RF-23, RF-24, CU-10 |
| Administración | Gestión de estudiantes | `/administracion/estudiantes` | Docente | RF-21, RF-25, CU-11 |
| Administración | Reportes y exportación (CSV o PDF) | `/administracion/reportes` | Docente | RF-25, CU-15, CU-16 |

Cada vista lleva en su cabecera los RF y CU que cubre. Las rutas se definen en `src/enrutamiento/rutas.tsx`, y el menú lateral, en `src/componentes-comunes/barra-navegacion.tsx`.

## Estado

Implementados los cinco módulos de interfaz, con una vista para cada RF del catálogo del diseño (RF-01 a RF-25). Reportes y Exportación comparten la vista `/administracion/reportes` (`DT-18`). Solo existen los roles `estudiante` y `docente`: el perfil investigador del diseño se descartó. Siguen pendientes del backend la edición del perfil propio (RF-04, `DT-03`) y la comparación exacta de la imagen Docker al evaluar actividades (`DT-14`). El detalle por etapa está en [`docs/plan-de-desarrollo.md`](docs/plan-de-desarrollo.md).

## Documentación

- [`docs/plan-de-desarrollo.md`](docs/plan-de-desarrollo.md): estado por etapa, próximo paso y cómo retomar el trabajo.
- [`docs/contrato-api.md`](docs/contrato-api.md): contrato de la API del backend. Es la fuente autoritativa para el cliente HTTP, los hooks y los mocks de MSW.
- [`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md): decisiones técnicas (`DT-01` en adelante) que complementan o ajustan el diseño.
- [`CLAUDE.md`](CLAUDE.md): convenciones, sistema de diseño, accesibilidad y política de TDD.
- Documento de diseño técnico del proyecto: fuente de los RF, RNF y CU citados en el código.
